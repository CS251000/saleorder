"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Switch } from "@/components/ui/switch";
import { Check, Star, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const popularPlanId = "plan_RPRGOw4DkGHcxU"; // EazyPro plan ID
const AnnualPlans=[
  {
    id:"plan_RPV6LNu5TTGnJ2",
    planName:"EazyCore",
    description:"For solo founders & small teams starting their automation journey Focus on what matters most — your customers. EazyCore gives you the essential tools to streamline daily operations, automate tasks, and save hours every week without any complexity. Perfect for: Small Business with simple workflows",
    amount:1799,
    period:"Every Year",
    features:[
      "Up to 3 users",
      "1000 tasks/month",
      "Basic automations",
      "Email support",
    ],
    popular:false
  },
  {
    id:"plan_RPV7T3VzFCChKG",
    planName:"EazyPro",
    description:"Most popular model for growing teams who want smarter workflows and collaboration Scale with confidence. EazyPro unlocks advanced automations, multiple user seats, and team-level analytics to keep everyone in sync. With priority support and deeper integrations, you can deliver faster, track performance, and make better data-driven decisions. Perfect for: Small to medium businesses scaling operations.",
    amount:3199,
    period:"Every Year",
    features:[
      "Up to 3 users",
      "1000 tasks/month",
      "Basic automations",
      "Email support",
    ],
    popular:true
  },
  {
    id:"plan_RPV7zy2H6GVp6K",
    planName:"EazyElite",
    description:"For businesses that demand premium performance and personal onboarding Your success, handled personally. EazyElite brings everything in EazyPro plus white-glove onboarding, dedicated support, and enterprise-grade automation tools built for scale. Enjoy exclusive insights, SLA commitments, and VIP access to our roadmap. Perfect for: Established businesses & growing enterprises.",
    amount: 6999,
    period:"per month",
    features:[
      "Up to 3 users",
      "1000 tasks/month",
      "Basic automations",
      "Email support",
    ],
    popular:false
  }
]
const MonthlyPlans=[
  {
    id:"plan_RPRF6HdWTh1sI6",
    planName:"EazyCore",
    description:"For solo founders & small teams starting their automation journey Focus on what matters most — your customers. EazyCore gives you the essential tools to streamline daily operations, automate tasks, and save hours every week without any complexity. Perfect for: Small Business with simple workflows",
    amount:499,
    period:"per Month",
    features:[
      "Up to 3 users",
      "1000 tasks/month",
      "Basic automations",
      "Email support",
    ],
    popular:false
  },
  {
    id:"plan_RPRGOw4DkGHcxU",
    planName:"EazyPro",
    description:"Most popular model for growing teams who want smarter workflows and collaboration Scale with confidence. EazyPro unlocks advanced automations, multiple user seats, and team-level analytics to keep everyone in sync. With priority support and deeper integrations, you can deliver faster, track performance, and make better data-driven decisions. Perfect for: Small to medium businesses scaling operations.",
    amount:899,
    period:"per Month",
    features:[
      "Up to 3 users",
      "1000 tasks/month",
      "Basic automations",
      "Email support",
    ],
    popular:true
  },
  {
    id:"plan_RPRH7EvKaY4l25",
    planName:"EazyElite",
    description:"For businesses that demand premium performance and personal onboarding Your success, handled personally. EazyElite brings everything in EazyPro plus white-glove onboarding, dedicated support, and enterprise-grade automation tools built for scale. Enjoy exclusive insights, SLA commitments, and VIP access to our roadmap.",
    amount: 1499,
    period:"per month",
    features:[
      "Up to 3 users",
      "1000 tasks/month",
      "Basic automations",
      "Email support",
    ],
    popular:false
  }
]

export default function PricingPage() {
  const router = useRouter();
  const [annual, setAnnual] =useState(false);
  const [loadingPlan, setLoadingPlan] =useState(null);


  async function handleSubscribe(plan) {
    try {
      setLoadingPlan(plan.id);
      const res = await fetch(`/api/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: plan.id }),
      });

      if (!res.ok) throw new Error("Failed to create subscription");
      const data = await res.json();
      if (typeof window !== "undefined") {
        alert(
          `Subscription created (mock). subscriptionId=${
            data.id ?? "<mock>"
          }`
        );
      }
      router.push(`${data.short_url}`)
    } catch (err) {
      console.error(err);
      alert("Subscription failed. Check console for details.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <>
      <Navbar/>

      <main className="min-h-screen bg-[#f1faee] py-16 px-4 sm:px-6 lg:px-8 text-slate-900">
        <section className="mx-auto max-w-7xl">
          <header className="text-center relative">
            <div className="absolute -z-10 inset-x-0 top-0 h-40 pointer-events-none">
              <div className="w-full h-full bg-gradient-to-r from-[#E8F8FF] via-[#CFF0FF] to-[#EAF9F9] opacity-60 blur-3xl" />
            </div>

            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-tight"
              style={{ color: "#00537a" }}
            >
              Pricing that keeps your business buzzing — simple, transparent,
              powerful
            </h1>
            <p className="mt-3 text-slate-700 max-w-2xl mx-auto">
              Pay every month or yearly — plans built for small teams and growing
              businesses. High-value automations, onboarding, and priority
              support where it matters.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">Billing period</span>
                <div
                  className="rounded-md px-3 py-1 text-sm font-semibold"
                  style={{ backgroundColor: "#0A4BA8", color: "#FFEAA3" }}
                >
                  {annual?"Annual":"Monthly"}
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Switch
                    checked={annual}
                    onCheckedChange={(v) => setAnnual(v)}
                  />
                </div>
                
              </div>

              <div
                className="mt-3 sm:mt-0 text-sm font-medium text-[#00537a]"
              >
                Limited onboarding seats for EazyElite — book now
              </div>
            </div>
          </header>

          {/*  Plans grid */}

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(annual ? AnnualPlans : MonthlyPlans).map((plan) => (
              <Card
                key={plan.id}
                className={`relative overflow-visible transform transition-all duration-300 hover:translate-y-[-6px] ${
                  plan.id === popularPlanId ? "shadow-2xl" : "shadow"
                } bg-gradient-to-br from-[#00537a] to-[#073b63] text-slate-100 border-0 rounded-2xl`}
              >
                {/* Golden ribbon for popular plan */}
                {plan.id === popularPlanId && (
                  <div className="absolute -top-3 right-3 z-10">
                    <div
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: "linear-gradient(90deg,#FFD24C,#FFB83A)",
                        color: "#000",
                        boxShadow: "0 6px 18px rgba(255,178,58,0.12)",
                      }}
                    >
                      Most popular
                    </div>
                  </div>
                )}

                <CardHeader className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle
                        className="text-lg font-semibold"
                      >
                        {plan.planName}
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-200">
                        {plan.description}
                      </CardDescription>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <div
                        className="text-3xl font-extrabold bg-clip-text text-transparent"
                        style={{
                          background: "linear-gradient(90deg,#FFD24C,#FFB83A)",
                          WebkitBackgroundClip: "text",
                        }}
                      >
                        ₹{plan.amount}
                      </div>
                      <div className="text-sm text-slate-400">
                        {plan.period}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul role="list" className="space-y-3 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <span
                          className="mt-1 flex items-center justify-center rounded-full h-6 w-6"
                          style={{ background: "rgba(255,210,76,0.12)" }}
                        >
                          <Check
                            className="h-4 w-4"
                            style={{ color: "#FFD24C" }}
                          />
                        </span>
                        <span className="text-sm text-slate-200">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <Button
                      // onClick={() => handleSubscribe(plan)}
                      className={`w-full sm:w-auto px-6 py-3 font-semibold shadow-md transition-transform transform hover:-translate-y-0.5 focus:outline-none ${
                        plan.id === popularPlanId
                          ? "bg-gradient-to-r from-[#FFD24C] to-[#FFB83A] text-black"
                          : "bg-white border border-[#FFD24C] text-[#0A4BA8]"
                      } rounded-xl`}
                      disabled={loadingPlan === plan.id}
                    >
                      {loadingPlan === plan.id ? "Processing..." : "Subscribe Now"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>

                    <div className="mt-2 sm:mt-0 text-xs text-slate-200">
                      <div>Cancel anytime. Secure payments via Razorpay.</div>
                    </div>
                  </div>

                  {plan.popular && (
                    <div
                      className="mt-4 rounded-md p-3 text-sm"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                      }}
                    >
                      <div className="font-medium text-[#A7C9FF]">
                        Why customers pick EazyPro
                      </div>
                      <div className="text-sm text-slate-300">
                        Balanced price-performance for growing teams — faster
                        ROI on automations.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <section className="mt-12 grid gap-8 lg:grid-cols-2">
            <div>
              <Card className="overflow-hidden bg-gradient-to-br from-[#184e77] to-[#0a2f4a] text-slate-100 rounded-2xl shadow-lg">
                <div
                  className="py-6 px-6 m-3 rounded-2xl bg-gradient-to-br from-[#1d3557] to-[#123253] shadow-inner"
                >
                  <CardHeader className="p-0">
                    <CardTitle
                      className="text-lg font-semibold "
                    >
                      {`What's Included`}
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Everything you need to run daily operations without the
                      headache.
                    </CardDescription>
                  </CardHeader>
                </div>

                <CardContent>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <li className="flex items-start gap-3">
                      <div
                        className="flex items-center justify-center rounded-md h-9 w-9"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(255,210,76,0.12), rgba(255,210,76,0.06))",
                        }}
                      >
                        <Check
                          className="h-4 w-4"
                          style={{ color: "#FFD24C" }}
                        />
                      </div>
                      <div>
                        <div
                          className="font-medium text-slate-100"
                        >
                          Automations
                        </div>
                        <div className="text-sm text-slate-300">
                          Pre-built workflows for common tasks.
                        </div>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <div
                        className="flex items-center justify-center rounded-md h-9 w-9"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(10,75,168,0.06), rgba(10,75,168,0.02))",
                        }}
                      >
                        <Check
                          className="h-4 w-4"
                          style={{ color: "#0A4BA8" }}
                        />
                      </div>
                      <div>
                        <div
                          className="font-medium text-slate-100"
                        >
                          Integrations
                        </div>
                        <div className="text-sm text-slate-300">
                          Connect to Google Sheets, Zapier, and APIs.
                        </div>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <div
                        className="flex items-center justify-center rounded-md h-9 w-9"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(6,29,74,0.06), rgba(6,29,74,0.02))",
                        }}
                      >
                        <Check
                          className="h-4 w-4"
                          style={{ color: "#061D4A" }}
                        />
                      </div>
                      <div>
                        <div
                          className="font-medium text-slate-100"
                        >
                          Security
                        </div>
                        <div className="text-sm text-slate-300">
                          SOC2-minded security, SSL, and encrypted credentials.
                        </div>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <div
                        className="flex items-center justify-center rounded-md h-9 w-9"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(255,210,76,0.12), rgba(255,210,76,0.06))",
                        }}
                      >
                        <Check
                          className="h-4 w-4"
                          style={{ color: "#FFD24C" }}
                        />
                      </div>
                      <div>
                        <div
                          className="font-medium text-slate-100"
                        >
                          Support
                        </div>
                        <div className="text-sm text-slate-300">
                          Email & chat support. Phone & onboarding for Elite.
                        </div>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="mt-6 text-sm text-slate-600">
                <strong>Note:</strong> Prices are billed every 3 months. Taxes
                (GST) are applied at checkout.
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                
                <div className="inline-flex items-center gap-2 rounded-md border border-[#E6EEF9] px-3 py-1 text-sm text-gray-600 bg-white/30 backdrop-blur-sm">
                  <Star className="h-4 w-4" style={{ color: "#0A4BA8" }} />
                  <span>Secure payments (Razorpay)</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-md border border-[#E6EEF9] px-3 py-1 text-sm text-gray-600 bg-white/30 backdrop-blur-sm">
                  <Star className="h-4 w-4" style={{ color: "#FFD24C" }} />
                  <span>Priority onboarding for Elite</span>
                </div>
              </div>
            </div>

            <div>
              <Card 
              className={"bg-gradient-to-br from-[#0b4a76] to-[#052f44] text-slate-100 rounded-2xl shadow-lg"}
              >
                <CardHeader>
                  <CardTitle
                    className="text-lg font-semibold"
                  >
                    FAQ
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Answers to common questions
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4 text-slate-300">
                    <div>
                      <div className="font-medium text-slate-100">
                        Can I switch plans later?
                      </div>
                      <div className="text-sm">
                        Yes — upgrade/downgrade from the account panel.
                        Pro-rated charges may apply.
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-slate-100">
                        Do you offer refunds?
                      </div>
                      <div className="text-sm">
                        We offer a 7-day refund window on new subscriptions.
                        Contact support@eazybeezy.com.
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-slate-100">
                        How do payments work?
                      </div>
                      <div className="text-sm">
                        Payments are collected via Razorpay. We store
                        subscription status and payment records securely.
                      </div>
                    </div>
                  </div>
                </CardContent>

                <div className="mt-6 flex items-center gap-3 px-6 pb-6">
                  <Star className="h-6 w-6" style={{ color: "#FFD24C" }} />
                  <div>
                    <div
                      className="text-sm font-medium text-slate-100"
                    >
                      Need onboarding?
                    </div>
                    <div className="text-sm text-slate-300">
                      EazyElite includes free onboarding. Or book a session for
                      any plan.
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <div className="mt-12 text-center text-sm text-slate-700">
            <div>
              Have questions? {" "}
              <a
                href="mailto:support@eazybeezy.com"
                className="underline"
                style={{ color: "#FFD24C" }}
              >
                Contact support
              </a>{" "}
              {"— we're happy to help."}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
