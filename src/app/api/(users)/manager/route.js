import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const employeeID = searchParams.get("employeeId");
  if (!employeeID) {
    return NextResponse.json(
      { error: "Missing employeeId parameter" },
      { status: 400 }
    );
  }

  try {
    const employee = await db
      .select()
      .from(employees)
      .where(eq(employees.employeeId, employeeID))
      .limit(1)
      .then((res) => res[0]);
    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ managerId: employee.managerId });
  }catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}