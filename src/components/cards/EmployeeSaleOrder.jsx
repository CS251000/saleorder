"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { formattedDate } from "@/lib/constants";

export default function EmployeeSaleOrder({ SaleOrder, onDispatched,userRole,handleDeleteOrder }) {
  const [open, setOpen] = useState(false);
  const [dispatchCount, setDispatchCount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openModal = () => {
    setDispatchCount("");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setDispatchCount("");
    setSubmitting(false);
  };

  const handleSubmitDispatch = async (e) => {
    e.preventDefault();

    const count = Number(dispatchCount);
    const pending = Number(SaleOrder.pendingCase ?? SaleOrder.pending_case ?? 0);

    if (!Number.isInteger(count) || count <= 0) {
      toast.error("Enter a valid positive integer for cases to dispatch.");
      return;
    }
    if (count > pending) {
      toast.error(`Cannot dispatch more than pending cases (${pending}).`);
      return;
    }

    if (!confirm(`Dispatch ${count} case(s) for this order?`)) return;

    setSubmitting(true);

    const dispatchPromise = fetch("/api/dispatch", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: SaleOrder.id, dispatchCount: count }),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || "Failed to dispatch order");
      }
      return res.json();
    });

    toast.promise(dispatchPromise, {
      loading: `Dispatching ${count} case(s)...`,
      success: "Dispatched successfully!",
      error: "Failed to dispatch.",
    });

    try {
      const data = await dispatchPromise;
      closeModal();

      // server should return updated order in data.saleOrder (or data)
      const updatedOrder = data?.saleOrder ?? data;
      if (typeof onDispatched === "function") {
        try {
          onDispatched(updatedOrder);
        } catch (err) {
          console.error("onDispatched callback error:", err);
        }
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };


  const pendingDisplay = SaleOrder.pendingCase ?? SaleOrder.pending_case ?? 0;

  return (
    <div className="h-full flex flex-col">
      <Card className="w-full h-full shadow-lg rounded-2xl">
        <CardContent className="space-y-3 text-gray-700">
          <div className="flex justify-between">
            <span className="font-medium text-[#415A77]">Order Number:</span>
            <span className="font-bold text-[#1B263B]">
              {SaleOrder.orderNumber || "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-[#415A77]">Date:</span>
            <span className="font-bold text-[#1B263B]">
              {formattedDate(SaleOrder.orderDate)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-[#415A77]">Party Name:</span>
            <span className="font-bold text-[#1B263B]">
              {SaleOrder.partyName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-[#415A77]">Agent Name:</span>
            <span className="font-bold text-[#1B263B]">
              {SaleOrder.agentName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-[#415A77]">Total Cases:</span>
            <span className="font-bold text-[#1B263B]">
              {SaleOrder.totalCase}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-[#415A77]">Pending Cases:</span>
            <span className="font-bold text-[#1B263B]">
              {pendingDisplay}
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          {userRole==="Manager" && (
          <Button variant={'outline'} className={'cursor-pointer'}
            onClick={()=>{
              handleDeleteOrder(SaleOrder.id);
            }}
           >
            Delete
          </Button>
          )}
          {String(SaleOrder.orderStatus ?? SaleOrder.status) === "Dispatched" ||
          Number(pendingDisplay) === 0 ? (
            <Button
              className="px-6 bg-green-600 cursor-not-allowed"
              disabled
            >
              Dispatched
            </Button>
          ) : (
            <Button
              className="px-6 bg-[#0D1B2A]"
              onClick={openModal}
            >
              Dispatch
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dispatch Cases</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitDispatch} className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium mb-1">Pending Cases</label>
              <div className="w-full border rounded px-3 py-2 bg-gray-50">
                {pendingDisplay}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">No. of Cases to Dispatch</label>
              <input
                type="number"
                min={1}
                max={Number(pendingDisplay)}
                value={dispatchCount}
                onChange={(e) => setDispatchCount(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter number of cases to dispatch"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => closeModal()}
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Dispatching..." : "Dispatch"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
