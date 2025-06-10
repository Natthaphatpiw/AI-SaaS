/*
  Warnings:

  - You are about to drop the `user_payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_payments" DROP CONSTRAINT "user_payments_userId_fkey";

-- DropIndex
DROP INDEX "user_subscriptions_stripeSubscriptionId_key";

-- AlterTable
ALTER TABLE "resumes" ADD COLUMN     "fontSize" TEXT NOT NULL DEFAULT 'medium';

-- AlterTable
ALTER TABLE "user_subscriptions" ALTER COLUMN "stripeSubscriptionId" DROP NOT NULL;

-- DropTable
DROP TABLE "user_payments";

-- DropTable
DROP TABLE "users";
