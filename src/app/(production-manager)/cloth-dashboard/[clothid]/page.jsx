"use client";

import { AddPurchaseOrderForm } from "@/components/addPurchaseOrder";
import ClothPO from "@/components/cards/ClothPO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGlobalUser } from "@/context/UserContext";
import { useParams } from "next/navigation";
import React, { useState, useMemo } from "react";
import useSWR from "swr";

/* ----------------------------- 🧠 SWR Fetcher ----------------------------- */
const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
  return res.json();
};

export default function ClothDashboardPage() {
  const params = useParams();
  const { clothid } = params;
  const { currentUser } = useGlobalUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [showType, setShowType] = useState("all");

  /* ----------------------------- 💾 Fetch Data ----------------------------- */
  const {
    data: purchaseOrders = [],
    error,
    isLoading,
    mutate,
  } = useSWR(
    currentUser?.id && clothid
      ? `/api/purchaseOrder?managerId=${currentUser.id}&clothId=${clothid}`
      : null,
    fetcher,
    {
      revalidateOnFocus: true, // refresh when tab regains focus
      dedupingInterval: 60 * 1000, // skip re-fetch if within 1 min
    }
  );

  const loading = isLoading && !purchaseOrders?.length;

  /* ----------------------------- 🔍 Search + Filter ----------------------------- */
  const filteredPOs = useMemo(() => {
    return (purchaseOrders || []).filter((po) => {
      const matchesStatus =
        showType === "all"
          ? true
          : showType === "pending"
          ? po.status === "Pending"
          : po.status === "Completed";

      const matchesSearch = po.poNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [purchaseOrders, showType, searchTerm]);

  /* ----------------------------- 🚀 Add PO Callback ----------------------------- */
  const handleAddSuccess = () => {
    // Revalidate data after adding new PO
    mutate();
  };

  /* ----------------------------- 🖥️ Render ----------------------------- */
  if (!currentUser)
    return <div className="text-center text-gray-500">Loading user...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-bold text-3xl break-words">
          {purchaseOrders?.[0]?.clothName || "Cloth Dashboard"}
        </h2>

        {/* Search */}
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
            placeholder="Search POs..."
            className="pl-12 pr-4 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Add New PO */}
        <div className="flex flex-row gap-3 flex-wrap justify-center sm:justify-end">
          <AddPurchaseOrderForm
            managerId={currentUser.id}
            clothId={clothid}
            onSuccess={handleAddSuccess}
          />
        </div>
      </div>

      {/* Tabs */}
      <Card className="shadow-md p-4 w-full">
        <CardHeader className="p-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold">
              Purchase Orders
            </CardTitle>
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

      {/* Loading + Error States */}
      {loading && (
        <p className="text-center text-gray-500 animate-pulse">Loading...</p>
      )}
      {error && (
        <p className="text-center text-red-500">
          Failed to load purchase orders.
        </p>
      )}

      {/* PO Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredPOs.length > 0 ? (
          filteredPOs.map((po) => <ClothPO key={po.id} purchaseOrder={po} />)
        ) : !loading ? (
          <p className="text-center col-span-full text-gray-500">
            No Purchase Orders Found
          </p>
        ) : null}
      </div>
    </div>
  );
}
