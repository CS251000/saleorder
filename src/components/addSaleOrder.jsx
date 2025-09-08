"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { CirclePlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

export default function AddSaleOrderForm({
  currUser,
  onCreated,
  triggerLabel = "Add Sale Order",
  triggerClassName = "flex items-center gap-2",
}) {
  const [open, setOpen] = useState(false);

  // dropdown data
  const [parties, setParties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [employees, setEmployees] = useState([]);

  // form state
  const [partyId, setPartyId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [employeeId, setEmployeeId] = useState(""); 
  const [orderDate, setOrderDate] = useState("");
  const [totalCases, setTotalCases] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    async function fetchAll() {
      try {
        const [pRes, aRes, eRes] = await Promise.all([
          fetch("/api/parties"),
          fetch("/api/agents"),
          fetch("/api/employees"),
        ]);

        if (!pRes.ok || !aRes.ok || !eRes.ok) {
          throw new Error("Failed to fetch parties/agents/employees");
        }

        const [pData, aData, eData] = await Promise.all([
          pRes.json(),
          aRes.json(),
          eRes.json(),
        ]);

        if (!mounted) return;

        setParties(pData.parties ?? pData ?? []);
        setAgents(aData.agents ?? aData ?? []);
        setEmployees(eData.employees ?? eData ?? []);
      } catch (err) {
        console.error("fetchPartiesAndAgents error:", err);
        toast.error("Could not load parties or agents");
      }
    }
    fetchAll();

    return () => {
      mounted = false;
    };
  }, [open]);

  const resetForm = () => {
    setPartyId("");
    setAgentId("");
    setEmployeeId("");
    setTotalCases(0);
    setOrderDate("");
    setSubmitting(false);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (!partyId || !agentId || !orderDate || !employeeId || Number(totalCases) <= 0) {
      toast.error("Please fill party, agent, date, employee fields and total cases");
      return;
    }

    const payload = {
      orderDate,
      partyId,
      agentId,
      staff: employeeId,
      totalCases: Number(totalCases),
      orderStatus: "Pending",
      
    };

    setSubmitting(true);

    try {
      console.log("Creating order with", payload);
      const res = await fetch("/api/sales-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to create order");
      }

      await res.json();
      toast.success("Sale order created");

      setOpen(false);
      resetForm();

      if (typeof onCreated === "function") {
        try {
          await onCreated();
        } catch (err) {
          
          console.error("onCreated callback error:", err);
        }
      }
    } catch (err) {
      console.error("create order error:", err);
      toast.error("Error creating sale order");
      setSubmitting(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className={triggerClassName}>
          <CirclePlus className="h-5 w-5" />
          <span className="hidden sm:inline">{triggerLabel}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Sale Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleCreateOrder} className="space-y-4 mt-2">
          {/* Party */}
          <div>
            <label className="block text-sm font-medium mb-1">Select Party</label>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">— choose a party —</option>
              {parties.map((p) => {
                const id= p.partyId, label = p.partyName;
                return (
                  <option key={String(id ?? JSON.stringify(p))} value={id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Agent */}
          <div>
            <label className="block text-sm font-medium mb-1">Select Agent</label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">— choose an agent —</option>
              {agents.map((a) => {
                const id = a.agentId;
                const label = a.agentName;
                return (
                  <option key={String(id ?? JSON.stringify(a))} value={id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Employee */}
          <div>
            <label className="block text-sm font-medium mb-1">Select Employee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">— choose an employee —</option>
              {employees.map((ee) => {
                
                const id = ee.employeeId
                const label =
                  ee.employeeName
                return (
                  <option key={String(id ?? JSON.stringify(ee))} value={id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Total Cases */}
          <div>
            <label className="block text-sm font-medium mb-1">Total Cases</label>
            <input
              type="number"
              value={totalCases}
              onChange={(e) => setTotalCases(e.target.value)}
              className="w-full border rounded px-3 py-2"
              min={0}
            />
          </div>

          {/* Order Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Order Date</label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
