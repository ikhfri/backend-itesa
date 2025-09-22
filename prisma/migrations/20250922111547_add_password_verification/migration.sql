/*
  Warnings:

  - You are about to drop the column `isEmailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `EmailVerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."EmailVerificationToken" DROP CONSTRAINT "EmailVerificationToken_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "isEmailVerified";

-- DropTable
DROP TABLE "public"."EmailVerificationToken";
