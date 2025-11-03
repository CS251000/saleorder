"use client";

import React, {Suspense } from "react";
import ProdManagerDashboard from "@/components/dashboards/ProdManager-Dashboard";
import { useGlobalUser } from "@/context/UserContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Inner component that actually uses useSearchParams
function ProdManagerContent() {
  
  const {currentUser} = useGlobalUser();

  if(!currentUser){
    return <div className="flex flex-col gap-8 px-4 sm:px-6 lg:px-10 py-6 bg-gray-50 min-h-screen">
      {/* ✅ Header Section */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl shadow-md p-6">
        <div className="flex flex-col md:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 md:h-8 w-64 bg-indigo-300" />
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Skeleton className="h-10 w-32 bg-indigo-300" />
            <Skeleton className="h-10 w-32 bg-indigo-300" />
          </div>
        </div>
      </div>

      {/* ✅ Accordion Section */}
      <div className="flex flex-col lg:flex-row justify-around gap-6">
        {/* Left Card */}
        <Card className="shadow-sm border border-gray-200 rounded-2xl w-full lg:w-1/2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full bg-gray-300" />
              <Skeleton className="h-5 w-40 bg-gray-300" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Accordion items */}
            {[1, 2].map((i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl shadow-sm bg-white p-4 space-y-3"
              >
                <Skeleton className="h-6 w-48 bg-gray-200" />
                {/* Table skeleton */}
                <div className="space-y-2 mt-2">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton
                      key={j}
                      className="h-5 w-full bg-gray-100 rounded-md"
                    />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Card */}
        <Card className="shadow-sm border border-gray-200 rounded-2xl w-full lg:w-1/2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full bg-gray-300" />
              <Skeleton className="h-5 w-40 bg-gray-300" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl shadow-sm bg-white p-4 space-y-3"
              >
                <Skeleton className="h-6 w-48 bg-gray-200" />
                <div className="space-y-2 mt-2">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton
                      key={j}
                      className="h-5 w-full bg-gray-100 rounded-md"
                    />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar2 /> */}
      <ProdManagerDashboard/>
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
