"use client";

import { useEffect, useRef, useState } from "react";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";
import EmployeeDashboard from "@/components/dashboards/EmployeeDashboard";
import LandingPage from "@/components/LandingPage";
import Image from "next/image";
import logo from "../../public/assets/logo.png";
import { CircleUser } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { user, isLoaded } = useUser();
  const [isInDB, setIsInDB] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user) return;

    // ✅ Clear local cache when user logs out
    if (!user) {
      localStorage.removeItem("isInDB");
      localStorage.removeItem("currentUser");
      return;
    }

    // ✅ Try to load cached data first
    const cachedUser = localStorage.getItem("currentUser");
    const cachedIsInDB = localStorage.getItem("isInDB");

    if (cachedUser && cachedIsInDB) {
      setCurrentUser(JSON.parse(cachedUser));
      setIsInDB(cachedIsInDB === "true");
      hasCheckedRef.current = true; // mark as done
      return;
    }

    if (hasCheckedRef.current) return; // already checked during session
    hasCheckedRef.current = true;

    async function checkUserInDB(user) {
      try {
        const res = await fetch(`/api/user?id=${user.id}`);
        const data = await res.json();

        setIsInDB(data.exists);
        setCurrentUser(data.currentUser);

        // ✅ Save in localStorage for next reload
        localStorage.setItem("isInDB", data.exists);
        localStorage.setItem("currentUser", JSON.stringify(data.currentUser));
      } catch (err) {
        console.error("Error checking user:", err);
        setIsInDB(false);
      }
    }

    checkUserInDB(user);
  }, [isLoaded, user]);

  async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          ...body,
        }),
      });

      const data = await res.json();
      const savedUser= data.user;

      // ✅ Set both flags
      setIsInDB(true);
      setCurrentUser(
        savedUser
      );
      localStorage.setItem("isInDB", "true");
      localStorage.setItem("currentUser", JSON.stringify(savedUser));
    } catch (err) {
      console.error("Error saving user:", err);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-medium">
        ⏳ Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 pt-4 relative">
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
                        className="px-3 py-2 rounded-md text-sm font-medium eb-rounded-shadow"
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
                  <UserButton>
                    <UserButton.MenuItems>
                      <UserButton.Link
                        label="View User Id"
                        labelIcon={<CircleUser />}
                        href={`/view-user-id?id=${currentUser?.id ?? ""}`}
                      />
                    </UserButton.MenuItems>
                  </UserButton>
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
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="View User Id"
                      labelIcon={<CircleUser />}
                      href={`/view-user-id?id=${currentUser?.id ?? ""}`}
                    />
                  </UserButton.MenuItems>
                </UserButton>
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
              <Link
                href="/pricing"
                onClick={() => setMenuOpen(false)}
                className="text-base eb-muted hover:text-[var(--eb-navy)] cursor-pointer"
              >
                Pricing
              </Link>
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
                    <UserButton>
                      <UserButton.MenuItems>
                        <UserButton.Link
                          label="View User Id"
                          labelIcon={<CircleUser />}
                          href={`/view-user-id?id=${currentUser?.id ?? ""}`}
                        />
                      </UserButton.MenuItems>
                    </UserButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      {/* Main Content */}
      <main className="flex flex-col items-center justify-center">
        {!user ? (
          <LandingPage />
        ) : isInDB === null ? (
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
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                  }}
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
        ) : currentUser.role === "Manager" ? (
          <ManagerDashboard currUser={currentUser} />
        ) : (
          <EmployeeDashboard currUser={currentUser} />
        )}
      </main>
    </div>
  );
}
