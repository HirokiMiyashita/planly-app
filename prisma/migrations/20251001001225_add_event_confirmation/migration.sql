-- AlterTable
ALTER TABLE "public"."events" ADD COLUMN     "confirmed_at" TIMESTAMP(3),
ADD COLUMN     "confirmed_slot_id" INTEGER,
ADD COLUMN     "is_confirmed" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_confirmed_slot_id_fkey" FOREIGN KEY ("confirmed_slot_id") REFERENCES "public"."event_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
