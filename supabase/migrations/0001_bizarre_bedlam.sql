ALTER TABLE "users" ADD COLUMN "clerk_id" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id");