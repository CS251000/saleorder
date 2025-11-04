import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobOrderExpenses } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// ✅ GET — fetch all expenses or by manager
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const managerId = url.searchParams.get("managerId");

    let expenses;
    if (managerId) {
      expenses = await db
        .select()
        .from(jobOrderExpenses)
        .where(eq(jobOrderExpenses.managerId, managerId))
        .orderBy(jobOrderExpenses.expenseName);
    } else {
      expenses = await db.select().from(jobOrderExpenses);
    }

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// ✅ POST — create a new expense (used when manager adds a new one)
export async function POST(request) {
  try {
    const body = await request.json();
    const { expenseName, managerId } = body ?? {};

    if (!expenseName || !managerId) {
      return NextResponse.json(
        { error: "Missing required fields: expenseName, managerId" },
        { status: 400 }
      );
    }

    const cleanName = String(expenseName).trim();

    const [created] = await db
      .insert(jobOrderExpenses)
      .values({
        expenseName: cleanName,
        managerId,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses error:", error);

    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}

