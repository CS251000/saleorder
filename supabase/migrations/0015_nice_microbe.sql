CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" varchar(150),
	"website" varchar(255),
	"created_by" uuid NOT NULL,
	"created_at" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" date DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "organization" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_organizations_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;