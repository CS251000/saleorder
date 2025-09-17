import { NextResponse } from "next/server";
import { db } from "@/db";
import { saleOrder, agents, party, employees } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");

  if (!employeeId) {
    return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
  }

  try {
    const salesOrders = await db
      .select({
        id: saleOrder.id,
        orderNumber: saleOrder.orderNumber,
        orderDate: saleOrder.orderDate,
        partyName: party.name,
        agentName: agents.name,
        totalCase: saleOrder.totalCase,
        pendingCase: saleOrder.pendingCase,
        dispatchedCase: saleOrder.dispatchedCase,
        
        orderStatus: saleOrder.status,
      })
      .from(saleOrder)
      .leftJoin(party, eq(saleOrder.partyId, party.id))
      .leftJoin(agents, eq(saleOrder.agentId, agents.id))
      .where(eq(saleOrder.staff, employeeId));

    return NextResponse.json({ salesOrders });
  } catch (err) {
    console.error("GET /api/sales-orders error:", err);
    return NextResponse.json({ error: "Failed to fetch sales orders" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      orderDate,
      orderNumber,
      partyId,
      agentId,
      employeeId, // must be employees.id (PK)
      totalCases,
      orderStatus,
      staff, // users.id
    } = body;

    // simple validation
    if (!orderDate || !partyId || !agentId || !totalCases || !orderStatus || !staff) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Ensure numbers
    const totalNum = Number(totalCases);
    if (Number.isNaN(totalNum) || totalNum <= 0) {
      return NextResponse.json({ error: "totalCases must be a positive number" }, { status: 400 });
    }

    const newOrder = await db
      .insert(saleOrder)
      .values({
        orderDate,
        orderNumber,
        partyId,
        agentId,
        staff, // FK to users.id
        totalCase: totalNum,
        pendingCase: totalNum,
        dispatchedCase: 0,
        status: orderStatus,
      })
      .returning();

      const currEmployee= await db.select().from(employees).where(eq(employees.employeeId,staff));

      var pending= currEmployee[0]?.pendingOrders ?? 0;
      pending+= totalNum;

      const upEmployee= await db.update(employees)
      .set({pendingOrders: pending})
      .where(eq(employees.employeeId,staff));

    return NextResponse.json({ message: "Sale order created", saleOrder: newOrder[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/sales-orders error:", err);
    return NextResponse.json({ error: "Failed to create sale order" }, { status: 500 });
  }
}

export async function DELETE(req){
  try{
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if(!orderId){
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }
    const existingOrder = await db.select().from(saleOrder).where(eq(saleOrder.id, orderId));
    if(existingOrder.length===0){
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const delOrder= await db.delete(saleOrder).where(eq(saleOrder.id, orderId));

    const currEmployee= await db.select().from(employees).where(eq(employees.employeeId,existingOrder[0].staff));

    var pending= currEmployee[0]?.pendingOrders ?? 0;
    pending-= existingOrder[0].pendingCase;

    if(pending<0) pending=0;

    const upEmployee= await db.update(employees)
    .set({pendingOrders: pending})
    .where(eq(employees.employeeId,existingOrder[0].staff));

    return NextResponse.json({ message: "Order deleted" }, { status: 200 });
    
  }catch(err){
    console.error("DELETE /api/sales-orders error:", err);
    return NextResponse.json({ error: "Failed to delete sale order" }, { status: 500 });
  }
}