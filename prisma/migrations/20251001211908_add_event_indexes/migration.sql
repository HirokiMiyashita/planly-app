-- CreateIndex
CREATE INDEX "events_created_by_created_at_idx" ON "public"."events"("created_by", "created_at");
