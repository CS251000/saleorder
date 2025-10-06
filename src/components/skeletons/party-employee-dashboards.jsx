"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";

export default function PartyEmployeeDashboardSkeleton() {
  const [showPending, setShowPending] = useState(true);

  const skeletonArray = Array.from({ length: 8 });

  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header Section */}
      <div className="flex flex-row sm:items-center sm:justify-between gap-4">
        <div className="h-10 w-48 bg-gray-300 rounded-md"></div>

        <div className="relative w-80 mx-auto">
          <div className="absolute top-0 bottom-0 w-6 h-6 my-auto bg-gray-300 left-3 rounded"></div>
          <div className="h-10 w-full bg-gray-300 rounded-md pl-12 pr-4"></div>
        </div>

        <div className="flex flex-row gap-4 items-center">
          <div className="h-10 w-36 bg-gray-300 rounded-md"></div>
        </div>
      </div>

      {/* Toggle tabs */}
      <div className="flex w-full max-w-sm flex-col gap-6 mb-4">
        <Tabs defaultValue={showPending ? "pending" : "completed"} className="rounded-md p-1">
          <TabsList>
            <TabsTrigger
              value="pending"
              className={"cursor-pointer bg-gray-200 text-gray-400"}
              onClick={() => setShowPending(true)}
            >
              Pending Orders
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className={"cursor-pointer bg-gray-200 text-gray-400"}
              onClick={() => setShowPending(false)}
            >
              Completed Orders
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Orders Header */}
      <Card className="shadow-md p-4">
        <CardHeader className="p-0">
          <div className="flex flex-col items-start justify-start gap-4">
            <div>
              <CardTitle className="text-lg font-semibold leading-tight mb-0">
                <div className="h-6 w-32 bg-gray-300 rounded"></div>
              </CardTitle>
            </div>
            <div className="flex items-center gap-3">
              {/* Orders count */}
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 bg-gray-300 rounded mb-1"></div>
                <div className="h-4 w-16 bg-gray-300 rounded"></div>
              </div>

              {/* Cases badge */}
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-center">
                <div className="h-6 w-10 bg-gray-300 rounded mb-1"></div>
                <div className="h-4 w-20 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {skeletonArray.map((_, idx) => (
          <div key={idx} className="h-full space-y-2">
            <div className="h-40 bg-gray-200 rounded-md w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
