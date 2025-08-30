import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("id");

    if (!clerkId) {
      return Response.json({ error: "Missing id" }, { status: 400 });
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);


    return Response.json({ exists: result.length > 0 , currentUser: result[0] });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    await db.insert(users).values({
      email: body.email,
      clerkId: body.clerkId,
      username: body.username,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Insert failed" }, { status: 500 });
  }
}
