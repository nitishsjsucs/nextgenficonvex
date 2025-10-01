// agent-voice.ts (LIVE via LISTEN/NOTIFY, precise scheduling, loud logs)
import 'dotenv/config';
import Twilio from 'twilio';
import createSubscriber from 'pg-listen';
import { prisma } from './lib/prisma';

const client = Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

const FROM = process.env.TWILIO_FROM!;
const IVR_BASE = process.env.IVR_BASE_URL!;
const THRESHOLD_SECONDS = Number(process.env.CALL_THRESHOLD_SECONDS || 900);

// IMPORTANT: use Neon's **direct** connection (no "-pooler") for LISTEN/NOTIFY
// e.g. postgres://user:pass@ep-xxxx-xxxxx.us-east-2.aws.neon.tech/db?sslmode=require
const DIRECT_URL = process.env.DIRECT_DATABASE_URL!;
if (!DIRECT_URL) {
  console.error('[fatal] DIRECT_DATABASE_URL is required (use Neon direct host, not "-pooler").');
  process.exit(1);
}

// ---- runtime guards/dedup ----
const CALLED = new Set<string>();                     // numbers called in this runtime
const TIMERS = new Map<string, NodeJS.Timeout>();     // userId -> timeout handle
const ACTIVE_STATUSES = ['queued', 'ringing', 'in-progress'] as const;

// ---- helpers ----
async function isActiveCall(toE164: string): Promise<boolean> {
  for (const status of ACTIVE_STATUSES) {
    try {
      const list = await client.calls.list({ to: toE164, status, limit: 1 });
      if (list.length > 0) {
        console.log(`[skip] active Twilio call: ${toE164} status=${status}`);
        return true;
      }
    } catch (e: any) {
      console.warn(`[warn] active-call check failed: ${toE164} -> ${e?.message || e}`);
    }
  }
  return false;
}

function toEpochMs(createdAt: number | string | undefined): number | null {
  if (createdAt == null) return null;
  if (typeof createdAt === 'number') return createdAt * 1000; // epoch seconds -> ms
  const t = Date.parse(createdAt);                             // ISO string -> ms
  return Number.isFinite(t) ? t : null;
}

/**
 * Schedule the outbound call to fire exactly X seconds after account creation.
 * We use the event receive time as ground-truth to avoid TZ drift, and clamp
 * weird future createdAt values (timestamp-without-time-zone pitfalls).
 */
function scheduleCall(
  p: { id: string; phoneNumber?: string | null; createdAt?: number | string },
  receivedAtMs: number
) {
  const to = (p.phoneNumber || '').trim();
  if (!to) return console.log(`[skip] no phoneNumber for user=${p.id}`);
  if (CALLED.has(to)) return console.log(`[skip] already called this runtime: ${to}`);
  if (TIMERS.has(p.id)) return console.log(`[skip] timer already set for user=${p.id}`);

  let createdMs = toEpochMs(p.createdAt);
  // If createdAt is missing or >60s in the future, treat "now" as creation time.
  if (createdMs == null || createdMs - Date.now() > 60_000) {
    createdMs = receivedAtMs;
  }

  const elapsed = Math.max(0, Date.now() - createdMs);
  const delay = Math.max(0, THRESHOLD_SECONDS * 1000 - elapsed);

  console.log(
    `[schedule] user=${p.id} to=${to} delay=${Math.round(delay / 1000)}s (elapsed=${Math.round(
      elapsed / 1000
    )}s, threshold=${THRESHOLD_SECONDS}s)`
  );

  const t = setTimeout(async () => {
    TIMERS.delete(p.id);

    // Final safety checks right before dialing
    const user = await prisma.user.findUnique({ where: { id: p.id } });
    if (!user) return console.log(`[skip] user disappeared: ${p.id}`);
    if (user.kycVerified) return console.log(`[skip] already verified: ${p.id}`);
    if (!user.phoneNumber) return console.log(`[skip] phone missing at call time: ${p.id}`);

    const dest = user.phoneNumber.trim();
    if (CALLED.has(dest)) return console.log(`[skip] already called: ${dest}`);
    if (await isActiveCall(dest)) return;

    // Friendly nudge re: E.164 for Twilio trial/production
    if (!dest.startsWith('+')) {
      console.warn(
        `[warn] number not E.164 (${dest}) — Twilio expects +<countrycode><number> (e.g., +14155552671)`
      );
    }

    try {
      console.log(`[call] creating to=${dest} user=${user.id}`);
      const call = await client.calls.create({
        to: dest,
        from: FROM,
        url: `${IVR_BASE}/voice/start?userId=${encodeURIComponent(user.id)}`,
        statusCallback: `${IVR_BASE}/voice/status?userId=${encodeURIComponent(
          user.id
        )}&to=${encodeURIComponent(dest)}`,
        statusCallbackMethod: 'POST',
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      });
      console.log(`[call] sid=${call.sid} to=${dest}`);
      CALLED.add(dest);
    } catch (e: any) {
      console.error(`[error] call failed to=${dest} user=${user.id} ->`, e?.message || e);
    }
  }, delay);

  TIMERS.set(p.id, t);
}

// ---- main ----
async function main() {
  console.log(
    `[boot] LIVE LISTEN/NOTIFY. threshold=${THRESHOLD_SECONDS}s IVR_BASE=${IVR_BASE} FROM=${FROM}`
  );
  console.log(`[boot] DIRECT_DATABASE_URL must be a Neon direct host (no "-pooler").`);

  // Backfill recent users (so restarts don’t miss anyone created in the last Xs)
  const cutoff = new Date(Date.now() - THRESHOLD_SECONDS * 1000);
  const recent = await prisma.user.findMany({
    where: { kycVerified: false, createdAt: { gte: cutoff }, phoneNumber: { not: '' } },
    take: 100,
  });
  for (const u of recent) {
    scheduleCall(
      { id: u.id, phoneNumber: u.phoneNumber, createdAt: u.createdAt.toISOString() },
      Date.now()
    );
  }

  // Live subscriber (LISTEN user_signup) on a direct Postgres session connection
  const subscriber = createSubscriber({ connectionString: DIRECT_URL });
  subscriber.events.on('error', (e) => console.error('[pg-listen] error', e));
  subscriber.events.on('reconnect', () => console.log('[pg-listen] reconnected'));
  subscriber.events.on('connected', () => console.log('[pg-listen] connected (direct compute)'));

  subscriber.notifications.on('user_signup', (payload: any) => {
    const receivedAtMs = Date.now();
    const p =
      typeof payload === 'string'
        ? (JSON.parse(payload) as { id: string; phoneNumber?: string | null; createdAt?: number | string })
        : payload;
    console.log('[event] user_signup', p);
    scheduleCall(p, receivedAtMs);
  });

  await subscriber.connect();
  await subscriber.listenTo('user_signup');
  console.log('[pg-listen] LISTEN user_signup');
}

main().catch((e) => {
  console.error('[fatal]', e);
  process.exit(1);
});
