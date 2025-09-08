CREATE TYPE "public"."status" AS ENUM('Dispatched', 'Pending');--> statement-breakpoint
CREATE TABLE "agents" (
	"agent_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text
);
--> statement-breakpoint
CREATE TABLE "party" (
	"party_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text
);
--> statement-breakpoint
CREATE TABLE "sales_order" (
	"sales_order_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid,
	"order_date" date DEFAULT now(),
	"agent_id" uuid,
	"party_id" uuid,
	"staff" uuid,
	"status" "status" DEFAULT 'Pending'
);
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "pending_orders" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "dispatched_orders" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "sales_order" ADD CONSTRAINT "sales_order_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order" ADD CONSTRAINT "sales_order_agent_id_agents_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order" ADD CONSTRAINT "sales_order_party_id_party_party_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."party"("party_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order" ADD CONSTRAINT "sales_order_staff_users_id_fk" FOREIGN KEY ("staff") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;