-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('ELETRONICOS', 'MODA', 'CASA_DECOR', 'LIVROS_MIDIA', 'BELEZA_SAUDE', 'ALIMENTOS_BEBIDAS', 'ESPORTES_LAZER', 'OUTROS');

-- CreateEnum
CREATE TYPE "SalesChannel" AS ENUM ('ONLINE', 'LOJA_FISICA');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'BOLETO', 'DINHEIRO');

-- DropForeignKey
ALTER TABLE "NfeInvoice" DROP CONSTRAINT "NfeInvoice_datasetId_fkey";

-- DropTable
DROP TABLE "NfeInvoice";

-- DropEnum
DROP TYPE "NfeCategory";

-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "canal" "SalesChannel" NOT NULL,
    "clienteNome" TEXT NOT NULL,
    "clienteUf" VARCHAR(2) NOT NULL,
    "categoria" "ProductCategory" NOT NULL,
    "pagamento" "PaymentMethod" NOT NULL,
    "dataPedido" TIMESTAMP(3) NOT NULL,
    "valorBruto" DECIMAL(14,2) NOT NULL,
    "valorDesconto" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "valorFrete" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "valorTotal" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalesOrder_datasetId_dataPedido_idx" ON "SalesOrder"("datasetId", "dataPedido");

-- CreateIndex
CREATE INDEX "SalesOrder_datasetId_clienteUf_idx" ON "SalesOrder"("datasetId", "clienteUf");

-- CreateIndex
CREATE INDEX "SalesOrder_datasetId_categoria_idx" ON "SalesOrder"("datasetId", "categoria");

-- CreateIndex
CREATE INDEX "SalesOrder_datasetId_canal_idx" ON "SalesOrder"("datasetId", "canal");

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

