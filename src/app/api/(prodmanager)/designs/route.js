import { db } from "@/db";
import { designs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// ✅ POST — Add design
export async function POST(req) {
  const { designName, managerId } = await req.json();

  if (!designName || !managerId) {
    return NextResponse.json(
      { error: "design name and managerId are required" },
      { status: 400 }
    );
  }

  try {
    const [newdesign] = await db
      .insert(designs)
      .values({
        name: designName,
        managerId,
        total: 0,
        pending: 0,
        dispatched: 0,
      })
      .returning({
        designId: designs.id,
        designName: designs.name,
      });

    if (!newdesign) {
      return NextResponse.json(
        { message: "design already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json({ design: newdesign });
  } catch (error) {
    console.error("Error adding design:", error);
    return NextResponse.json(
      { error: "Failed to add design" },
      { status: 500 }
    );
  }
}

// ✅ GET — Fetch all designs for a manager
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
    const alldesigns = await db
      .select()
      .from(designs)
      .where(eq(designs.managerId, managerId));

    return NextResponse.json({ designs: alldesigns });
  } catch (error) {
    console.error("Error fetching designs:", error);
    return NextResponse.json(
      { error: "Failed to fetch designs" },
      { status: 500 }
    );
  }
}
