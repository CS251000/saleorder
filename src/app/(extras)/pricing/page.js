"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Star, ChevronRight } from "lucide-react";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { CircleUser } from "lucide-react";
import Image from "next/image";
import logo from "../../../../public/assets/logo.png";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function PricingPage() {
  const router = useRouter();
  const [annual, setAnnual] = React.useState(false);
  const [loadingPlan, setLoadingPlan] = React.useState(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const {user,isLoaded} = useUser();
  const [plans,setPlans]= useState([]);
  const [popularPlanId, setPopularPlanId] = useState("plan_RPH6h9QrtdXn2f"); 

  useEffect(()=>{
    const fetchPlans = async () => {
      const res = await fetch(`/api/plans`);
      const data = await res.json();
      data.items.sort((a, b) => a.item.amount - b.item.amount);
      setPlans(data.items);
      
    };
    fetchPlans();
  }, []);


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
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 pt-4 relative bg-[#A9DEF9]">
        {/* Main header row */}
        <div className="flex items-center justify-between">
          {/* Left: hamburger (mobile) + desktop logo+title */}
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setMenuOpen((s) => !s)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md focus:outline-none"
            >
              {menuOpen ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M6 6L18 18"
                    stroke="#14213D"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 18L18 6"
                    stroke="#14213D"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M4 7h16"
                    stroke="#14213D"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 12h16"
                    stroke="#14213D"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 17h16"
                    stroke="#14213D"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            {/* Desktop: logo + title (hidden on mobile) */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="rounded-full w-14 h-14 overflow-hidden flex items-center justify-center">
                <Image
                  src={logo}
                  alt="EasyBeezy logo"
                  width={56}
                  height={56}
                  className="object-contain w-12 h-12"
                />
              </div>

              <div>
                <Link href="/">
                <h1
                  className="text-base sm:text-lg font-extrabold text-[#00537a]"
                  // style={{ color: "var(--eb-navy)" }}
                >
                  EazyBeezy
                </h1></Link>
                <p className="text-[10px] sm:text-xs eb-muted -mt-1">
                  Business utilities made easy
                </p>
              </div>
            </div>
          </div>

          {/* Center: mobile title (visible on mobile, hidden on md+) */}
          <div className=" flex md:hidden items-center space-x-3">
            <div className="rounded-full w-14 h-14 overflow-hidden flex items-center justify-center">
              <Image
                src={logo}
                alt="EasyBeezy logo"
                width={56}
                height={56}
                className="object-contain w-12 h-12"
              />
            </div>

            <div>
              <h1
                className="text-base sm:text-lg font-extrabold"
                style={{ color: "var(--eb-navy)" }}
              >
                EazyBeezy
              </h1>
              <p className="text-[10px] sm:text-xs eb-muted -mt-1">
                Business utilities made easy
              </p>
            </div>
          </div>

          {/* Right: desktop nav (md+) OR sign-in text (mobile) */}
          <div className="flex items-center gap-3">
            {/* Desktop nav (unchanged) */}
            <nav className="hidden md:flex items-center gap-4">
              <a className="text-sm eb-muted hover:text-[var(--eb-navy)] cursor-pointer">
                Features
              </a>
              <Link
                href="/pricing"
                className="text-sm eb-muted hover:text-[var(--eb-navy)] cursor-pointer"
              >
                Pricing
              </Link>
              <a className="text-sm eb-muted hover:text-[var(--eb-navy)] cursor-pointer">
                Customers
              </a>

              <div className="flex items-center space-x-2 flex-nowrap">
                {!user ? (
                  <>
                    <SignUpButton mode="modal">
                      <Button
                        className="px-3 py-2 rounded-md text-sm"
                        style={{
                          background: "transparent",
                          border: "1px solid rgba(20,33,61,0.08)",
                          color: "var(--eb-navy)",
                        }}
                      >
                        Sign Up
                      </Button>
                    </SignUpButton>

                    <SignInButton mode="modal">
                      <Button
                        className="px-3 py-2 rounded-md text-sm font-medium eb-rounded-shadow text-[#f1faee] bg-[#00537a]"
                        style={{
                          // background: "var(--eb-royal)",
                          // color: "var(--eb-white)",
                        }}
                      >
                        Sign In
                      </Button>
                    </SignInButton>
                  </>
                ) : (
                  <UserButton/>
                    
                )}
              </div>
            </nav>

            {/* Mobile: Sign In title-only on right */}
            {!user ? (
              <div className="md:hidden">
                <SignUpButton mode="modal">
                  <Button
                    className="w-full px-3 py-2 rounded-md text-sm"
                    style={{
                      background: "var(--eb-royal)",
                      color: "var(--eb-white)",
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            ) : (
              <div className=" md:hidden pt-2">
                <UserButton/>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu panel (slide-down area) */}
        {menuOpen && (
          <div className="md:hidden mt-3 w-full bg-white eb-rounded-shadow eb-card p-4 z-40">
            <div className="flex flex-col gap-3">
              <a
                onClick={() => setMenuOpen(false)}
                className="text-base eb-muted hover:text-[var(--eb-navy)] cursor-pointer"
              >
                Features
              </a>
              <a
                onClick={() => setMenuOpen(false)}
                className="text-base eb-muted hover:text-[var(--eb-navy)] cursor-pointer"
              >
                Pricing
              </a>
              <a
                onClick={() => setMenuOpen(false)}
                className="text-base eb-muted hover:text-[var(--eb-navy)] cursor-pointer"
              >
                Customers
              </a>

              <div className="pt-2">
                {!user ? (
                  <SignUpButton mode="modal">
                    <Button
                      className="w-full px-3 py-2 rounded-md text-sm"
                      style={{
                        background: "var(--eb-royal)",
                        color: "var(--eb-white)",
                      }}
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign Up
                    </Button>
                  </SignUpButton>
                ) : (
                  <div>
                    <UserButton/>
                    
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="min-h-screen bg-[#f1faee] py-16 px-4 sm:px-6 lg:px-8 text-slate-900">
        <section className="mx-auto max-w-7xl">
          <header className="text-center">
            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-tight"
              style={{ color: "#00537a" }}
            >
              Pricing that keeps your business buzzing — simple, transparent,
              powerful
            </h1>
            <p className="mt-3 text-slate-700 max-w-2xl mx-auto">
              Pay every 3 months — plans built for small teams and growing
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
                  3 months
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Switch
                    checked={annual}
                    onCheckedChange={(v) => setAnnual(!!v)}
                  />
                  <span className="text-sm text-slate-600">
                    (Future yearly option)
                  </span>
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
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative overflow-visible transform transition-all duration-300 hover:translate-y-[-6px] ${
                  plan.id === popularPlanId ? "shadow-2xl" : "shadow"
                } bg-[#00537a]`}
                //  bg-gradient-to-br from-[#0b0c0f] via-[#1f2937] to-[#111827] text-slate-100
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
                        style={{ color: "#E6EEF9" }}
                      >
                        {plan.item.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-300">
                        {plan.item.description}
                      </CardDescription>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <div
                        className="text-3xl font-extrabold"
                        style={{
                          background: "linear-gradient(90deg,#FFD24C,#FFB83A)",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          color: "transparent",
                        }}
                      >
                        ₹{plan.item.amount / 100}
                      </div>
                      <div className="text-sm text-slate-400">
                        {plan.period}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul role="list" className="space-y-3 mb-6">
                    {/* {plan.features.map((f) => (
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
                    ))} */}
                  </ul>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <Button
                      onClick={() => handleSubscribe(plan)}
                      className={`w-full sm:w-auto px-6 py-3 font-semibold shadow-md transition-transform transform hover:-translate-y-0.5 focus:outline-none ${
                        plan.id === popularPlanId
                          ? "bg-gradient-to-r from-[#FFD24C] to-[#FFB83A] text-black"
                          : "bg-white border border-[#FFD24C] text-[#0A4BA8]"
                      }`}
                      disabled={loadingPlan === plan.id}
                    >
                      {loadingPlan === plan.id ? "Processing..." : "Subscribe Now"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    {/* <RazorpayForm 
                        src={plan.src}
                        id={plan.planid}
                      /> */}

                    <div className="mt-2 sm:mt-0 text-xs text-slate-400">
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
                      <div className="font-medium" style={{ color: "#A7C9FF" }}>
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
              <Card className="overflow-hidden bg-gradient-to-br 
              text-slate-100 bg-[#00537a]">
                {/* from-[#0b0c0f] via-[#1f2937] to-[#111827]  */}
                <div
                  className="py-6 px-6 bg-[#1d3557] m-3 rounded-2xl"
                  // style={{
                  //   background: "linear-gradient(90deg,#0b1220, #0d1630)",
                  // }}
                >
                  <CardHeader className="p-0">
                    <CardTitle
                      className="text-lg font-semibold "
                      // style={{ color: "#E6EEF9" }}
                    >
                      What's included
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
                          className="font-medium"
                          style={{ color: "#E6EEF9" }}
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
                          className="font-medium"
                          style={{ color: "#E6EEF9" }}
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
                          className="font-medium"
                          style={{ color: "#E6EEF9" }}
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
                          className="font-medium"
                          style={{ color: "#E6EEF9" }}
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
                <div className="inline-flex items-center gap-2 rounded-md border border-[#E6EEF9] px-3 py-1 text-sm text-gray-600">
                  <Star className="h-4 w-4" style={{ color: "#FFD24C" }} />
                  <span>7-day refund window</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-md border border-[#E6EEF9] px-3 py-1 text-sm text-gray-600">
                  <Star className="h-4 w-4" style={{ color: "#0A4BA8" }} />
                  <span>Secure payments (Razorpay)</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-md border border-[#E6EEF9] px-3 py-1 text-sm text-gray-600">
                  <Star className="h-4 w-4" style={{ color: "#FFD24C" }} />
                  <span>Priority onboarding for Elite</span>
                </div>
              </div>
            </div>

            <div>
              <Card 
              // className="bg-gradient-to-br from-[#0b0c0f] via-[#1f2937] to-[#111827] text-slate-100"
              className={"bg-[#00537a] text-slate-100"}
              >
                <CardHeader>
                  <CardTitle
                    className="text-lg font-semibold"
                    style={{ color: "#E6EEF9" }}
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
                      <div className="font-medium" style={{ color: "#E6EEF9" }}>
                        Can I switch plans later?
                      </div>
                      <div className="text-sm">
                        Yes — upgrade/downgrade from the account panel.
                        Pro-rated charges may apply.
                      </div>
                    </div>

                    <div>
                      <div className="font-medium" style={{ color: "#E6EEF9" }}>
                        Do you offer refunds?
                      </div>
                      <div className="text-sm">
                        We offer a 7-day refund window on new subscriptions.
                        Contact support@eazybeezy.com.
                      </div>
                    </div>

                    <div>
                      <div className="font-medium" style={{ color: "#E6EEF9" }}>
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
                      className="text-sm font-medium"
                      style={{ color: "#E6EEF9" }}
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
              Have questions?{" "}
              <a
                href="mailto:support@eazybeezy.com"
                className="underline"
                style={{ color: "#FFD24C" }}
              >
                Contact support
              </a>{" "}
              — we're happy to help.
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
