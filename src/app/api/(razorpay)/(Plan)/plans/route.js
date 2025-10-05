import { NextResponse } from "next/server";


export async function GET(request) {
  try {
    const res = await fetch(`https://api.razorpay.com/v1/plans?count=3`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.RAZORPAY_TEST_KEY_ID}:${process.env.RAZORPAY_TEST_KEY_SECRET}`
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { error: "Failed to fetch plans", details: errorData },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}