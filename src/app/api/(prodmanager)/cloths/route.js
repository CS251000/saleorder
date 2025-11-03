import { db } from "@/db";
import { cloths } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// ✅ POST — Add cloth
export async function POST(req) {
  const { clothName, managerId } = await req.json();

  if (!clothName || !managerId) {
    return NextResponse.json(
      { error: "Cloth name and managerId are required" },
      { status: 400 }
    );
  }

  try {
    const [newCloth] = await db
      .insert(cloths)
      .values({
        name: clothName,
        managerId,
        total: 0,
        pending: 0,
        dispatched: 0,
      })
      .returning({
        clothId: cloths.id,
        clothName: cloths.name,
      });

    if (!newCloth) {
      return NextResponse.json(
        { message: "Cloth already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json({ cloth: newCloth });
  } catch (error) {
    console.error("Error adding cloth:", error);
    return NextResponse.json(
      { error: "Failed to add cloth" },
      { status: 500 }
    );
  }
}

// ✅ GET — Fetch all cloths for a manager
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
    const allCloths = await db
      .select()
      .from(cloths)
      .where(eq(cloths.managerId, managerId));

    return NextResponse.json({ clothsList: allCloths });
  } catch (error) {
    console.error("Error fetching cloths:", error);
    return NextResponse.json(
      { error: "Failed to fetch cloths" },
      { status: 500 }
    );
  }
}
