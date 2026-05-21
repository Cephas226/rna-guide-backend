-- AlterTable
ALTER TABLE "inventory_species" DROP COLUMN "healthState",
DROP COLUMN "heightCm",
DROP COLUMN "isNewSpecies",
ADD COLUMN     "piedsH1" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "piedsH2" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "piedsH3" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "totalPieds" SET DEFAULT 0,
ALTER COLUMN "selectedPieds" SET DEFAULT 0;

-- DropEnum
DROP TYPE "HealthState";
