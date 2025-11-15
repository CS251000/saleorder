CREATE TYPE "public"."payment_status" AS ENUM('Paid', 'Pending', 'Failed');--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_name" "plan_names" NOT NULL,
	"start_date" date DEFAULT now(),
	"end_date" date NOT NULL,
	"is_active" boolean DEFAULT true,
	"auto_renew" boolean DEFAULT true,
	"payment_status" varchar DEFAULT 'paid'
);
--> statement-breakpoint
CREATE TABLE "usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"start_date" date DEFAULT now(),
	"tasks_per_month" integer,
	"job_orders_per_month_limit" integer,
	"purchase_orders_per_month_limit" integer
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage" ADD CONSTRAINT "usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_subscription_index" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_usage_index" ON "usage" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "plan_name";