import { NextResponse } from "next/server";
import { db } from "@/db";
import { purchaseOrder } from "@/db/schema";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      POnumber,
      date,
      agentId,
      millId,
      clothId,
      designId,
      fabricatorId,
      purchaseRate,
      quantity,
      dueDate,
      managerId,
    } = body;

    if (!POnumber || !agentId || !clothId) {
      return NextResponse.json(
        { error: "Missing required fields: POnumber, agentId, clothId" },
        { status: 400 }
      );
    }

    const newPO = {
      POnumber,
      orderDate: (date ? new Date(date) : new Date()).toISOString(),
      agentId: agentId || null,
      millId: millId || null,
      clothId: clothId || null,
      designId: designId || null,
      fabricatorId: fabricatorId || null,
      purchaseRate: purchaseRate ? Number(purchaseRate) : 0.0,
      quantity: quantity ? Number(quantity) : 0,
      dueDate: (dueDate ? new Date(dueDate) : new Date()).toISOString(),
      managerId: managerId || null,
    };

    const inserted = await db.insert(purchaseOrder).values(newPO).returning();

    return NextResponse.json(
      {
        message: "✅ Purchase order created successfully",
        data: inserted[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating purchase order:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
