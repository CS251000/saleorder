"use client";

import Image from 'next/image';
import React, { useState } from 'react'
import logo from "../../public/assets/logo.png"
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { Button } from './ui/button';
import { CircleUser } from 'lucide-react';
import Link from 'next/link';


export default function Navbar({currUser}) {

  const [menuOpen,setMenuOpen]= useState(false);
  const {user,isLoaded}= useUser();


  return (
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 pt-4 relative mb-4">
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
                <Link href="/">
                <Image
                  src={logo}
                  alt="EasyBeezy logo"
                  width={56}
                  height={56}
                  className="object-contain w-12 h-12"
                />
                </Link>
              </div>

              <div>
                <Link href='/'>
                <h1
                  className="text-base sm:text-lg font-extrabold"
                  style={{ color: "var(--eb-navy)" }}
                >
                  EazyBeezy
                </h1>
                </Link>
                <p className="text-[10px] sm:text-xs eb-muted -mt-1">
                  Business utilities made easy
                </p>
              </div>
            </div>
          </div>

          {/* Center: mobile title (visible on mobile, hidden on md+) */}
          <div className=" flex md:hidden items-center space-x-3">
            <div className="rounded-full w-14 h-14 overflow-hidden flex items-center justify-center">
              <Link href='/'>
              <Image
                src={logo}
                alt="EasyBeezy logo"
                width={56}
                height={56}
                className="object-contain w-12 h-12"
              />
              </Link>
            </div>

            <div>
              <Link href={'/'}>
              <h1
                className="text-base sm:text-lg font-extrabold"
                style={{ color: "var(--eb-navy)" }}
              >
                EazyBeezy
              </h1>
              </Link>
              <p className="text-[10px] sm:text-xs eb-muted -mt-1">
                Business utilities made easy
              </p>
            </div>
          </div>

          {/* Right: desktop nav (md+) OR sign-in text (mobile) */}
          <div className="flex items-center gap-3">
            {/* Desktop nav (unchanged) */}
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/" className="text-sm eb-muted hover:text-[var(--eb-navy)] cursor-pointer">
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-sm eb-muted hover:text-[var(--eb-navy)] cursor-pointer"
              >
                Pricing
              </Link>
              <Link href="/" className="text-sm eb-muted hover:text-[var(--eb-navy)] cursor-pointer">
                Customers
              </Link>

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
                        href={`/view-user-id?id=${currUser?.id ?? ""}`}
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
                      href={`/view-user-id?id=${currUser?.id ?? ""}`}
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
              <Link href={'/'}
                onClick={() => setMenuOpen(false)}
                className="text-base eb-muted hover:text-[var(--eb-navy)] cursor-pointer"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMenuOpen(false)}
                className="text-base eb-muted hover:text-[var(--eb-navy)] cursor-pointer"
              >
                Pricing
              </Link>
              <Link
              href={'/'}
                onClick={() => setMenuOpen(false)}
                className="text-base eb-muted hover:text-[var(--eb-navy)] cursor-pointer"
              >
                Customers
              </Link>

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
                          href={`/view-user-id?id=${currUser?.id ?? ""}`}
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
  )
}
