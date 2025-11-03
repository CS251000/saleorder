ALTER TABLE "job_order" ADD COLUMN "manager_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "job_order_expenses" ADD COLUMN "manager_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_order" ADD COLUMN "manager_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "job_order" ADD CONSTRAINT "job_order_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_order_expenses" ADD CONSTRAINT "job_order_expenses_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "manager_wise_job_orders" ON "job_order" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "manager_job_order_expenses" ON "job_order_expenses" USING btree ("manager_id");