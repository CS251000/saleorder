import { db } from "@/db";
import { clothBuyAgents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// ✅ POST — Add agent
export async function POST(req) {
  const { agentName, managerId } = await req.json();

  if (!agentName || !managerId) {
    return NextResponse.json(
      { error: "agent name and managerId are required" },
      { status: 400 }
    );
  }

  try {
    const [newAgent] = await db
      .insert(clothBuyAgents)
      .values({
        name: agentName,
        managerId,
        total: 0,
        pending: 0,
        dispatched: 0,
      })
      .returning({
        agentId: clothBuyAgents.id,
        agentName: clothBuyAgents.name,
      });

    if (!newAgent) {
      return NextResponse.json(
        { message: "agent already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json({ clothBuyAgent:newAgent  });
  } catch (error) {
    console.error("Error adding fabricator:", error);
    return NextResponse.json(
      { error: "Failed to add fabricator" },
      { status: 500 }
    );
  }
}

// ✅ GET — Fetch all agents for a manager
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const managerId = searchParams.get("managerId");

  if (!managerId) {
    return NextResponse.json(
      { error: "managerId is required" },
      { status: 400 }
    );
  }

  try {
    const allAgents = await db
      .select()
      .from(clothBuyAgents)
      .where(eq(clothBuyAgents.managerId, managerId));

    return NextResponse.json({ agents: allAgents });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
