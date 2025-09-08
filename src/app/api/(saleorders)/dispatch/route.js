import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees, saleOrder } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req) {
  try {
    const body = await req.json().catch(() => ({}));

    const url = new URL(req.url);
    const orderId = body.orderId ?? url.searchParams.get("orderid");
    const dispatchCount = Number(body.dispatchCount ?? body.count ?? 0);

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }
    if (!Number.isInteger(dispatchCount) || dispatchCount <= 0) {
      return NextResponse.json(
        { error: "dispatchCount must be a positive integer" },
        { status: 400 }
      );
    }

    // fetch current order
    const orders = await db
      .select()
      .from(saleOrder)
      .where(eq(saleOrder.id, orderId));
    const order = orders?.[0];
    const staff = order?.staff;
    if (!order) {
      return NextResponse.json(
        { error: "Sale order not found" },
        { status: 404 }
      );
    }

    const pending = Number(order.pendingCase ?? order.pending_case ?? 0);
    const dispatched = Number(
      order.dispatchedCase ?? order.dispatched_case ?? 0
    );

    if (dispatchCount > pending) {
      return NextResponse.json(
        { error: `Cannot dispatch more than pending cases (${pending}).` },
        { status: 400 }
      );
    }

    const newPending = pending - dispatchCount;
    const newDispatched = dispatched + dispatchCount;
    // if no pending left, mark order Dispatched
    const newStatus =
      newPending === 0
        ? "Dispatched"
        : order.status ?? order.orderStatus ?? "Pending";

    // perform update
    const updated = await db
      .update(saleOrder)
      .set({
        pendingCase: newPending,
        dispatchedCase: newDispatched,
        status: newStatus,
      })
      .where(eq(saleOrder.id, orderId))
      .returning();
    const updatedOrder = updated?.[0] ?? null;

    const currEmployee = await db
      .select()
      .from(employees)
      .where(eq(employees.employeeId, staff));

    const currp = currEmployee[0]?.pendingOrders ?? 0;
    const currd = currEmployee[0]?.dispatchedOrders ?? 0;

    const upEmployee = await db
      .update(employees)
      .set({ pendingOrders: currp - dispatchCount, dispatchedOrders: currd + dispatchCount })
      .where(eq(employees.employeeId, staff));

    return NextResponse.json(
      { message: "Order dispatched", saleOrder: updatedOrder },
      { status: 200 }
    );
  } catch (err) {
    console.error("PUT /api/dispatch error:", err);
    return NextResponse.json(
      { error: "Failed to dispatch order" },
      { status: 500 }
    );
  }
}
