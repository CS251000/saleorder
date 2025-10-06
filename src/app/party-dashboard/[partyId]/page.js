"use client";
import PartyDashboard from "@/components/dashboards/PartyDashboard";

import { useParams } from "next/navigation";
import React, { Suspense } from "react";
import Navbar from "@/components/Navbar";

// Separate component that uses useSearchParams

function PartyDashboardContent() {
  const params = useParams();
  const { partyId } = params;
  return (
    <div className="">
      <Navbar/>
      <PartyDashboard partyId={partyId} />
    </div>
  );
}

export default function PartyDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div>Loading...</div>
        </div>
      }
    >
      <PartyDashboardContent />
    </Suspense>
  );
}
