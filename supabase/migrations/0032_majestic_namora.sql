CREATE INDEX "design_wise__po_index" ON "purchase_order" USING btree ("design_id");--> statement-breakpoint
CREATE INDEX "fabricator_wise_po_index" ON "purchase_order" USING btree ("fabricator_id");