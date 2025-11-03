import { db } from "@/db";
import { mills } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// ✅ POST — Add mills
export async function POST(req) {
  const { millName, managerId } = await req.json();

  if (!millName || !managerId) {
    return NextResponse.json(
      { error: "mill name and managerId are required" },
      { status: 400 }
    );
  }

  try {
    const [newMill] = await db
      .insert(mills)
      .values({
        name: millName,
        managerId,
        total: 0,
        pending: 0,
        dispatched: 0,
      })
      .returning({
        millId: mills.id,
        millName: mills.name,
      });

    if (!newMill) {
      return NextResponse.json(
        { message: "mill already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json({ mill: newMill });
  } catch (error) {
    console.error("Error adding mill:", error);
    return NextResponse.json(
      { error: "Failed to add  mill" },
      { status: 500 }
    );
  }
}

// ✅ GET — Fetch all mills for a manager
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
    const allMills = await db
      .select()
      .from(mills)
      .where(eq(mills.managerId, managerId));

    return NextResponse.json({ mills: allMills });
  } catch (error) {
    console.error("Error fetching mills:", error);
    return NextResponse.json(
      { error: "Failed to fetch mills" },
      { status: 500 }
    );
  }
}
