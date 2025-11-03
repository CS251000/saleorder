ALTER TABLE "agents" DROP CONSTRAINT "agents_name_unique";--> statement-breakpoint
ALTER TABLE "party" DROP CONSTRAINT "party_name_unique";--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agent_per_manager" UNIQUE("name","manager_id");--> statement-breakpoint
ALTER TABLE "buy_agents" ADD CONSTRAINT "clothAgent_per_manager" UNIQUE("manager_id","name");--> statement-breakpoint
ALTER TABLE "cloths" ADD CONSTRAINT "cloth_per_manager" UNIQUE("manager_id","name");--> statement-breakpoint
ALTER TABLE "designs" ADD CONSTRAINT "design_per_manager" UNIQUE("manager_id","name");--> statement-breakpoint
ALTER TABLE "fabricators" ADD CONSTRAINT "fabricator_per_manager" UNIQUE("manager_id","name");--> statement-breakpoint
ALTER TABLE "mills" ADD CONSTRAINT "mill_per_manager" UNIQUE("manager_id","name");--> statement-breakpoint
ALTER TABLE "party" ADD CONSTRAINT "party_per_manager" UNIQUE("name","manager_id");