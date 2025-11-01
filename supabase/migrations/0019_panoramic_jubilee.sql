CREATE TABLE "buy_agents" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"total" integer,
	"dispatched" integer,
	"pending" integer,
	"manager_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloths" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"total" integer,
	"dispatched" integer,
	"pending" integer,
	"manager_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "designs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"total" integer,
	"dispatched" integer,
	"pending" integer,
	"manager_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fabricators" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"total" integer,
	"dispatched" integer,
	"pending" integer,
	"manager_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_order" (
	"job_slip_no." varchar PRIMARY KEY NOT NULL,
	"order_date" date DEFAULT now(),
	"fabricator_id" uuid,
	"due_date" date,
	"is_sample_given" boolean DEFAULT false,
	"cloth_id" uuid,
	"total_meter" numeric DEFAULT '0.0',
	"price" numeric DEFAULT '0.0',
	"design_id" uuid,
	"average" numeric DEFAULT '0.0',
	"fabrication" numeric DEFAULT '0.0',
	"costing" numeric DEFAULT '0.0',
	"is_best_seller" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "job_order_expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_slip_no" varchar NOT NULL,
	"expense_name" varchar NOT NULL,
	"amount" numeric DEFAULT '0.0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mills" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"manager_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_order" (
	"id" uuid PRIMARY KEY NOT NULL,
	"po_number" varchar,
	"order_date" date DEFAULT now(),
	"agent_id" uuid,
	"mills_id" uuid,
	"cloth_id" uuid,
	"price" numeric DEFAULT '0.0',
	"quantity" numeric,
	"design_id" uuid,
	"fabricator_id" uuid
);
--> statement-breakpoint
ALTER TABLE "buy_agents" ADD CONSTRAINT "buy_agents_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cloths" ADD CONSTRAINT "cloths_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "designs" ADD CONSTRAINT "designs_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fabricators" ADD CONSTRAINT "fabricators_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_order" ADD CONSTRAINT "job_order_fabricator_id_fabricators_id_fk" FOREIGN KEY ("fabricator_id") REFERENCES "public"."fabricators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_order" ADD CONSTRAINT "job_order_cloth_id_cloths_id_fk" FOREIGN KEY ("cloth_id") REFERENCES "public"."cloths"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_order" ADD CONSTRAINT "job_order_design_id_designs_id_fk" FOREIGN KEY ("design_id") REFERENCES "public"."designs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_order_expenses" ADD CONSTRAINT "job_order_expenses_job_slip_no_job_order_job_slip_no._fk" FOREIGN KEY ("job_slip_no") REFERENCES "public"."job_order"("job_slip_no.") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mills" ADD CONSTRAINT "mills_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_agent_id_buy_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."buy_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_mills_id_mills_id_fk" FOREIGN KEY ("mills_id") REFERENCES "public"."mills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_cloth_id_cloths_id_fk" FOREIGN KEY ("cloth_id") REFERENCES "public"."cloths"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_design_id_designs_id_fk" FOREIGN KEY ("design_id") REFERENCES "public"."designs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_fabricator_id_fabricators_id_fk" FOREIGN KEY ("fabricator_id") REFERENCES "public"."fabricators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "manager_buyagent_index" ON "buy_agents" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "manager_cloth_index" ON "cloths" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "manager_design_index" ON "designs" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "manager_fabricator_index" ON "fabricators" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "fabricator_wise_index" ON "job_order" USING btree ("fabricator_id");--> statement-breakpoint
CREATE INDEX "design_wise_index" ON "job_order" USING btree ("design_id");--> statement-breakpoint
CREATE INDEX "manager_mill_index" ON "mills" USING btree ("manager_id");--> statement-breakpoint
CREATE UNIQUE INDEX "po_number_index" ON "purchase_order" USING btree ("po_number");--> statement-breakpoint
CREATE INDEX "agent_wise_index" ON "purchase_order" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "cloth_wise_index" ON "purchase_order" USING btree ("cloth_id");--> statement-breakpoint
CREATE INDEX "employee_index" ON "sales_order" USING btree ("staff");--> statement-breakpoint
CREATE INDEX "party_wise_index" ON "sales_order" USING btree ("party_id");--> statement-breakpoint
CREATE UNIQUE INDEX "clerk_user_index" ON "users" USING btree ("clerk_id");