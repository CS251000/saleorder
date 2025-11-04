ALTER TABLE "job_order_expenses" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "job_order_expenses" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();