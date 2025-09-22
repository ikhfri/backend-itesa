/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Skill` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."User_phone_key";

-- AlterTable
ALTER TABLE "public"."Skill" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "public"."Worker" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "public"."Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
