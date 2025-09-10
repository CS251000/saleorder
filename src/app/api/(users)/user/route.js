import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("id");
    const userId= searchParams.get("userId");

    if (!clerkId && !userId) {
      return Response.json({ error: "Missing id" }, { status: 400 });
    }
    if(clerkId){
      const result = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

      return Response.json({ exists: result.length > 0 , currentUser: result[0] });
    }
    if(userId){
      const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return Response.json({ exists: result.length > 0 , currentUser: result[0] });
    }

    return Response.json({ error: "Invalid request" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const [newUser] = await db
      .insert(users)
      .values({
        email: body.email,
        clerkId: body.clerkId,
        username: body.username,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role,
      })
      .returning(); // 🔑 Drizzle returns the inserted row(s)

    return Response.json({ user: newUser }, { status: 201 });
  } catch (err) {
    console.error("Error inserting user:", err);
    return Response.json({ error: "Insert failed" }, { status: 500 });
  }
}

