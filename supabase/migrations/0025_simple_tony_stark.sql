ALTER TABLE "job_order_expenses" DROP CONSTRAINT "job_order_expenses_job_slip_no_job_order_job_slip_no._fk";
--> statement-breakpoint
ALTER TABLE "job_order" ADD COLUMN "expenses" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "job_order_expenses" DROP COLUMN "job_slip_no";--> statement-breakpoint
ALTER TABLE "job_order_expenses" DROP COLUMN "amount";