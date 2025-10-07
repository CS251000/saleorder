import { NextResponse } from "next/server";
import { db } from "@/db";
import { organizations,users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req){
  const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
  if(!userId){
      return NextResponse.json(
      { error: "User Id is required" },
      { status: 400 }
    );
    }

  try{
    const userDeets= await db
    .select({
      userId: users.id,
      createdAt: users.createdAt,
      email:users.email,
      phone:users.phone,
      userName: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      role:users.role,
      age:users.age,
      orgName: organizations.name,
      orgLocation:organizations.location,
      orgWebsite: organizations.website,
    })
    .from(users).leftJoin(organizations,eq(users.organization,organizations.id))
    .where(eq(userId,users.id))
    .limit(1);

    // console.log("user",userDeets);

    if (userDeets.length === 0) {
  return NextResponse.json({ error: "User not found" }, { status: 404 });
}

const user = userDeets[0];
return NextResponse.json({ user }, { status: 200 });

  }catch (error) {
    console.error("❌ Error fetching user details:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }

}