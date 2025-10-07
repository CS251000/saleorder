import { db } from "@/db";
import { organizations, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

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

    // 🧩 Step 1: Base user fields
    const baseUser = {
      email: body.email,
      clerkId: body.clerkId,
      username: body.username,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone || null,
      age: body.age ? parseInt(body.age) : null,
      role: body.role,
    };

    // 🧍 Step 2: Create user first
    const [newUser] = await db
      .insert(users)
      .values(baseUser)
      .returning();

    let orgId = null;

    // 🏢 Step 3: If Manager, create organization after user exists
    if (body.role === "Manager" && body.organization) {
      const [newOrg] = await db
        .insert(organizations)
        .values({
          id: sql`gen_random_uuid()`,
          name: body.organization.name,
          location: body.organization.location || null,
          website: body.organization.website || null,
          createdBy: newUser.id, // ✅ Now we have the real user ID
        })
        .returning({ id: organizations.id });

      orgId = newOrg.id;

      // 🪢 Step 4: Link org to user
      await db
        .update(users)
        .set({ organization: orgId })
        .where(eq(users.id, newUser.id));
    }

    return Response.json(
      {
        success: true,
        message: orgId
          ? "User and organization created successfully"
          : "User created successfully",
        user: newUser,
        organizationId: orgId,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Error creating user and organization:", err);
    return Response.json({ error: "Insert failed" }, { status: 500 });
  }
}


