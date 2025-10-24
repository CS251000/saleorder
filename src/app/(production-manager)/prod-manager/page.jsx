"use client";

import React, { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar2 from "@/components/Navbar2";
import ProdManagerDashboard from "@/components/dashboards/ProdManager-Dashboard";

// Inner component that actually uses useSearchParams
function ProdManagerContent() {
  const searchParams = useSearchParams();
  const encodedUser = searchParams.get("user");

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
      <div className="flex items-center justify-center h-screen text-gray-600 text-lg">
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

// Outer component wraps Suspense boundary
export default function ProductionManagerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
        </div>
      }
    >
      <ProdManagerContent />
    </Suspense>
  );
}
