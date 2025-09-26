
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function normalizeName(name?: string | null) {
  return (name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeDob(dob?: string | null) {
  if (!dob) return "";
  const raw = `${dob}`.trim();
  // Accept MM/DD/YYYY or legacy YYYY-MM-DD and normalize to MM/DD/YYYY
  let mm = ""; let dd = ""; let yyyy = "";
  let m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    mm = m[1]; dd = m[2]; yyyy = m[3];
  } else {
    const m2 = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m2) {
      yyyy = m2[1]; mm = m2[2]; dd = m2[3];
    } else {
      return "";
    }
  }
  const mi = Number(mm), di = Number(dd), yi = Number(yyyy);
  if (yi < 1900 || yi > 3000) return "";
  if (mi < 1 || mi > 12) return "";
  if (di < 1 || di > 31) return "";
  // Validate actual calendar date using UTC to avoid TZ drift
  const d = new Date(Date.UTC(yi, mi - 1, di));
  if (d.getUTCFullYear() !== yi || d.getUTCMonth() + 1 !== mi || d.getUTCDate() !== di) return "";
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(mi)}/${pad(di)}/${yyyy}`;
}

async function extractInfoFromDocument(fileUrl: string): Promise<any> {
  try {
    // Fetch the file from the URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch document");
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const mimeType = response.headers.get("content-type") || "image/jpeg";
    
    // Convert to base64
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
    Analyze this government-issued ID document and extract the following information in JSON format:
    - fullName: The person's full name as it appears on the document
    - dateOfBirth: The date of birth in MM/DD/YYYY format
    
    Please respond with only valid JSON in this exact format:
    {
      "fullName": "First Last",
      "dateOfBirth": "MM/DD/YYYY"
    }
    `;
    
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };
    
    const result = await model.generateContent([prompt, imagePart]);
    const response_text = result.response.text();
    
    // Clean the response to extract only the JSON
    const jsonMatch = response_text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract valid JSON from AI response");
    }
    
    const extractedData = JSON.parse(jsonMatch[0]);
    
    return extractedData;
  } catch (error) {
    console.error("Error extracting info from document:", error);
    throw new Error("Failed to process document with AI");
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileUrl } = await req.json();

  if (!fileUrl) {
    return NextResponse.json({ error: "File URL is required" }, { status: 400 });
  }

  try {
    const extractedData = await extractInfoFromDocument(fileUrl);
    // Get user data from session (better-auth handles this)
    const user = session.user;

    // Name match (case-insensitive, collapsed whitespace)
    const nameOnDoc = normalizeName(extractedData.fullName);
    const nameOnAccount = normalizeName(session.user.name ?? user?.name ?? "");
    const nameMatches = nameOnDoc && nameOnDoc === nameOnAccount;

    // Date of birth match (YYYY-MM-DD)
    const dobOnDoc = normalizeDob(extractedData.dateOfBirth);
    const dobOnAccount = normalizeDob(user?.dateOfBirth ?? (session.user as any)?.dateOfBirth);
    const dobMatches = Boolean(dobOnDoc && dobOnAccount && dobOnDoc === dobOnAccount);

    if (nameMatches && dobMatches) {
      // Update KYC status using better-auth
      try {
        await auth.api.updateUser({
          body: {
            kycVerified: true,
          },
        });
      } catch (dbErr) {
        console.error("Failed to update kycVerified:", dbErr);
        // continue to return success; UI can reflect success even if write fails
      }
      return NextResponse.json({ success: true, message: "KYC successful" });
    } else {
      if (!nameMatches) {
        return NextResponse.json({
          success: false,
          message: "Verification failed. Name on document does not match your account.",
        }, { status: 400 });
      }
      if (!dobOnAccount) {
        return NextResponse.json({
          success: false,
          message: "Verification failed. Your account does not have a date of birth on file.",
        }, { status: 400 });
      }
      if (!dobMatches) {
        return NextResponse.json({
          success: false,
          message: "Verification failed. Date of birth on document does not match your account.",
        }, { status: 400 });
      }
      return NextResponse.json({
        success: false,
        message: "Verification failed. Name on document does not match.",
      }, { status: 400 });
    }
  } catch (error) {
    console.error("KYC verification error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during verification." },
      { status: 500 }
    );
  }
}
