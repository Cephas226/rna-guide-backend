-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PRODUCTEUR', 'AGENT_TERRAIN', 'SUPERVISEUR', 'ADMIN');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('SYNCED', 'PENDING', 'CONFLICT', 'DELETED');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('FEUILLES', 'FRUITS', 'FLEURS', 'GOUSSES', 'ECORCES', 'BOIS', 'COMBUSTIBLE');

-- CreateEnum
CREATE TYPE "HealthState" AS ENUM ('BON', 'MOYEN', 'MAUVAIS');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('HIVERNAGE', 'SAISON_SECHE');

-- CreateEnum
CREATE TYPE "ConflictResolution" AS ENUM ('CLIENT_WINS', 'SERVER_WINS', 'MANUAL');

-- CreateEnum
CREATE TYPE "SyncAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PRODUCTEUR',
    "region" TEXT,
    "province" TEXT,
    "commune" TEXT,
    "village" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "deviceId" TEXT,
    "deviceModel" TEXT,
    "appVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcels" (
    "id" TEXT NOT NULL,
    "localId" TEXT,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "superficie" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "geometry" JSONB,
    "gpsPoints" JSONB,
    "ownerId" TEXT NOT NULL,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'SYNCED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "parcels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_points" (
    "id" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "localId" TEXT,
    "parcelId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "photoPointId" TEXT,
    "storageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "originalName" TEXT,
    "sizeBytes" INTEGER,
    "mimeType" TEXT NOT NULL DEFAULT 'image/jpeg',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "altitude" DOUBLE PRECISION,
    "takenAt" TIMESTAMP(3) NOT NULL,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "localPath" TEXT,
    "notes" TEXT,
    "year" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "species" (
    "id" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "localNameFr" TEXT,
    "localNameMoore" TEXT,
    "localNameDioula" TEXT,
    "localNameFulfule" TEXT,
    "commonName" TEXT,
    "category" TEXT NOT NULL,
    "isNative" BOOLEAN NOT NULL DEFAULT true,
    "ecologicalRole" TEXT,
    "usageDescription" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventories" (
    "id" TEXT NOT NULL,
    "localId" TEXT,
    "parcelId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "season" "Season" NOT NULL,
    "totalPieds" INTEGER NOT NULL DEFAULT 0,
    "selectedPieds" INTEGER NOT NULL DEFAULT 0,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'SYNCED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "observations" TEXT,
    "validatedAt" TIMESTAMP(3),
    "validatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_species" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    "totalPieds" INTEGER NOT NULL,
    "selectedPieds" INTEGER NOT NULL,
    "healthState" "HealthState" NOT NULL DEFAULT 'BON',
    "heightCm" DOUBLE PRECISION,
    "notes" TEXT,
    "isNewSpecies" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "inventory_species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exploitations" (
    "id" TEXT NOT NULL,
    "localId" TEXT,
    "parcelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productType" "ProductType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "usage" TEXT,
    "priceXOF" DOUBLE PRECISION,
    "buyerInfo" TEXT,
    "exploitedAt" TIMESTAMP(3) NOT NULL,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'SYNCED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exploitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formations" (
    "id" TEXT NOT NULL,
    "titleFr" TEXT NOT NULL,
    "titleMoore" TEXT,
    "titleDioula" TEXT,
    "titleFulfule" TEXT,
    "contentFr" TEXT NOT NULL,
    "contentMoore" TEXT,
    "contentDioula" TEXT,
    "contentFulfule" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "mediaUrls" JSONB NOT NULL DEFAULT '[]',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "localId" TEXT,
    "action" "SyncAction" NOT NULL,
    "payload" JSONB NOT NULL,
    "conflictWith" JSONB,
    "resolution" "ConflictResolution",
    "errorMessage" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_region_idx" ON "users"("role", "region");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_key" ON "password_resets"("token");

-- CreateIndex
CREATE INDEX "password_resets_token_idx" ON "password_resets"("token");

-- CreateIndex
CREATE UNIQUE INDEX "parcels_localId_key" ON "parcels"("localId");

-- CreateIndex
CREATE INDEX "parcels_region_province_idx" ON "parcels"("region", "province");

-- CreateIndex
CREATE INDEX "parcels_ownerId_idx" ON "parcels"("ownerId");

-- CreateIndex
CREATE INDEX "parcels_localId_idx" ON "parcels"("localId");

-- CreateIndex
CREATE INDEX "parcels_syncStatus_idx" ON "parcels"("syncStatus");

-- CreateIndex
CREATE INDEX "photo_points_parcelId_idx" ON "photo_points"("parcelId");

-- CreateIndex
CREATE UNIQUE INDEX "photos_localId_key" ON "photos"("localId");

-- CreateIndex
CREATE INDEX "photos_parcelId_takenAt_idx" ON "photos"("parcelId", "takenAt");

-- CreateIndex
CREATE INDEX "photos_authorId_idx" ON "photos"("authorId");

-- CreateIndex
CREATE INDEX "photos_syncStatus_idx" ON "photos"("syncStatus");

-- CreateIndex
CREATE UNIQUE INDEX "species_scientificName_key" ON "species"("scientificName");

-- CreateIndex
CREATE UNIQUE INDEX "inventories_localId_key" ON "inventories"("localId");

-- CreateIndex
CREATE INDEX "inventories_parcelId_year_idx" ON "inventories"("parcelId", "year");

-- CreateIndex
CREATE INDEX "inventories_agentId_idx" ON "inventories"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "inventories_parcelId_year_season_key" ON "inventories"("parcelId", "year", "season");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_species_inventoryId_speciesId_key" ON "inventory_species"("inventoryId", "speciesId");

-- CreateIndex
CREATE UNIQUE INDEX "exploitations_localId_key" ON "exploitations"("localId");

-- CreateIndex
CREATE INDEX "exploitations_parcelId_exploitedAt_idx" ON "exploitations"("parcelId", "exploitedAt");

-- CreateIndex
CREATE INDEX "exploitations_productType_idx" ON "exploitations"("productType");

-- CreateIndex
CREATE INDEX "formations_category_isPublished_idx" ON "formations"("category", "isPublished");

-- CreateIndex
CREATE INDEX "sync_logs_userId_syncedAt_idx" ON "sync_logs"("userId", "syncedAt");

-- CreateIndex
CREATE INDEX "sync_logs_entityType_entityId_idx" ON "sync_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "sync_logs_deviceId_idx" ON "sync_logs"("deviceId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_points" ADD CONSTRAINT "photo_points_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_photoPointId_fkey" FOREIGN KEY ("photoPointId") REFERENCES "photo_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_species" ADD CONSTRAINT "inventory_species_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_species" ADD CONSTRAINT "inventory_species_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exploitations" ADD CONSTRAINT "exploitations_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exploitations" ADD CONSTRAINT "exploitations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
