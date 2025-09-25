/*
  Warnings:

  - Added the required column `dateOfBirth` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ssn` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "dateOfBirth" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "ssn" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."earthquake" (
    "id" TEXT NOT NULL,
    "time" BIGINT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "mag" DOUBLE PRECISION,
    "place" TEXT,
    "depth_km" DOUBLE PRECISION,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "earthquake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."person" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "house_value" INTEGER NOT NULL,
    "has_insurance" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."campaign" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "earthquake_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "risk_level" TEXT NOT NULL,
    "distance_km" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "earthquake_latitude_longitude_idx" ON "public"."earthquake"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "earthquake_mag_idx" ON "public"."earthquake"("mag");

-- CreateIndex
CREATE INDEX "earthquake_time_idx" ON "public"."earthquake"("time");

-- CreateIndex
CREATE UNIQUE INDEX "person_email_key" ON "public"."person"("email");

-- CreateIndex
CREATE INDEX "person_latitude_longitude_idx" ON "public"."person"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "person_house_value_idx" ON "public"."person"("house_value");

-- CreateIndex
CREATE INDEX "person_has_insurance_idx" ON "public"."person"("has_insurance");

-- CreateIndex
CREATE INDEX "person_city_state_idx" ON "public"."person"("city", "state");

-- CreateIndex
CREATE INDEX "campaign_person_id_idx" ON "public"."campaign"("person_id");

-- CreateIndex
CREATE INDEX "campaign_earthquake_id_idx" ON "public"."campaign"("earthquake_id");

-- CreateIndex
CREATE INDEX "campaign_risk_level_idx" ON "public"."campaign"("risk_level");

-- CreateIndex
CREATE INDEX "campaign_createdAt_idx" ON "public"."campaign"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."campaign" ADD CONSTRAINT "campaign_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaign" ADD CONSTRAINT "campaign_earthquake_id_fkey" FOREIGN KEY ("earthquake_id") REFERENCES "public"."earthquake"("id") ON DELETE CASCADE ON UPDATE CASCADE;
