"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";
import {
  SignInButton,
  SignUpButton,
  useClerk,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";
import EmployeeDashboard from "@/components/dashboards/EmployeeDashboard";
import LandingPage from "@/components/LandingPage";
import Image from "next/image";
import logo from "../../public/assets/logo.png";
import { CircleUser } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home() {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  // ✅ Use SWR for fetching current user info once user is loaded
  const { data, error, mutate } = useSWR(
    user && isLoaded ? `/api/user?id=${user.id}` : null,
    fetcher
  );

  // Extracted info
  const currentUser = data?.currentUser || null;
  const isInDB = data?.exists ?? null;

  // ✅ Clear cache on signOut
  useEffect(() => {
    const unsubscribe = clerk.addListener(({ event }) => {
      if (event === "signOut") mutate(null, false);
    });
    return unsubscribe;
  }, [clerk, mutate]);

  // ✅ Handle role form submission
  async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const role = formData.get("role");

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        await mutate(); // 🔄 revalidate SWR data
      }
    } catch (err) {
      console.error("Error saving user:", err);
    }
  }

  // ==============================
  // UI HANDLING SECTION
  // ==============================

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 pt-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md focus:outline-none"
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6L18 18M6 18L18 6"
                    stroke="#14213D"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="#14213D"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            <div className="hidden md:flex items-center space-x-3">
              <Image
                src={logo}
                alt="EasyBeezy logo"
                width={56}
                height={56}
                className="object-contain w-12 h-12"
              />
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-[var(--eb-navy)]">
                  EazyBeezy
                </h1>
                <p className="text-[10px] sm:text-xs eb-muted -mt-1">
                  Business utilities made easy
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <SignUpButton mode="modal">
                  <Button
                    className="px-3 py-2 text-sm"
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
                    className="px-3 py-2 text-sm font-medium eb-rounded-shadow"
                    style={{
                      background: "var(--eb-royal)",
                      color: "var(--eb-white)",
                    }}
                  >
                    Sign In
                  </Button>
                </SignInButton>
              </>
            ) : (
              <UserButton />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // MAIN PAGE CONTENT
  // ==============================

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currUser={currentUser} />
      <main className="flex flex-col items-center justify-center">
        {!user ? (
          <LandingPage />
        ) : error ? (
          <div className="text-red-500 mt-10">⚠️ Error loading user data.</div>
        ) : !data ? (
          <div className="text-lg mt-10">🔍 Checking user...</div>
        ) : !isInDB ? (
          <Card className="w-[350px] mt-8">
            <CardHeader>
              <CardTitle>Select Your Role</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <select
                  name="role"
                  required
                  className="border rounded p-2 w-full"
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="">-- Choose Role --</option>
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                </select>
                <Button type="submit" className="w-full">
                  Save & Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : currentUser?.role === "Manager" ? (
          <ManagerDashboard currUser={currentUser} />
        ) : (
          <EmployeeDashboard currUser={currentUser} />
        )}
      </main>
    </div>
  );
}
