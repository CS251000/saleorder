

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const clothId = searchParams.get("clothId");

    // ✅ Query with LEFT JOINS for related names
    let query = db
      .select({
        id: purchaseOrder.id,
        poNumber: purchaseOrder.POnumber,
        purchaseRate: purchaseOrder.purchaseRate,
        quantity: purchaseOrder.quantity,
        status: purchaseOrder.status,
        clothId:purchaseOrder.clothId,
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