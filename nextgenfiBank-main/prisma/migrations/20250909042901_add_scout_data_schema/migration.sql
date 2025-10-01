-- AlterTable
ALTER TABLE "public"."campaign" ADD COLUMN     "scout_data_id" TEXT,
ALTER COLUMN "person_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."person" ADD COLUMN     "scout_data_id" TEXT;

-- CreateTable
CREATE TABLE "public"."scout_data" (
    "id" TEXT NOT NULL,
    "PID" TEXT,
    "HHID" TEXT,
    "FNAME" TEXT,
    "MNAME" TEXT,
    "LNAME" TEXT,
    "SUFFIX" TEXT,
    "GENDER" TEXT,
    "AGE" INTEGER,
    "DOB" TEXT,
    "ADDRID" TEXT,
    "ADDRESS" TEXT,
    "HOUSE" TEXT,
    "PREDIR" TEXT,
    "STREET" TEXT,
    "STRTYPE" TEXT,
    "POSTDIR" TEXT,
    "APTTYPE" TEXT,
    "APTNBR" TEXT,
    "CITY" TEXT,
    "STATE" TEXT,
    "ZIP" TEXT,
    "Z4" TEXT,
    "DPC" TEXT,
    "Z4TYPE" TEXT,
    "CRTE" TEXT,
    "DPV" TEXT,
    "VACANT" TEXT,
    "MSA" TEXT,
    "CBSA" TEXT,
    "STATECD" TEXT,
    "CNTYCD" TEXT,
    "CENSUSTRACT" TEXT,
    "CENSUSBLCK" TEXT,
    "CNTYSIZECD" TEXT,
    "LATITUDE" DOUBLE PRECISION,
    "LONGITUDE" DOUBLE PRECISION,
    "GEOLEVEL" TEXT,
    "PHONE" TEXT,
    "DNC" TEXT,
    "PHONE2" TEXT,
    "DNC2" TEXT,
    "PHONE3" TEXT,
    "DNC3" TEXT,
    "LOR" INTEGER,
    "HOMEOWNERCD" TEXT,
    "DWELLTYPE" TEXT,
    "MARRIEDCD" TEXT,
    "SGLPARENT" TEXT,
    "HHNBRSR" TEXT,
    "HHNBR" INTEGER,
    "SPANISHSPCD" TEXT,
    "SOHOCD" TEXT,
    "VETERANCD" TEXT,
    "CREDITCARD" TEXT,
    "CHARITYDNR" TEXT,
    "MRKTHOMEVAL" TEXT,
    "EDUCATIONCD" TEXT,
    "LANGUAGECD" TEXT,
    "EHI_V2" TEXT,
    "OCCUPATIONCD_V2" TEXT,
    "WEALTHSCR_V2" TEXT,
    "CHILD" TEXT,
    "CHILDAGECD_6" TEXT,
    "CHILDAGECD_6_10" TEXT,
    "CHILDAGECD_11_15" TEXT,
    "CHILDAGECD_16_17" TEXT,
    "CHILDNBRCD" TEXT,
    "YRBLD" TEXT,
    "MOBHOMECD" TEXT,
    "POOL" TEXT,
    "FIREPLCD" TEXT,
    "AGE_RANGE_ESTIMATED" TEXT,
    "AGE_RANGE_INFERRED" TEXT,
    "AGE_RANGE_COMBINED" TEXT,
    "CPI_APPAREL_INDEX" INTEGER,
    "CPI_AUTO_INDEX" INTEGER,
    "CPI_BARGAINS_INDEX" INTEGER,
    "CPI_BUSINESS_INDEX" INTEGER,
    "CPI_DONOR_INDEX" INTEGER,
    "CPI_FAMILY_INDEX" INTEGER,
    "CPI_HEALTH_INDEX" INTEGER,
    "CPI_HOMELIV_INDEX" INTEGER,
    "CPI_INSURANCE_INDEX" INTEGER,
    "CPI_INTERNET_INDEX" INTEGER,
    "CPI_OUTDOORS_INDEX" INTEGER,
    "CPI_PETS_INDEX" INTEGER,
    "CPI_SPORTS_INDEX" INTEGER,
    "CPI_TRAVEL_INDEX" INTEGER,
    "PROP_OWNEROCC" TEXT,
    "PROP_IND" TEXT,
    "PROP_VALCALC" TEXT,
    "PROP_YRBLD" TEXT,
    "PROP_LIVINGSQFT" TEXT,
    "PROP_BEDRMS" TEXT,
    "PROP_BATHS" TEXT,
    "PROP_POOL" TEXT,
    "PROP_FRPL" TEXT,
    "PROP_SALEDATE" TEXT,
    "PROP_SALEAMT" TEXT,
    "PROP_MTGAMT" TEXT,
    "HEQUITY_EST" DOUBLE PRECISION,
    "HEQUITY_CONF" TEXT,
    "AVM_ESTIMATE" DOUBLE PRECISION,
    "AVM_ESTIMATE_ERROR" DOUBLE PRECISION,
    "IMS_HOMEBUYER" INTEGER,
    "IMS_MTG_NEWHOME" INTEGER,
    "IMS_MTG_REFI" INTEGER,
    "IMS_MTG_HELOC" INTEGER,
    "IMS_MTG_REVERSE" INTEGER,
    "IMS_MTG_GENERAL" INTEGER,
    "IMS_MTG_OVERALL" INTEGER,
    "BUYER_SCORE" INTEGER,
    "SELLER_SCORE" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scout_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scout_data_LATITUDE_LONGITUDE_idx" ON "public"."scout_data"("LATITUDE", "LONGITUDE");

-- CreateIndex
CREATE INDEX "scout_data_HOMEOWNERCD_idx" ON "public"."scout_data"("HOMEOWNERCD");

-- CreateIndex
CREATE INDEX "scout_data_MRKTHOMEVAL_idx" ON "public"."scout_data"("MRKTHOMEVAL");

-- CreateIndex
CREATE INDEX "scout_data_EHI_V2_idx" ON "public"."scout_data"("EHI_V2");

-- CreateIndex
CREATE INDEX "scout_data_WEALTHSCR_V2_idx" ON "public"."scout_data"("WEALTHSCR_V2");

-- CreateIndex
CREATE INDEX "scout_data_CPI_INSURANCE_INDEX_idx" ON "public"."scout_data"("CPI_INSURANCE_INDEX");

-- CreateIndex
CREATE INDEX "scout_data_CITY_STATE_idx" ON "public"."scout_data"("CITY", "STATE");

-- CreateIndex
CREATE INDEX "scout_data_ZIP_idx" ON "public"."scout_data"("ZIP");

-- CreateIndex
CREATE INDEX "scout_data_AGE_idx" ON "public"."scout_data"("AGE");

-- CreateIndex
CREATE INDEX "campaign_scout_data_id_idx" ON "public"."campaign"("scout_data_id");

-- CreateIndex
CREATE INDEX "person_scout_data_id_idx" ON "public"."person"("scout_data_id");

-- AddForeignKey
ALTER TABLE "public"."person" ADD CONSTRAINT "person_scout_data_id_fkey" FOREIGN KEY ("scout_data_id") REFERENCES "public"."scout_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaign" ADD CONSTRAINT "campaign_scout_data_id_fkey" FOREIGN KEY ("scout_data_id") REFERENCES "public"."scout_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;
