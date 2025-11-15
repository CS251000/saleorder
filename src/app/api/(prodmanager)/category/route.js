import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { categoryName, managerId } = await req.json();

  if (!categoryName || !managerId) {
    return NextResponse.json(
      { error: "category name and managerId are required" },
      { status: 400 }
    );
  }

  try {
    const [newCategory] = await db
      .insert(categories)
      .values({
        name: categoryName,
        managerId,
        total: 0,
        pending: 0,
        dispatched: 0,
      })
      .returning({
        categoryId: categories.id,
        categoryName: categories.name,
      });

    if (!newCategory) {
      return NextResponse.json(
        { message: "category already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json({ category: newCategory });
  } catch (error) {
    console.error("Error adding category:", error);
    return NextResponse.json(
      { error: "Failed to add  category" },
      { status: 500 }
    );
  }
}

// ✅ GET — Fetch all categories for a manager
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const managerId = searchParams.get("managerId");

  if (!managerId) {
    return NextResponse.json(
      { error: "managerId is required" },
      { status: 400 }
    );
  }

  try {
    const allCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.managerId, managerId));

    return NextResponse.json({ categories: allCategories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
