import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req) {
  try {
    const body = await req.json();
    const { employeeId, managerId } = body;

    if (!employeeId || !managerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [newEmployee] = await db
      .insert(employees)
      .values({
        employeeId,
        managerId,
      })
      .returning();

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error("Error adding employee:", error);
    return NextResponse.json(
      { error: "Failed to add employee" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const managerId = searchParams.get("managerId");

  try {
    const employeesList = await db
      .select({
        employeeId: employees.employeeId,
        employeeName: users.username,
        employeeRole: users.role
      })
      .from(employees).leftJoin(users,eq(users.id,employees.employeeId))
      .where(eq(employees.managerId, managerId));

    return NextResponse.json(employeesList, { status: 200 });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}
