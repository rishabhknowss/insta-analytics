-- CreateEnum
CREATE TYPE "PaidStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');

-- CreateEnum
CREATE TYPE "Manager" AS ENUM ('ROHIT', 'UJJWAL', 'RISHABH');

-- CreateTable
CREATE TABLE "posters" (
    "id" SERIAL NOT NULL,
    "telegramChatId" BIGINT NOT NULL,
    "accountId" TEXT,
    "instagramLink" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "groupLink" TEXT NOT NULL DEFAULT '',
    "managedBy" "Manager" NOT NULL DEFAULT 'RISHABH',
    "paidStatus" "PaidStatus" NOT NULL DEFAULT 'UNPAID',
    "monthlyRate" INTEGER NOT NULL DEFAULT 1500,
    "totalPaid" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "posterId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "posters_telegramChatId_key" ON "posters"("telegramChatId");

-- AddForeignKey
ALTER TABLE "posters" ADD CONSTRAINT "posters_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "posters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
