-- CreateTable
CREATE TABLE "public"."weather_event" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "description" TEXT,
    "rainfall" DOUBLE PRECISION,
    "wind_speed" DOUBLE PRECISION,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "source" TEXT,
    "source_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weather_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."weather_campaign" (
    "id" TEXT NOT NULL,
    "person_id" TEXT,
    "scout_data_id" TEXT,
    "weather_event_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "risk_level" TEXT NOT NULL,
    "distance_km" DOUBLE PRECISION NOT NULL,
    "campaign_type" TEXT NOT NULL DEFAULT 'weather_insurance',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weather_campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_event" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "url" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "sg_message_id" TEXT,
    "user_id" TEXT,
    "campaign_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "weather_event_latitude_longitude_idx" ON "public"."weather_event"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "weather_event_event_type_severity_idx" ON "public"."weather_event"("event_type", "severity");

-- CreateIndex
CREATE INDEX "weather_event_start_time_idx" ON "public"."weather_event"("start_time");

-- CreateIndex
CREATE INDEX "weather_event_location_idx" ON "public"."weather_event"("location");

-- CreateIndex
CREATE INDEX "weather_campaign_person_id_idx" ON "public"."weather_campaign"("person_id");

-- CreateIndex
CREATE INDEX "weather_campaign_scout_data_id_idx" ON "public"."weather_campaign"("scout_data_id");

-- CreateIndex
CREATE INDEX "weather_campaign_weather_event_id_idx" ON "public"."weather_campaign"("weather_event_id");

-- CreateIndex
CREATE INDEX "weather_campaign_risk_level_idx" ON "public"."weather_campaign"("risk_level");

-- CreateIndex
CREATE INDEX "weather_campaign_campaign_type_idx" ON "public"."weather_campaign"("campaign_type");

-- CreateIndex
CREATE INDEX "weather_campaign_createdAt_idx" ON "public"."weather_campaign"("createdAt");

-- CreateIndex
CREATE INDEX "email_event_type_timestamp_idx" ON "public"."email_event"("type", "timestamp");

-- CreateIndex
CREATE INDEX "email_event_campaign_id_timestamp_idx" ON "public"."email_event"("campaign_id", "timestamp");

-- CreateIndex
CREATE INDEX "email_event_user_id_timestamp_idx" ON "public"."email_event"("user_id", "timestamp");

-- CreateIndex
CREATE INDEX "email_event_email_timestamp_idx" ON "public"."email_event"("email", "timestamp");

-- AddForeignKey
ALTER TABLE "public"."weather_campaign" ADD CONSTRAINT "weather_campaign_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."weather_campaign" ADD CONSTRAINT "weather_campaign_scout_data_id_fkey" FOREIGN KEY ("scout_data_id") REFERENCES "public"."scout_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."weather_campaign" ADD CONSTRAINT "weather_campaign_weather_event_id_fkey" FOREIGN KEY ("weather_event_id") REFERENCES "public"."weather_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
