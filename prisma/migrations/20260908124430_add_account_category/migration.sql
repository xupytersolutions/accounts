-- AlterTable
ALTER TABLE "vault_entries" ADD COLUMN     "category" TEXT,
ADD COLUMN     "color" TEXT DEFAULT '#006FEE',
ADD COLUMN     "icon" TEXT;
