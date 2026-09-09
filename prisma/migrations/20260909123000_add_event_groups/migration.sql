CREATE TABLE "event_groups" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_by" TEXT NOT NULL,
    "invite_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_groups_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "event_groups_invite_token_key" ON "event_groups"("invite_token");
CREATE INDEX "event_groups_created_by_created_at_idx" ON "event_groups"("created_by", "created_at");

ALTER TABLE "events" ADD COLUMN "group_id" TEXT;
CREATE INDEX "events_group_id_idx" ON "events"("group_id");

ALTER TABLE "event_groups" ADD CONSTRAINT "event_groups_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_group_id_fkey"
  FOREIGN KEY ("group_id") REFERENCES "event_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
