"use client";

import Image from "next/image";
import React, { useState } from "react";
import logo from "../../public/assets/logo.png";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Button } from "./ui/button";
import { CircleUser } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useGlobalUser } from "@/context/UserContext";

export default function Navbar2() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoaded } = useUser(); // Clerk hook
  const pathname = usePathname();
  const router= useRouter();
  const {currentUser}= useGlobalUser();
  const currUser= currentUser;

  // Safely get user ID when available
  const userId = currUser?.id??"";

   // ✅ Navigation functions (send full user object)
  const goToTaskManager = () => {
    router.push(`/task-manager`);
    router.refresh();
  };

  const goToProdManager = () => {
    router.push(`/prod-manager`);
    router.refresh();
  };

  return (
    <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 pt-4 relative mb-4 border-b-2 pb-4">
      <div className="flex items-center justify-between">
        {/* Left: logo + hamburger */}
        <div className="flex items-center gap-3">
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
                  d="M6 6L18 18M6 18L18 6"
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
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="#14213D"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          {/* Logo + Title */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src={logo}
              alt="EazyBeezy logo"
              width={48}
              height={48}
              className="object-contain w-10 h-10"
            />
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
          </Link>
        </div>

        {/* Center: nav links (visible on md+) */}
        <nav className="hidden md:flex items-center justify-between gap-12">
          <Link
            href={'/'}
            className={`text-md cursor-pointer transition-all duration-150 ${
              pathname === "/"
                ? "text-[var(--eb-royal)] font-semibold"
                : "eb-muted hover:text-[var(--eb-navy)]"
            }`}
          >
            Dashboard
          </Link>
          <Button
            onClick={goToTaskManager}
            variant={'ghost'}
            className={`text-md cursor-pointer transition-all duration-150 ${
              pathname.startsWith("/task-manager")
                ? "text-[var(--eb-royal)] font-semibold"
                : "eb-muted hover:text-[var(--eb-navy)]"
            }`}
          >
            Task Manager
          </Button>
          <Button
            onClick={goToProdManager}
            variant={'ghost'}
            className={`text-md cursor-pointer transition-all duration-150 ${
              pathname.startsWith("/prod-manager")
                ? "text-[var(--eb-royal)] font-semibold"
                : "eb-muted hover:text-[var(--eb-navy)]"
            }`}
          >
            Production Manager
          </Button>
        </nav>

        {/* Right: user or auth buttons */}
        <div className="flex items-center space-x-2">
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
                  label="View Profile"
                  labelIcon={<CircleUser />}
                  href={`/view-user-profile`}
                />
              </UserButton.MenuItems>
            </UserButton>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 w-full bg-white eb-rounded-shadow eb-card p-4 z-40">
          <div className="flex flex-col gap-3">
            <Link
            href={'/'}
            className={`text-md cursor-pointer transition-all duration-150 ${
              pathname === "/"
                ? "text-[var(--eb-royal)] font-semibold"
                : "eb-muted hover:text-[var(--eb-navy)]"
            }`}
          >
            Dashboard
          </Link>
          <Button
            onClick={goToTaskManager}
            variant={'ghost'}
            className={`text-md cursor-pointer transition-all duration-150 ${
              pathname.startsWith("/task-manager")
                ? "text-[var(--eb-royal)] font-semibold"
                : "eb-muted hover:text-[var(--eb-navy)]"
            }`}
          >
            Task Manager
          </Button>
            <Button
            variant={'ghost'}
              onClick={goToProdManager}
              className={`text-base cursor-pointer ${
                pathname.startsWith("/prod-manager")
                  ? "text-[var(--eb-royal)] font-semibold"
                  : "eb-muted hover:text-[var(--eb-navy)]"
              }`}
            >
              Production Manager
            </Button>

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
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="View Profile"
                      labelIcon={<CircleUser />}
                      href={`/view-user-profile`}
                    />
                  </UserButton.MenuItems>
                </UserButton>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
