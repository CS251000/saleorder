"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Image from "next/image";
import logo from "/public/assets/logo.png";

export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      style={{
        // fallback page background using palette
        background: `linear-gradient(180deg, var(--eb-white) 0%, rgba(20,33,61,0.03) 40%, var(--eb-white) 100%)`,
      }}
      className="min-h-screen text-[var(--eb-navy)]"
    >
      {/* CSS variables for the EasyBeezy palette (royal blue theme) */}
      <style>{`
        :root {
          --eb-black: #000000;
          --eb-navy: #14213D;
          --eb-royal: #274690;
          --eb-gray: #E5E5E5;
          --eb-white: #FFFFFF;
        }

        .eb-muted { color: rgba(20,33,61,0.68); }
        .eb-card { background: var(--eb-white); border: 1px solid rgba(20,33,61,0.06); }
        .eb-icon-bg { background: var(--eb-gray); }
        .eb-rounded-shadow { border-radius: 1rem; box-shadow: 0 8px 30px rgba(20,33,61,0.06); }
      `}</style>

      

      {/* rest of page (unchanged) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6">
        {/* Hero */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-start py-10 md:py-12">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight"
              style={{ color: "var(--eb-navy)" }}
            >
              Manage orders, teams & partners —{" "}
              <span style={{ color: "var(--eb-royal)" }}>effortlessly</span>
            </motion.h2>

            <p className="mt-3 text-sm sm:text-base" style={{ color: "rgba(20,33,61,0.75)" }}>
              EasyBeezy gives small businesses a simple, secure suite of utilities to manage sales orders,
              employees and parties — with fast search and private manager views so the right people see the right data.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-3">
              <a
                className="inline-flex items-center justify-center px-5 py-3 rounded-lg font-semibold shadow hover:shadow-lg w-full sm:w-auto"
                href="#signup"
                style={{
                  background: "var(--eb-royal)",
                  color: "var(--eb-white)",
                }}
              >
                Get started — free
              </a>

              <a
                className="inline-flex items-center justify-center px-4 py-3 rounded-lg text-sm w-full sm:w-auto"
                href="#features"
                style={{
                  border: "1px solid rgba(20,33,61,0.08)",
                  color: "var(--eb-navy)",
                }}
              >
                See features
              </a>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full w-10 h-10 grid place-items-center" style={{ background: "var(--eb-gray)" }}>⚡</div>
                <div>
                  <div className="font-medium" style={{ color: "var(--eb-navy)" }}>Quick setup</div>
                  <div className="text-xs eb-muted">Start in minutes — no training needed</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full w-10 h-10 grid place-items-center" style={{ background: "var(--eb-gray)" }}>🔒</div>
                <div>
                  <div className="font-medium" style={{ color: "var(--eb-navy)" }}>Private manager views</div>
                  <div className="text-xs eb-muted">Control who sees sensitive reports</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mockup card */}
          <div className="flex justify-center md:justify-end">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-md p-5 eb-rounded-shadow eb-card"
              style={{ borderRadius: "1rem" }}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-medium" style={{ color: "var(--eb-navy)" }}>Sales Orders</div>
                <div className="text-xs eb-muted">Today</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--eb-navy)" }}>#SO-1042</div>
                    <div className="text-xs eb-muted">Acme Textiles</div>
                  </div>
                  <div className="text-sm font-semibold" style={{ color: "var(--eb-navy)" }}>12 pcs</div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--eb-navy)" }}>#SO-1041</div>
                    <div className="text-xs eb-muted">BlueWave Prints</div>
                  </div>
                  <div className="text-sm font-semibold" style={{ color: "var(--eb-navy)" }}>5 pcs</div>
                </div>

                <div className="mt-3">
                  <div className="text-xs eb-muted">Quick search</div>
                  <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      className="flex-1 rounded-md px-3 py-2 text-sm w-full"
                      placeholder="Search orders, parties, employees..."
                      style={{
                        border: "1px solid rgba(20,33,61,0.08)",
                        background: "transparent",
                        color: "var(--eb-navy)",
                        borderRadius: 8,
                      }}
                    />
                    <button
                      className="px-3 py-2 rounded-md w-full sm:w-auto"
                      style={{ background: "var(--eb-gray)", borderRadius: 8 }}
                      aria-label="Search"
                    >
                      🔍
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-6 sm:py-8">
          <h3 className="text-xl sm:text-2xl font-semibold text-center" style={{ color: "var(--eb-navy)" }}>
            Core utilities — built for everyday business
          </h3>

          <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <FeatureCard title="Sales Orders" subtitle="Create & track orders end-to-end" icon={<IconOrders />} />
            <FeatureCard title="Employees" subtitle="Roles, attendance, and private manager notes" icon={<IconTeam />} />
            <FeatureCard title="Parties & Partners" subtitle="Manage suppliers, customers & contacts" icon={<IconPartners />} />
            <FeatureCard title="Fast Search" subtitle="Find orders, people or parties instantly" icon={<IconSearch />} />
          </div>
        </section>

        {/* Manager Private Views */}
        <section className="py-8 sm:py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-xl sm:text-2xl font-semibold" style={{ color: "var(--eb-navy)" }}>Private views for managers</h3>
            <p className="mt-2 text-sm eb-muted">
              Create restricted dashboards for managers with confidential metrics — payroll, pending approvals, and custom reports. Grant or revoke access with a click.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 sm:p-6 eb-card rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-3 eb-icon-bg">🔐</div>
                  <div>
                    <div className="font-semibold" style={{ color: "var(--eb-navy)" }}>Role-based access</div>
                    <div className="text-sm eb-muted">Managers see what matters — not everything.</div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 eb-card rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-3 eb-icon-bg">📊</div>
                  <div>
                    <div className="font-semibold" style={{ color: "var(--eb-navy)" }}>Private reports</div>
                    <div className="text-sm eb-muted">Sensitive KPIs in manager-only dashboards.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="signup" className="py-8 sm:py-12">
          <div
            className="max-w-4xl mx-auto rounded-2xl p-4 sm:p-8 eb-rounded-shadow flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            style={{
              background: "linear-gradient(90deg, rgba(39,70,144,0.08) 0%, rgba(245,245,245,0.5) 100%)",
              border: "1px solid rgba(20,33,61,0.04)",
            }}
          >
            <div className="flex-1">
              <h4 className="text-lg sm:text-2xl font-bold" style={{ color: "var(--eb-navy)" }}>Ready to simplify operations?</h4>
              <p className="mt-2 text-sm eb-muted">Sign up for a 14-day trial. No credit card required — just your email and you're good to go.</p>
            </div>

            <div className="w-full sm:w-72">
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  className="flex-1 rounded-md px-3 py-2 w-full"
                  placeholder="you@company.com"
                  style={{
                    border: "1px solid rgba(20,33,61,0.08)",
                    color: "var(--eb-navy)",
                  }}
                />
                <button
                  className="px-4 py-2 rounded-md font-semibold w-full sm:w-auto"
                  style={{
                    background: "var(--eb-royal)",
                    color: "var(--eb-white)",
                  }}
                >
                  Start free
                </button>
              </form>
              <div className="text-xs eb-muted mt-2">By starting you agree to our terms.</div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-bold" style={{ color: "var(--eb-navy)" }}>EasyBeezy</div>
              <div className="text-xs eb-muted">© {new Date().getFullYear()} EasyBeezy — All rights reserved</div>
            </div>

            <div className="flex gap-4 text-sm eb-muted">
              <a className="cursor-pointer">Privacy</a>
              <a className="cursor-pointer">Terms</a>
              <a className="cursor-pointer">Contact</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* ------------------ Small helper components (icons & cards) ------------------ */

function FeatureCard({ title, subtitle, icon }) {
  return (
    <div className="p-4 sm:p-5 rounded-xl eb-card hover:shadow-lg transition">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg grid place-items-center eb-icon-bg">{icon}</div>
        <div>
          <div className="font-semibold" style={{ color: "var(--eb-navy)" }}>{title}</div>
          <div className="text-sm eb-muted mt-1">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

function IconOrders() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6H21" stroke="#14213D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 10H21" stroke="#14213D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 16H17" stroke="#14213D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 20H14" stroke="#14213D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconTeam() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 21V19C17 17.8954 16.1046 17 15 17H9C7.89543 17 7 17.8954 7 19V21" stroke="#14213D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="9" r="4" stroke="#14213D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconPartners() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="#14213D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 21V19C21 16.7909 19.2091 15 17 15H7C4.79086 15 3 16.7909 3 19V21" stroke="#14213D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="6" stroke="#14213D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 21L16.65 16.65" stroke="#14213D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
