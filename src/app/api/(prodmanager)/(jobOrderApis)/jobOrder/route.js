import { NextResponse } from "next/server";
import { db } from "@/db";
import { cloths, designs, fabricators, jobOrder } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

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

    // ✅ Construct the job order object
    const newJob = {
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
    };

    // ✅ Use transaction for consistency
    const insertedJobOrder = await db.transaction(async (tx) => {
      const [createdJob] = await tx.insert(jobOrder).values(newJob).returning();

      const updates = [];

      // 🧵 Update related entities: increment total & pending by 1
      // if (clothId) {
      //   updates.push(
      //     tx
      //       .update(cloths)
      //       .set({
      //         total: sql`COALESCE(${cloths.total}, 0) + 1`,
      //         pending: sql`COALESCE(${cloths.pending}, 0) + 1`,
      //       })
      //       .where(eq(cloths.id, clothId))
      //   );
      // }

      if (designId) {
        updates.push(
          tx
            .update(designs)
            .set({
              total: sql`COALESCE(${designs.total}, 0) + 1`,
              pending: sql`COALESCE(${designs.pending}, 0) + 1`,
            })
            .where(eq(designs.id, designId))
        );
      }

      if (fabricatorId) {
        updates.push(
          tx
            .update(fabricators)
            .set({
              total: sql`COALESCE(${fabricators.total}, 0) + 1`,
              pending: sql`COALESCE(${fabricators.pending}, 0) + 1`,
            })
            .where(eq(fabricators.id, fabricatorId))
        );
      }

      if (updates.length > 0) {
        await Promise.all(updates);
      }

      return createdJob;
    });

    // ✅ Return success response
    return NextResponse.json(
      {
        message: "✅ Job order created successfully",
        data: insertedJobOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating job order:", error);

    // Unique violation check (jobSlipNumber)
    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "Job order with this slip number already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

// 🧾 GET: Fetch all job orders or filter by managerId
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("managerId");
    const designId= searchParams.get("designId");
    const fabricatorId= searchParams.get("fabricatorId");

    let query = db
    .select({
      jobSlipNumber: jobOrder.jobSlipNumber,
      managerId: jobOrder.managerId,
      orderDate: jobOrder.orderDate,
      dueDate: jobOrder.dueDate,
      isSampleGiven: jobOrder.isSampleGiven,
      totalMeter: jobOrder.totalMeter,
      price: jobOrder.price,
      average: jobOrder.average,
      fabrication: jobOrder.fabrication,
      costing: jobOrder.costing,
      isBestSeller: jobOrder.isBestSeller,
      expenses: jobOrder.expenses,
      status: jobOrder.status,
      orderDate:jobOrder.orderDate,
      dueDate:jobOrder.dueDate,
      isSampleGiven:jobOrder.isSampleGiven,
      totalMeter:jobOrder.totalMeter,
      price:jobOrder.price,
      average:jobOrder.average,
      fabricatorName: fabricators.name,
      fabricatorId:jobOrder.fabricatorId,
      designId:jobOrder.designId,
      clothName: cloths.name,
      designName: designs.name,
    })
    .from(jobOrder)
    .leftJoin(fabricators, eq(jobOrder.fabricatorId, fabricators.id))
    .leftJoin(cloths, eq(jobOrder.clothId, cloths.id))
    .leftJoin(designs, eq(jobOrder.designId, designs.id))
    .where(eq(jobOrder.managerId,managerId));

    if(designId){
      query=query.where(eq(designId,jobOrder.designId))
    }
    if(fabricatorId){
      query=query.where(eq(fabricatorId,jobOrder.fabricatorId));
    }
    const orders= await query;

    return NextResponse.json(orders);
  } catch (error) {
    console.error("❌ Error fetching job orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch job orders", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { jobSlipNumber,designId,fabricatorId } = body;

    if (!jobSlipNumber) {
      return NextResponse.json(
        { error: "Missing required field: jobSlipNumber" },
        { status: 400 }
      );
    }

    // ✅ Use transaction for safe multi-table update
    const updatedSlip = await db.transaction(async (tx) => {

      // ✅ Update status to Completed
      const [updated] = await tx
        .update(jobOrder)
        .set({ status: "Completed" })
        .where(eq(jobOrder.jobSlipNumber, jobSlipNumber))
        .returning();

      // ✅ Adjust related entity counters
      const updates = [];


      if (designId) {
        updates.push(
          tx
            .update(designs)
            .set({
              pending: sql`GREATEST(COALESCE(${designs.pending}, 1) - 1, 0)`,
              dispatched: sql`COALESCE(${designs.dispatched}, 0) + 1`,
            })
            .where(eq(designs.id,designId))
        );
      }

      if (fabricatorId) {
        updates.push(
          tx
            .update(fabricators)
            .set({
              pending: sql`GREATEST(COALESCE(${fabricators.pending}, 1) - 1, 0)`,
              dispatched: sql`COALESCE(${fabricators.dispatched}, 0) + 1`,
            })
            .where(eq(fabricators.id,fabricatorId))
        );
      }

      if (updates.length > 0) await Promise.all(updates);

      return updated;
    });

    return NextResponse.json(
      { message: "✅ Job slip completed successfully", data: updatedSlip },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ Error completing job slip:", error);
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

    // ✅ Use transaction for safety
    const deletedJob = await db.transaction(async (tx) => {
      // Fetch job order before deleting
      const [existing] = await tx
        .select()
        .from(jobOrder)
        .where(eq(jobOrder.id, id));

      if (!existing) {
        throw new Error("Job order not found");
      }

      // Delete job order
      await tx.delete(jobOrder).where(eq(jobOrder.id, id));

      // Adjust total/pending counts
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

      if (updates.length > 0) {
        await Promise.all(updates);
      }

      return existing;
    });

    return NextResponse.json(
      {
        message: "🗑️ Job order deleted successfully",
        deleted: deletedJob,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting job order:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
