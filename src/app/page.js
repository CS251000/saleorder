"use client";

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
import { useGlobalUser } from "@/context/UserContext";

export default function Home() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { currentUser } = useGlobalUser();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);

  const goToTaskManager = () => router.push("/task-manager");
  const goToProdManager = () => router.push("/prod-manager");

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isSignedIn && currentUser?.role === "Manager" ? (
        <Navbar2/>
      ) : (
        <Navbar currUser={currentUser} />
      )}

      <main className="flex flex-col items-center justify-center">
        {!isSignedIn ? (
          <LandingPage />
        ) : !currentUser ? (
          <div className="text-gray-500 mt-10">Loading your profile...</div>
        ) : !currentUser.role ? (
          <SignupForm />
        ) : currentUser.role === "Manager" ? (
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
