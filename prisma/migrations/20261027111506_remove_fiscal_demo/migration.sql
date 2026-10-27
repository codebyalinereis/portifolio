/*
  Warnings:

  - You are about to drop the `Dataset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NfeInvoice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NfeInvoice" DROP CONSTRAINT "NfeInvoice_datasetId_fkey";

-- DropTable
DROP TABLE "Dataset";

-- DropTable
DROP TABLE "NfeInvoice";

-- DropEnum
DROP TYPE "DatasetStatus";

-- DropEnum
DROP TYPE "NfeCategory";
