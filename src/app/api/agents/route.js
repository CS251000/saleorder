import { NextResponse } from "next/server";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req) {
  const {searchParams} = new URL(req.url);
  const managerId = searchParams.get("managerId");
  try {
    const agentsList = await db
      .select({
        agentId: agents.id,
        agentName: agents.name,
      })
      .from(agents)
      .where(eq(agents.managerId, managerId));

    return NextResponse.json({ agents: agentsList }); 
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const { agentName, managerId } = await req.json();
  
  if (!agentName) {
    return NextResponse.json(
      { error: "Agent name is required" },
      { status: 400 }
    );
  }

  try {
    const newAgent = await db
      .insert(agents)
      .values({ name: agentName,managerId:managerId })
      .onConflictDoNothing({target:agents.name})
      .returning({
        agentId: agents.id,
        agentName: agents.name,
        managerId: agents.managerId
      })
      .then((res) => res[0]);
    return NextResponse.json({ agent: newAgent });
  } catch (error) {
    console.error("Error adding agent:", error);
    return NextResponse.json(
      { error: "Failed to add agent" },
      { status: 500 }
    );
  }
}
