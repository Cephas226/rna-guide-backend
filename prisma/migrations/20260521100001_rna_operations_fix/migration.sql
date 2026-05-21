-- Fix cascade on parcel FK
ALTER TABLE "rna_operations" DROP CONSTRAINT "rna_operations_parcelId_fkey";
ALTER TABLE "rna_operations" ADD CONSTRAINT "rna_operations_parcelId_fkey"
  FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Fix index: replace single-column with composite
DROP INDEX IF EXISTS "rna_operations_parcelId_idx";
CREATE INDEX "rna_operations_parcelId_year_month_idx" ON "rna_operations"("parcelId", "year", "month");
