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

import EmployeeDashboard from "@/components/dashboards/EmployeeDashboard";
import LandingPage from "@/components/LandingPage";
import Image from "next/image";
import logo from "../../public/assets/logo.png";
import Navbar from "@/components/Navbar";
import SignupForm from "@/components/SignupForm";
import Navbar2 from "@/components/Navbar2";
import { useRouter } from "next/navigation";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home() {
  const { user, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ Use SWR for fetching current user info once user is loaded
  const { data, error, mutate } = useSWR(
    user && isLoaded ? `/api/user?id=${user.id}` : null,
    fetcher
  );

  const currentUser = data?.currentUser || null;
  const isInDB = data?.exists ?? null;

  // ✅ Clear cache on signOut
  useEffect(() => {
    const unsubscribe = clerk.addListener(({ event }) => {
      if (event === "signOut") mutate(null, false);
    });
    return unsubscribe;
  }, [clerk, mutate]);

  // ✅ Navigation functions (send full user object)
  const goToTaskManager = () => {
    if (!currentUser) return;
    const encoded = encodeURIComponent(JSON.stringify(currentUser));
    router.push(`/task-manager?user=${encoded}`);
  };

  const goToProdManager = () => {
    if (!currentUser) return;
    const encoded = encodeURIComponent(JSON.stringify(currentUser));
    router.push(`/prod-manager?user=${encoded}`);
  };

  // --------------------- LOADING STATE ---------------------
  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 pt-4 relative">
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
                alt="EazyBeezy logo"
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

  // --------------------- MAIN UI ---------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {isSignedIn && currentUser?.role === "Manager" ? (
        <Navbar2 currUser={currentUser} />
      ) : (
        <Navbar currUser={currentUser} />
      )}

      <main className="flex flex-col items-center justify-center">
        {!user ? (
          <LandingPage />
        ) : error ? (
          <div className="text-red-500 mt-10">⚠️ Error loading user data.</div>
        ) : !data ? (
          <div className="text-lg mt-10">🔍 Checking user...</div>
        ) : !isInDB ? (
          <SignupForm />
        ) : isSignedIn && currentUser?.role === "Manager" ? (
          // ✅ Manager dashboard entry
          <div className="flex flex-col gap-6 items-center mt-16">
            <h2 className="text-2xl font-bold mb-4 text-[var(--eb-navy)]">
              Welcome, {currentUser?.name || user?.firstName || "User"}!
            </h2>
            <div className="flex flex-col gap-6">
              <Button
                onClick={goToTaskManager}
                className="px-8 py-4 text-lg font-semibold eb-rounded-shadow"
              >
                Task Manager
              </Button>

              <Button
                onClick={goToProdManager}
                className="px-8 py-4 text-lg font-semibold eb-rounded-shadow"
              >
                Production Manager
              </Button>
            </div>
          </div>
        ) : (
          <EmployeeDashboard currUser={currentUser} />
        )}
      </main>
    </div>
  );
}
