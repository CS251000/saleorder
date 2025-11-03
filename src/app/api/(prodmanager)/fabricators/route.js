import { db } from "@/db";
import { fabricators } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// ✅ POST — Add Fabricator
export async function POST(req) {
  const { fabricatorName, managerId } = await req.json();

  if (!fabricatorName || !managerId) {
    return NextResponse.json(
      { error: "Fabricator name and managerId are required" },
      { status: 400 }
    );
  }

  try {
    const [newFabricator] = await db
      .insert(fabricators)
      .values({
        name: fabricatorName,
        managerId,
        total: 0,
        pending: 0,
        dispatched: 0,
      })
      .returning({
        fabricatorId: fabricators.id,
        fabricatorName: fabricators.name,
      });

    if (!newFabricator) {
      return NextResponse.json(
        { message: "Fabricator already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json({ fabricator: newFabricator });
  } catch (error) {
    console.error("Error adding fabricator:", error);
    return NextResponse.json(
      { error: "Failed to add fabricator" },
      { status: 500 }
    );
  }
}

// ✅ GET — Fetch all Fabricators for a manager
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
    const allFabricators = await db
      .select()
      .from(fabricators)
      .where(eq(fabricators.managerId, managerId));

    return NextResponse.json({ fabricators: allFabricators });
  } catch (error) {
    console.error("Error fetching fabricators:", error);
    return NextResponse.json(
      { error: "Failed to fetch fabricators" },
      { status: 500 }
    );
  }
}
