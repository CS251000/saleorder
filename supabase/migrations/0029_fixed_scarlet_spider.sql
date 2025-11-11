CREATE TYPE "public"."plan_names" AS ENUM('EazyCore', 'EazyPro', 'EazyElite');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan_name" "plan_names";