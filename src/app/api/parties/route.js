import { NextResponse } from "next/server";
import { db } from "@/db";
import { party } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export async function GET(req) {
  const {searchParams} = new URL(req.url);
  const managerId = searchParams.get("managerId");
  if (!managerId) {
    return NextResponse.json({ parties: [] });
  }

  try {
    const parties = await db.select({
      partyId: party.id,
      partyName: party.name,
      pendingCases:party.pendingCases,
      dispatchedCases:party.dispatchedCases,
    }).from(party).where(eq(party.managerId, managerId));
    return NextResponse.json({ parties });
  } catch (error) {
    console.error("Error fetching parties:", error);
    return NextResponse.error();
  }
 
}

export async function POST(req) {
  const { partyName,managerId } = await req.json();

  if (!partyName) {
    return NextResponse.json(
      { error: "Party name is required" },
      { status: 400 }
    );
  }

  try {
    const newParty = await db
      .insert(party)
      .values({ 
        name: partyName, 
        managerId : managerId
      }).onConflictDoNothing({target:party.name})
      .returning({
        partyId: party.id,
        partyName: party.name,
        managerId: party.managerId
      })
      .then((res) => res[0]);

      revalidateTag("parties");
    return NextResponse.json({ party: newParty });
  } catch (error) {
    console.error("Error adding party:", error);
    return NextResponse.json(
      { error: "Failed to add party" },
      { status: 500 }
    );
  }
}


