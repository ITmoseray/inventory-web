-- DropForeignKey
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_productId_fkey";

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "externalCostPrice" DECIMAL(10,2),
ADD COLUMN     "externalSourceName" TEXT,
ADD COLUMN     "isExternalSourced" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "productName" TEXT,
ALTER COLUMN "productId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
