"use client";

import React, { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar2 from "@/components/Navbar2";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";
import { useGlobalUser } from "@/context/UserContext";

// ✅ Inner component that uses useSearchParams
function TaskManagerContent() {
  const {currentUser} = useGlobalUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />
      <ManagerDashboard />
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
