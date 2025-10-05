ALTER TABLE "sales_order" ALTER COLUMN "completed_date" SET DEFAULT null;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "party" ADD CONSTRAINT "party_name_unique" UNIQUE("name");