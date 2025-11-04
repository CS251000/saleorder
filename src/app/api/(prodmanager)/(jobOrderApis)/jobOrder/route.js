import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobOrder } from "@/db/schema";
import { eq } from "drizzle-orm";

// 🧾 GET: Fetch all job orders or filter by managerId
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("managerId");

    let orders;

    if (managerId) {
      orders = await db.select().from(jobOrder).where(eq(jobOrder.managerId, managerId));
    } 

    return NextResponse.json(orders);
  } catch (error) {
    console.error("❌ Error fetching job orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch job orders", details: error.message },
      { status: 500 }
    );
  }
}

// 📨 POST: Create a new Job Order
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      jobSlipNumber,
      managerId,
      orderDate,
      fabricatorId,
      dueDate,
      isSampleGiven,
      clothId,
      totalMeter,
      price,
      designId,
      average,
      fabrication,
      costing,
      isBestSeller,
      expenses = [],
    } = body;

    // ✅ Basic validation
    if (!jobSlipNumber || !managerId) {
      return NextResponse.json(
        { error: "Missing required fields: jobSlipNumber or managerId" },
        { status: 400 }
      );
    }

    const [newJobOrder] = await db
      .insert(jobOrder)
      .values({
        jobSlipNumber,
        managerId,
        orderDate: orderDate ? new Date(orderDate).toISOString() : new Date().toISOString(),
        fabricatorId: fabricatorId || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        isSampleGiven: !!isSampleGiven,
        clothId: clothId || null,
        totalMeter: totalMeter?.toString() || "0.0",
        price: price?.toString() || "0.0",
        designId: designId || null,
        average: average?.toString() || "0.0",
        fabrication: fabrication?.toString() || "0.0",
        costing: costing?.toString() || "0.0",
        isBestSeller: !!isBestSeller,
        expenses: JSON.stringify(expenses),
      })
      .returning();

    return NextResponse.json(
      { message: "✅ Job order created successfully", jobOrder: newJobOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating job order:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
