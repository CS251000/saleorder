import { NextResponse } from "next/server";
import { db } from "@/db";
import { clothBuyAgents, cloths, designs, fabricators, categories, purchaseOrder } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      POnumber,
      date,
      agentId,
      categoryId,
      clothId,
      designId,
      fabricatorId,
      purchaseRate,
      quantity,
      description,
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
      categoryId: categoryId || null,
      clothId: clothId,
      designId: designId || null,
      fabricatorId: fabricatorId || null,
      purchaseRate: purchaseRate !== undefined && purchaseRate !== null ? Number(purchaseRate) : 0.0,
      quantity: quantity !== undefined && quantity !== null ? Number(quantity) : 0,
      description: description || null,
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
    const designId = searchParams.get("designId");
    const fabricatorId = searchParams.get("fabricatorId");

    if (!managerId) {
      return NextResponse.json(
        { error: "Missing required field: managerId" },
        { status: 400 }
      );
    }
    let query = db
      .select({
        id: purchaseOrder.id,
        poNumber: purchaseOrder.POnumber,
        orderDate: purchaseOrder.orderDate,
        dueDate: purchaseOrder.dueDate,
        purchaseRate: purchaseOrder.purchaseRate,
        quantity: purchaseOrder.quantity,
        description: purchaseOrder.description,
        status: purchaseOrder.status,
        clothId:purchaseOrder.clothId,
        agentId:purchaseOrder.agentId,
        clothName: cloths.name,
        agentName: clothBuyAgents.name,
        categoryId: purchaseOrder.categoryId,
        categoryName: categories.name,
        fabricatorId: purchaseOrder.fabricatorId,
        designId: purchaseOrder.designId,
        fabricatorName: fabricators.name,
        designName: designs.name,
      })
      .from(purchaseOrder)
      .leftJoin(cloths, eq(purchaseOrder.clothId, cloths.id))
      .leftJoin(clothBuyAgents, eq(purchaseOrder.agentId, clothBuyAgents.id))
      .leftJoin(categories, eq(purchaseOrder.categoryId, categories.id))
      .leftJoin(fabricators, eq(purchaseOrder.fabricatorId, fabricators.id))
      .leftJoin(designs, eq(purchaseOrder.designId, designs.id))
      .where(eq(managerId,purchaseOrder.managerId));

      if(clothId){
        query= query.where(eq(clothId,purchaseOrder.clothId))
      }
      if(agentId){
        query=query.where(eq(agentId,purchaseOrder.agentId));
      }
      if(designId){
        query=query.where(eq(designId,purchaseOrder.designId));
      }
      if(fabricatorId){
        query=query.where(eq(fabricatorId,purchaseOrder.fabricatorId));
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
    const { isEditForm } = body;

    // If isEditForm is true, handle form editing
    if (isEditForm) {
      const {
        id,
        POnumber,
        date,
        agentId,
        categoryId,
        clothId,
        designId,
        fabricatorId,
        purchaseRate,
        quantity,
        description,
        dueDate,
        managerId,
      } = body;

      // Validate required fields
      if (!id) {
        return NextResponse.json(
          { error: "Missing required field: id" },
          { status: 400 }
        );
      }

      // Prepare update data
      const updateData = {};
      
      if (POnumber !== undefined) updateData.poNumber = POnumber;
      if (date !== undefined) updateData.orderDate = new Date(date).toISOString();
      if (agentId !== undefined) updateData.agentId = agentId;
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (clothId !== undefined) updateData.clothId = clothId;
      if (designId !== undefined) updateData.designId = designId;
      if (fabricatorId !== undefined) updateData.fabricatorId = fabricatorId;
      if (purchaseRate !== undefined) updateData.purchaseRate = parseFloat(purchaseRate);
      if (quantity !== undefined) updateData.quantity = parseInt(quantity);
      if (description !== undefined) updateData.description = description;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate).toISOString() : null;
      if (managerId !== undefined) updateData.managerId = managerId;

      // Update the purchase order
      const [updatedOrder] = await db
        .update(purchaseOrder)
        .set(updateData)
        .where(eq(purchaseOrder.id, id))
        .returning();

      if (!updatedOrder) {
        return NextResponse.json(
          { error: "Purchase order not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: "✅ Purchase order updated successfully",
          data: updatedOrder,
        },
        { status: 200 }
      );
    }

    // Otherwise, handle status update (original functionality)
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

