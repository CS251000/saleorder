"use client";

import { AddJobOrderForm } from "@/components/addJobOrder";
import FabricatorJobSlipCard from "@/components/cards/FabricatorJobSlip";
import { FilterJobOrder } from "@/components/filterJobOrder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProdManager } from "@/context/ProdManagerContext";
import { useGlobalUser } from "@/context/UserContext";
import { useParams } from "next/navigation";
import React, { useState, useMemo } from "react";
import useSWR, { mutate as globalMutate } from "swr";

/* ----------------------------- 🧠 SWR Fetcher ----------------------------- */
const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
  return res.json();
};

export default function FabricatorDashboardPage() {
  const params = useParams();
  const { fabricatorId } = params;
  const { currentUser } = useGlobalUser();
  const managerId= currentUser?.id;
  const [searchTerm, setSearchTerm] = useState("");
  const [showType, setShowType] = useState("all");
  const {fabricators}= useProdManager();

  /* ----------------------------- 💾 Fetch Data ----------------------------- */
  const {
    data: jobSlips = [],
    error,
    isLoading,
    mutate,
  } = useSWR(
    currentUser?.id && fabricatorId
      ? `/api/jobOrder?managerId=${currentUser.id}&fabricatorId=${fabricatorId}`
      : null,
    fetcher,
    {
      revalidateOnFocus: true, // revalidate when tab gains focus
      dedupingInterval: 60 * 1000, // prevent duplicate fetches within 1 min
    }
  );

  const loading = isLoading && !jobSlips?.length;

  /* ----------------------------- 🔍 Filter + Search ----------------------------- */
  const filteredJobSlips = useMemo(() => {
    return (jobSlips || []).filter((item) => {
      const matchesStatus =
        showType === "all"
          ? true
          : showType === "pending"
          ? item.status === "Pending"
          : item.status === "Completed";

      const matchesSearch = item.jobSlipNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [jobSlips, showType, searchTerm]);

  /* ----------------------------- 🚀 Add Job Callback ----------------------------- */
  const handleAddSuccess = () => {
    // Refresh job slips after adding a new one
    mutate();
  };

   async function handleCompleteJobSlip(jobSlip) {
    const confirmComplete = window.confirm(
    `Are you sure you want to mark Job Slip ${jobSlip.jobSlipNumber} as Completed?`
  );

  if (!confirmComplete) return; // ❌ User cancelled — do nothing
  try {
    const res = await fetch(`/api/jobOrder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobSlipNumber: jobSlip.jobSlipNumber,
        designId: jobSlip.designId,
        fabricatorId: jobSlip.fabricatorId, }),
    });

    if (!res.ok) throw new Error("Failed to complete job slip");

    mutate();
    globalMutate(`/api/fabricators?managerId=${managerId}`);
    globalMutate(`/api/designs?managerId=${managerId}`);

  } catch (error) {
    console.error("Error completing job slip:", error);
  }
}

  /* ----------------------------- 🖥️ Render ----------------------------- */
  if (!currentUser)
    return <div className="text-center text-gray-500">Loading user...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-bold text-3xl break-words">
          {jobSlips?.[0]?.fabricatorName ||
            fabricators.find((f) => f.id === fabricatorId)?.name ||
            "Fabricator Dashboard"}
        </h2>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-500 left-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Input
            type="text"
            placeholder="Search job slips..."
            className="pl-12 pr-4 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Add Job + Filter */}
        <div className="flex flex-row gap-3 flex-wrap justify-center sm:justify-end">
          <AddJobOrderForm
            fabricatorId={fabricatorId}
            managerId={currentUser.id}
            onSuccess={handleAddSuccess}
          />
          <FilterJobOrder />
        </div>
      </div>

      {/* Tabs for filtering */}
      <Card className="shadow-md p-4 w-full">
        <CardHeader className="p-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold">Job Slips</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="flex flex-row gap-4">
          <div className="w-full flex justify-center sm:justify-start">
            <Tabs defaultValue="all" className="w-full sm:w-auto rounded-md p-1">
              <TabsList className="flex flex-row justify-around w-full sm:w-auto">
                <TabsTrigger value="all" onClick={() => setShowType("all")}>
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  onClick={() => setShowType("pending")}
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  onClick={() => setShowType("completed")}
                >
                  Completed
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Loading & Error */}
      {loading && (
        <p className="text-center text-gray-500 animate-pulse">Loading...</p>
      )}
      {error && (
        <p className="text-center text-red-500">
          Failed to load job slips.
        </p>
      )}

      {/* Job Slip Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredJobSlips.length > 0 ? (
          filteredJobSlips.map((item) => (
            <FabricatorJobSlipCard key={item.id || item.jobSlipNumber} jobSlip={item} onComplete={handleCompleteJobSlip} />
          ))
        ) : !loading ? (
          <p className="text-center col-span-full text-gray-500">
            No Job Slips Found
          </p>
        ) : null}
      </div>
    </div>
  );
}
