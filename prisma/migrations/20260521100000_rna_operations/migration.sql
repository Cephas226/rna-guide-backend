-- CreateEnum
CREATE TYPE "RnaCategory" AS ENUM ('ENTRETIEN', 'CES_DRS');

-- CreateTable
CREATE TABLE "rna_operations" (
    "id" TEXT NOT NULL,
    "localId" TEXT,
    "parcelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "RnaCategory" NOT NULL,
    "operationType" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "notes" TEXT,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'SYNCED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rna_operations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rna_operations_localId_key" ON "rna_operations"("localId");
CREATE INDEX "rna_operations_parcelId_idx" ON "rna_operations"("parcelId");
CREATE INDEX "rna_operations_userId_idx" ON "rna_operations"("userId");

-- AddForeignKey
ALTER TABLE "rna_operations" ADD CONSTRAINT "rna_operations_parcelId_fkey"
  FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "rna_operations" ADD CONSTRAINT "rna_operations_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
