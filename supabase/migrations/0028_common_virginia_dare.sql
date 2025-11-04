CREATE TYPE "public"."Job_slip_status" AS ENUM('Pending', 'Completed');--> statement-breakpoint
ALTER TABLE "job_order" ADD COLUMN "status" "Job_slip_status" DEFAULT 'Pending';--> statement-breakpoint
ALTER TABLE "purchase_order" ADD COLUMN "status" "Job_slip_status" DEFAULT 'Pending';