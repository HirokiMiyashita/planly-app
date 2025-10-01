-- AlterTable
ALTER TABLE "public"."event_participations" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
