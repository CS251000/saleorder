import { NextResponse } from "next/server";
import { db } from "@/db";
import { clothBuyAgents, cloths, designs, fabricators, mills, purchaseOrder } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

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

    // required fields
    if (!clothId || !managerId) {
      return NextResponse.json(
        { error: "Missing required fields: clothId or managerId" },
        { status: 400 }
      );
    }

    const newPO = {
      POnumber: POnumber ?? null,
      orderDate: date ? new Date(date).toISOString() : new Date().toISOString(),
      agentId: agentId || null,
      millId: millId || null,
      clothId: clothId,
      designId: designId || null,
      fabricatorId: fabricatorId || null,
      purchaseRate: purchaseRate !== undefined && purchaseRate !== null ? Number(purchaseRate) : 0.0,
      quantity: quantity !== undefined && quantity !== null ? Number(quantity) : 0,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      managerId: managerId,

    };

    // Use transaction to ensure both insert and updates succeed together
    const insertedPO = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(purchaseOrder)
        .values(newPO)
        .returning();

      const po = inserted[0];

      // prepare update promises: increment total and pending by 1 where applicable
      const updates = [];

      // Cloth (required by schema) -> increment total & pending
      updates.push(
        tx
          .update(cloths)
          .set({
            total: sql`COALESCE(${cloths.total}, 0) + 1`,
            pending: sql`COALESCE(${cloths.pending}, 0) + 1`,
          })
          .where(eq(cloths.id, clothId))
      );

      // Design (if provided)
      // if (designId) {
      //   updates.push(
      //     tx
      //       .update(designs)
      //       .set({
      //         total: sql`COALESCE(${designs.total}, 0) + 1`,
      //         pending: sql`COALESCE(${designs.pending}, 0) + 1`,
      //       })
      //       .where(eq(designs.id, designId))
      //   );
      // }

      // Fabricator (if provided)
      // if (fabricatorId) {
      //   updates.push(
      //     tx
      //       .update(fabricators)
      //       .set({
      //         total: sql`COALESCE(${fabricators.total}, 0) + 1`,
      //         pending: sql`COALESCE(${fabricators.pending}, 0) + 1`,
      //       })
      //       .where(eq(fabricators.id, fabricatorId))
      //   );
      // }

      // Buy agent (if provided)
      if (agentId) {
        updates.push(
          tx
            .update(clothBuyAgents)
            .set({
              total: sql`COALESCE(${clothBuyAgents.total}, 0) + 1`,
              pending: sql`COALESCE(${clothBuyAgents.pending}, 0) + 1`,
            })
            .where(eq(clothBuyAgents.id, agentId))
        );}

      if (updates.length) {
        await Promise.all(updates);
      }
      return po;
    });

    return NextResponse.json(
      {
        message: "✅ Purchase order created successfully",
        data: insertedPO,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating purchase order:", error);

    // Unique violation (duplicate PO number) -> 409 Conflict
    if (error && error.code === "23505") {
      return NextResponse.json(
        { error: "Purchase order with this POnumber already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("managerId");
    const clothId = searchParams.get("clothId");
    const agentId = searchParams.get("agentId");

    if (!managerId) {
      return NextResponse.json(
        { error: "Missing required field: managerId" },
        { status: 400 }
      );
    }
    // ✅ Query with LEFT JOINS for related names
    let query = db
      .select({
        id: purchaseOrder.id,
        poNumber: purchaseOrder.POnumber,
        orderDate: purchaseOrder.orderDate,
        dueDate: purchaseOrder.dueDate,
        purchaseRate: purchaseOrder.purchaseRate,
        quantity: purchaseOrder.quantity,
        status: purchaseOrder.status,
        clothId:purchaseOrder.clothId,
        agentId:purchaseOrder.agentId,
        clothName: cloths.name,
        agentName: clothBuyAgents.name,
        millName: mills.name,
        fabricatorName: fabricators.name,
        designName: designs.name,
      })
      .from(purchaseOrder)
      .leftJoin(cloths, eq(purchaseOrder.clothId, cloths.id))
      .leftJoin(clothBuyAgents, eq(purchaseOrder.agentId, clothBuyAgents.id))
      .leftJoin(mills, eq(purchaseOrder.millId, mills.id))
      .leftJoin(fabricators, eq(purchaseOrder.fabricatorId, fabricators.id))
      .leftJoin(designs, eq(purchaseOrder.designId, designs.id))
      .where(eq(managerId,purchaseOrder.managerId));

      if(clothId){
        query= query.where(eq(clothId,purchaseOrder.clothId))
      }
      if(agentId){
        query=query.where(eq(agentId,purchaseOrder.agentId));
      }

      const results= await query;

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching purchase orders:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}


export async function PUT(req) {
  try {
    const body = await req.json();
    const { POid, POnumber, clothId, agentId } = body;

    if (!POid || !POnumber) {
      return NextResponse.json(
        { error: "Missing required field: POid or POnumber" },
        { status: 400 }
      );
    }

    const updatedSlip = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(purchaseOrder)
        .set({ status: "Completed" })
        .where(eq(purchaseOrder.id, POid))
        .returning();

      const updates = [];

      if (clothId) {
        updates.push(
          tx
            .update(cloths)
            .set({
              pending: sql`GREATEST(COALESCE(${cloths.pending}, 1) - 1, 0)`,
              dispatched: sql`${cloths.dispatched} + 1`,
            })
            .where(eq(cloths.id, clothId))
        );
      }

      if (agentId) {
        updates.push(
          tx
            .update(clothBuyAgents)
            .set({
              pending: sql`GREATEST(COALESCE(${clothBuyAgents.pending}, 1) - 1, 0)`,
              dispatched: sql`${clothBuyAgents.dispatched} + 1`,
            })
            .where(eq(clothBuyAgents.id, agentId))
        );
      }

      if (updates.length > 0) await Promise.all(updates);

      return updated;
    });

    return NextResponse.json(
      {
        message: "✅ Purchase order status updated successfully",
        data: updatedSlip,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error updating purchase order:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}


export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    // ✅ Transactional delete
    const deletedPO = await db.transaction(async (tx) => {
      // Fetch the existing record first
      const [existing] = await tx
        .select()
        .from(purchaseOrder)
        .where(eq(purchaseOrder.id, id));

      if (!existing) {
        throw new Error("Purchase order not found");
      }

      // Delete purchase order
      await tx.delete(purchaseOrder).where(eq(purchaseOrder.id, id));

      // Decrease pending/total appropriately
      const updates = [];

      if (existing.clothId) {
        updates.push(
          tx
            .update(cloths)
            .set({
              total: sql`GREATEST(COALESCE(${cloths.total}, 1) - 1, 0)`,
              pending: sql`GREATEST(COALESCE(${cloths.pending}, 1) - 1, 0)`,
            })
            .where(eq(cloths.id, existing.clothId))
        );
      }

      if (existing.designId) {
        updates.push(
          tx
            .update(designs)
            .set({
              total: sql`GREATEST(COALESCE(${designs.total}, 1) - 1, 0)`,
              pending: sql`GREATEST(COALESCE(${designs.pending}, 1) - 1, 0)`,
            })
            .where(eq(designs.id, existing.designId))
        );
      }

      if (existing.fabricatorId) {
        updates.push(
          tx
            .update(fabricators)
            .set({
              total: sql`GREATEST(COALESCE(${fabricators.total}, 1) - 1, 0)`,
              pending: sql`GREATEST(COALESCE(${fabricators.pending}, 1) - 1, 0)`,
            })
            .where(eq(fabricators.id, existing.fabricatorId))
        );
      }

      if (existing.agentId) {
        updates.push(
          tx
            .update(clothBuyAgents)
            .set({
              total: sql`GREATEST(COALESCE(${clothBuyAgents.total}, 1) - 1, 0)`,
              pending: sql`GREATEST(COALESCE(${clothBuyAgents.pending}, 1) - 1, 0)`,
            })
            .where(eq(clothBuyAgents.id, existing.agentId))
        );
      }

      if (updates.length > 0) {
        await Promise.all(updates);
      }

      return existing;
    });

    return NextResponse.json(
      {
        message: "🗑️ Purchase order deleted successfully",
        deleted: deletedPO,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting purchase order:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

