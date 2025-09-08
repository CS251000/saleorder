import { NextResponse } from "next/server";
import { db } from "@/db";
import { party } from "@/db/schema";

export async function GET() {
  try {
    const parties = await db.select({
      partyId: party.id,
      partyName: party.name,
    }).from(party);
    return NextResponse.json({ parties });
  } catch (error) {
    console.error("Error fetching parties:", error);
    return NextResponse.error();
  }
}

export async function POST(req) {
  const { partyName } = await req.json();

  if (!partyName) {
    return NextResponse.json(
      { error: "Party name is required" },
      { status: 400 }
    );
  }

  try {
    const newParty = await db
      .insert(party)
      .values({ name: partyName })
      .returning({
        partyId: party.id,
        partyName: party.name,
      })
      .then((res) => res[0]);
    return NextResponse.json({ party: newParty });
  } catch (error) {
    console.error("Error adding party:", error);
    return NextResponse.json(
      { error: "Failed to add party" },
      { status: 500 }
    );
  }
}


