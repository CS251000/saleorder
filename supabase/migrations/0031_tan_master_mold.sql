ALTER TABLE "mills" RENAME TO "categories";--> statement-breakpoint
ALTER TABLE "purchase_order" RENAME COLUMN "mills_id" TO "category_id";--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "mill_per_manager";--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "mills_manager_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "purchase_order" DROP CONSTRAINT "purchase_order_mills_id_mills_id_fk";
--> statement-breakpoint
DROP INDEX "manager_mill_index";--> statement-breakpoint
ALTER TABLE "job_order" ADD COLUMN "sale_price" numeric DEFAULT '0.0';--> statement-breakpoint
ALTER TABLE "purchase_order" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "manager_category_index" ON "categories" USING btree ("manager_id");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "category_per_manager" UNIQUE("manager_id","name");