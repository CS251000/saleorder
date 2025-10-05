import { NextResponse } from "next/server";

export async function GET(req){
  const {sub_id}= await req.json();
  try{
    const res= await fetch(`https://api.razorpay.com/v1/subscriptions/${sub_id}`,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${Buffer.from(`${process.env.RAZORPAY_TEST_KEY_ID}:${process.env.RAZORPAY_TEST_KEY_SECRET}`).toString("base64")}`
      },
    });
    const data = await res.json();
    if(!res.ok) {
      return NextResponse.json({error: data.error.description}, {status: 500});
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req){
  const {plan_id} = await req.json();
  try{
    const res= await fetch(`https://api.razorpay.com/v1/subscriptions`,{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${Buffer.from(`${process.env.RAZORPAY_TEST_KEY_ID}:${process.env.RAZORPAY_TEST_KEY_SECRET}`).toString("base64")}`
      },
      body: JSON.stringify({
        plan_id,
        total_count:1,
      })
    });
    const data = await res.json();
    if(!res.ok) {
      return NextResponse.json({error: data.error.description}, {status: 500});
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}