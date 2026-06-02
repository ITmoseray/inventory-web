-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PRODUCT', 'SERVICE');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isNetworkAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalBusinessId" TEXT,
ADD COLUMN     "originalProductId" TEXT,
ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'PRODUCT';

-- CreateIndex
CREATE INDEX "Product_isNetworkAvailable_idx" ON "Product"("isNetworkAvailable");
