"use client";

import React, { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar2 from "@/components/Navbar2";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";

// ✅ Inner component that uses useSearchParams
function TaskManagerContent() {
  const searchParams = useSearchParams();
  const userParam = searchParams.get("user");

  const currentUser = useMemo(() => {
    if (!userParam) return null;
    try {
      return JSON.parse(decodeURIComponent(userParam));
    } catch (err) {
      console.error("Error decoding user from URL:", err);
      return null;
    }
  }, [userParam]);

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
      <ManagerDashboard currUser={currentUser} />
    </div>
  );
}

// ✅ Outer component wraps Suspense boundary
export default function TaskManager() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
        </div>
      }
    >
      <TaskManagerContent />
    </Suspense>
  );
}
