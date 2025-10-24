"use client";

import { useSearchParams } from "next/navigation";
import Navbar2 from "@/components/Navbar2";
import ProdManagerDashboard from "@/components/dashboards/ProdManager-Dashboard";
import React, { useMemo } from "react";


export default function ProductionManager() {
  const searchParams = useSearchParams();
  const encodedUser = searchParams.get("user");

  // ✅ Decode the user object from the URL
  const currentUser = useMemo(() => {
    if (!encodedUser) return null;
    try {
      return JSON.parse(decodeURIComponent(encodedUser));
    } catch (err) {
      console.error("Error decoding user from URL:", err);
      return null;
    }
  }, [encodedUser]);



  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        ⚠️ No user found in URL.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar2 currUser={currentUser} />
      <ProdManagerDashboard managerId={currentUser.id} />
    </div>
  );
}
