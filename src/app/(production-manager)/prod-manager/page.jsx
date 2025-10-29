"use client";

import React, {Suspense } from "react";
import Navbar2 from "@/components/Navbar2";
import ProdManagerDashboard from "@/components/dashboards/ProdManager-Dashboard";
import { useGlobalUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Inner component that actually uses useSearchParams
function ProdManagerContent() {
  
  const {currentUser} = useGlobalUser();

  if(!currentUser){
    return <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Loading user data... Try Reloading</p>
      <Link href="/"><Button>Reload</Button></Link>
    </div>
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
