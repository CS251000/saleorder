import { NextResponse } from "next/server";
import { db } from "@/db";
import { saleOrder, agents, party, employees, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");
  const partyId = searchParams.get("partyId");

  if (!employeeId && !partyId) {
    return NextResponse.json({ error: "Employee ID and Party ID are required" }, { status: 400 });
  }

  if(employeeId){
    try {
    const salesOrders = await db
      .select({
        id: saleOrder.id,
        orderNumber: saleOrder.orderNumber,
        orderDate: saleOrder.orderDate,
        completedDate: saleOrder.completedDate,
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

  if(partyId){
    try {
    const salesOrders = await db
      .select({
        id: saleOrder.id,
        orderNumber: saleOrder.orderNumber,
        orderDate: saleOrder.orderDate,
        completedDate: saleOrder.completedDate,
        partyName: party.name,
        agentName: agents.name,
        totalCase: saleOrder.totalCase,
        pendingCase: saleOrder.pendingCase,
        dispatchedCase: saleOrder.dispatchedCase,
        staffId: saleOrder.staff,
        employeeName: users.username,
        orderStatus: saleOrder.status,
      })
      .from(saleOrder)
      .leftJoin(users, eq(saleOrder.staff, users.id))
      .leftJoin(party, eq(saleOrder.partyId, party.id))
      .leftJoin(agents, eq(saleOrder.agentId, agents.id))
      .where(eq(saleOrder.partyId, partyId));
    
    const partyDetails= await db.select().from(party).where(eq(party.id,partyId));

    return NextResponse.json({ salesOrders, party: partyDetails[0] });
  } catch (err) {
    console.error("GET /api/sales-orders error:", err);
    return NextResponse.json({ error: "Failed to fetch sales orders" }, { status: 500 });
  }
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

      const currParty= await db.select().from(party).where(eq(party.id,partyId));

      var pending= currEmployee[0]?.pendingOrders ?? 0;
      pending+= totalNum;

      var pendingparty= currParty[0]?.pendingCases??0;
      pendingparty+= totalNum;

      const upEmployee= await db.update(employees)
      .set({pendingOrders: pending})
      .where(eq(employees.employeeId,staff));

      revalidateTag("employees");

      const upParty= await db.update(party)
      .set({pendingCases: pendingparty})
      .where(eq(party.id,partyId));
      revalidateTag("parties");

      revalidateTag(`employee-sales-orders-${staff}`);
      revalidateTag(`party-sales-orders-${partyId}`);

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


    const currEmployee= await db.select().from(employees).where(eq(employees.employeeId,existingOrder[0].staff));

    const currParty= await db.select().from(party).where(eq(party.id,existingOrder[0].partyId));

    var pendingparty= currParty[0]?.pendingCases ?? 0;
    pendingparty-= existingOrder[0].pendingCase;


    var pending= currEmployee[0]?.pendingOrders ?? 0;
    pending-= existingOrder[0].pendingCase;

    if(pending<0) pending=0;

    const upEmployee= await db.update(employees)
    .set({pendingOrders: pending})
    .where(eq(employees.employeeId,existingOrder[0].staff));

    if(pendingparty<0) pendingparty=0;

    const upParty= await db.update(party)
    .set({pendingCases: pendingparty})
    .where(eq(party.id,existingOrder[0].partyId));

    const delOrder= await db.delete(saleOrder).where(eq(saleOrder.id, orderId));

    revalidateTag("employees");
    revalidateTag("parties");
    revalidateTag(`employee-sales-orders-${existingOrder[0].staff}`);
    revalidateTag(`party-sales-orders-${existingOrder[0].partyId}`);

    return NextResponse.json({ message: "Order deleted" }, { status: 200 });
    
  }catch(err){
    console.error("DELETE /api/sales-orders error:", err);
    return NextResponse.json({ error: "Failed to delete sale order" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // sale order id

    if (!id) {
      return NextResponse.json({ error: "Sale order ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const {
      orderDate,
      partyId,
      agentId,
      totalCases,
      pendingCases,
      orderNumber,
    } = body;

    if (!orderDate || !partyId || !agentId || !totalCases) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch the current order to adjust pending counts properly
    const existingOrder = await db.select().from(saleOrder).where(eq(saleOrder.id, id));
    if (existingOrder.length === 0) {
      return NextResponse.json({ error: "Sale order not found" }, { status: 404 });
    }

    const oldOrder = existingOrder[0];
    const oldPartyId = oldOrder.partyId;
    const oldPending = oldOrder.pendingCase;
    const oldTotal = oldOrder.totalCase;

    // Update sale order
    const updatedOrder = await db
      .update(saleOrder)
      .set({
        orderDate,
        partyId,
        agentId,
        totalCase: Number(totalCases),
        pendingCase: Number(pendingCases),
        orderNumber,
      })
      .where(eq(saleOrder.id, id))
      .returning();

    // Update related employee + party pending counts
    const employee = await db
      .select()
      .from(employees)
      .where(eq(employees.employeeId, oldOrder.staff));

    if (employee.length > 0) {
      const emp = employee[0];
      let updatedPending =
        (emp.pendingOrders ?? 0) - oldPending + Number(pendingCases);
      if (updatedPending < 0) updatedPending = 0;

      await db
        .update(employees)
        .set({ pendingOrders: updatedPending })
        .where(eq(employees.employeeId, oldOrder.staff));
    }

    // Party updates
    const oldParty = await db.select().from(party).where(eq(party.id, oldPartyId));
    const newParty = await db.select().from(party).where(eq(party.id, partyId));

    // If party changed, subtract from old and add to new
    if (oldPartyId !== partyId) {
      if (oldParty.length > 0) {
        let oldPendingParty = (oldParty[0].pendingCases ?? 0) - oldPending;
        if (oldPendingParty < 0) oldPendingParty = 0;
        await db
          .update(party)
          .set({ pendingCases: oldPendingParty })
          .where(eq(party.id, oldPartyId));
      }

      if (newParty.length > 0) {
        let newPendingParty =
          (newParty[0].pendingCases ?? 0) + Number(pendingCases);
        await db
          .update(party)
          .set({ pendingCases: newPendingParty })
          .where(eq(party.id, partyId));
      }
    } else {
      // Same party — adjust pending
      if (newParty.length > 0) {
        let updatedPendingParty =
          (newParty[0].pendingCases ?? 0) - oldPending + Number(pendingCases);
        if (updatedPendingParty < 0) updatedPendingParty = 0;
        await db
          .update(party)
          .set({ pendingCases: updatedPendingParty })
          .where(eq(party.id, partyId));
      }
    }

    // Revalidate relevant caches
    revalidateTag("employees");
    revalidateTag("parties");
    revalidateTag(`employee-sales-orders-${oldOrder.staff}`);
    revalidateTag(`party-sales-orders-${partyId}`);

    return NextResponse.json(
      { message: "Sale order updated successfully", saleOrder: updatedOrder[0] },
      { status: 200 }
    );
  } catch (err) {
    console.error("PUT /api/sales-orders error:", err);
    return NextResponse.json(
      { error: "Failed to update sale order" },
      { status: 500 }
    );
  }
}
