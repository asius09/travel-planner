CREATE TABLE IF NOT EXISTS "destination_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_id" uuid NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "travel_mood" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "duration" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "budget" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "travel_party" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "onboarding_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "onboarding_flow_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "destination_images" ADD CONSTRAINT "destination_images_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "destination_images_destination_position_unique" ON "destination_images" ("destination_id","position");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "destination_images_destination_id_idx" ON "destination_images" ("destination_id");--> statement-breakpoint
-- Backfill: every existing destination keeps its hero image as the first entry
-- of the new ordered image collection. Existing data is preserved, never reset.
INSERT INTO "destination_images" ("destination_id", "url", "alt", "position")
SELECT d."id", d."hero_image", d."name", 0
FROM "destinations" d
WHERE NOT EXISTS (
  SELECT 1 FROM "destination_images" di WHERE di."destination_id" = d."id"
);--> statement-breakpoint
-- Backfill: profiles that already hold a full set of onboarding answers count
-- as completed so existing users are not forced through onboarding again.
UPDATE "user_preferences"
SET "onboarding_completed" = true
WHERE "travel_mood" IS NOT NULL
  AND "duration" IS NOT NULL
  AND "budget" IS NOT NULL
  AND "travel_party" IS NOT NULL
  AND "onboarding_completed" = false;