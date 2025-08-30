CREATE TYPE "public"."role" AS ENUM('Manager', 'Admin', 'Employee');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"phone" varchar,
	"username" varchar,
	"first_name" text,
	"last_name" text,
	"role" "role",
	"age" integer,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
