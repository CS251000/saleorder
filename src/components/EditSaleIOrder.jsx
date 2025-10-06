"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";


export default function EditSaleOrderForm({
  SaleOrder,
  managerId,
  currUser,
  employeeDashboard = false,
  triggerLabel = "Edit",
  triggerClassName = "p-4",
}) {
  const [open, setOpen] = useState(false);

  // lists
  const [parties, setParties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [employees, setEmployees] = useState([]);

  // party/agent combobox state
  const [partyQuery, setPartyQuery] = useState("");
  const [partyId, setPartyId] = useState("");
  const [partyName, setPartyName] = useState("");

  const [agentQuery, setAgentQuery] = useState("");
  const [agentId, setAgentId] = useState("");
  const [agentName, setAgentName] = useState("");

  const [partyOpen, setPartyOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);

  const partyRef = useRef(null);
  const agentRef = useRef(null);

  // order fields
  const [employeeId, setEmployeeId] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [totalCases, setTotalCases] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // populate lists and default fields when dialog opens
  useEffect(() => {
    if (!open) return;
    let mounted = true;

    async function fetchAll() {
      try {
        const [pRes, aRes, eRes] = await Promise.all([
          fetch(`/api/parties?managerId=${managerId}`),
          fetch(`/api/agents?managerId=${managerId}`),
          fetch(`/api/employees?managerId=${managerId}`),
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

        setParties(pData?.parties ?? (Array.isArray(pData) ? pData : pData ?? []));
        setAgents(aData?.agents ?? (Array.isArray(aData) ? aData : aData ?? []));
        if (!employeeDashboard) {
          setEmployees(eData?.employees ?? (Array.isArray(eData) ? eData : eData ?? []));
        } else {
          setEmployees([currUser]);
        }

        // populate form fields from SaleOrder (if provided)
        if (SaleOrder) {
          // normalise keys with fallbacks
          const pId = SaleOrder.partyId ?? SaleOrder.party_id ?? SaleOrder.partyId;
          const pLabel = SaleOrder.partyName ?? SaleOrder.party_name ?? SaleOrder.partyName ?? "";
          const aId = SaleOrder.agentId ?? SaleOrder.agent_id ?? SaleOrder.agentId;
          const aLabel = SaleOrder.agentName ?? SaleOrder.agent_name ?? SaleOrder.agentName ?? "";

          setPartyId(pId ?? "");
          setPartyName(pLabel ?? "");
          setPartyQuery(pLabel ?? "");

          setAgentId(aId ?? "");
          setAgentName(aLabel ?? "");
          setAgentQuery(aLabel ?? "");

          const staff = SaleOrder.staff ?? SaleOrder.employeeId ?? SaleOrder.staff ?? "";
          setEmployeeId(staff ? String(staff) : "");

          setOrderNumber(SaleOrder.orderNumber ?? SaleOrder.order_number ?? "");
          setOrderDate((SaleOrder.orderDate ?? SaleOrder.order_date ?? "").slice(0, 10) || "");
          setTotalCases(String(SaleOrder.totalCase ?? SaleOrder.total_cases ?? SaleOrder.totalCase ?? ""));
        }
      } catch (err) {
        console.error("fetch error:", err);
        toast.error("Could not load parties/agents/employees");
      }
    }

    fetchAll();
    return () => {
      mounted = false;
    };
  }, [open, managerId, SaleOrder, employeeDashboard, currUser]);

  // outside click to close lists
  useEffect(() => {
    function onDocMouseDown(e) {
      if (partyRef.current && !partyRef.current.contains(e.target)) setPartyOpen(false);
      if (agentRef.current && !agentRef.current.contains(e.target)) setAgentOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const resetForm = () => {
    setPartyQuery("");
    setPartyId("");
    setPartyName("");
    setAgentQuery("");
    setAgentId("");
    setAgentName("");
    setEmployeeId("");
    setTotalCases("");
    setOrderDate("");
    setOrderNumber("");
    setSubmitting(false);
  };

  const findPartyByLabel = (label) =>
    parties.find(
      (p) =>
        String(p.partyName ?? p.name ?? "")
          .trim()
          .toLowerCase() === label.trim().toLowerCase()
    );

  const findAgentByLabel = (label) =>
    agents.find(
      (a) =>
        String(a.agentName ?? a.name ?? "")
          .trim()
          .toLowerCase() === label.trim().toLowerCase()
    );

  const filteredParties = useMemo(() => {
    const q = partyQuery.trim().toLowerCase();
    if (!q) return parties;
    return parties.filter((p) =>
      String(p.partyName ?? p.name ?? "").toLowerCase().includes(q)
    );
  }, [parties, partyQuery]);

  const filteredAgents = useMemo(() => {
    const q = agentQuery.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter((a) =>
      String(a.agentName ?? a.name ?? "").toLowerCase().includes(q)
    );
  }, [agents, agentQuery]);

  // create helpers (same as Add form)
  const createParty = async (name) => {
    const payload = { partyName: name, managerId };
    const res = await fetch("/api/parties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || "Failed to create party");
    }
    const data = await res.json();
    return data.party ?? data.newParty ?? data ?? {};
  };

  const createAgent = async (name) => {
    const payload = { agentName: name, managerId };
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || "Failed to create agent");
    }
    const data = await res.json();
    return data.agent ?? data.newAgent ?? data ?? {};
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();

    if (
      (!partyId && !partyName.trim()) ||
      (!agentId && !agentName.trim()) ||
      !orderDate ||
      !employeeId ||
      Number(totalCases) <= 0
    ) {
      toast.error("Fill party, agent, date, employee and total cases (>0).");
      return;
    }

    setSubmitting(true);
    try {
      let finalPartyId = partyId;
      let finalAgentId = agentId;

      // resolve or create party
      if (!finalPartyId && partyName.trim()) {
        const existing = findPartyByLabel(partyName);
        if (existing) {
          finalPartyId = existing.partyId ?? existing.id ?? existing.party_id;
        } else {
          const created = await createParty(partyName.trim());
          finalPartyId = created.partyId ?? created.id ?? created.party_id ?? null;
          if (finalPartyId) setParties((prev) => [created, ...prev]);
        }
      }

      // resolve or create agent
      if (!finalAgentId && agentName.trim()) {
        const existing = findAgentByLabel(agentName);
        if (existing) {
          finalAgentId = existing.agentId ?? existing.id ?? existing.agent_id;
        } else {
          const created = await createAgent(agentName.trim());
          finalAgentId = created.agentId ?? created.id ?? created.agent_id ?? null;
          if (finalAgentId) setAgents((prev) => [created, ...prev]);
        }
      }

      if (!finalPartyId) throw new Error("Party selection/creation failed");
      if (!finalAgentId) throw new Error("Agent selection/creation failed");

      const payload = {
        orderDate,
        partyId: finalPartyId,
        agentId: finalAgentId,
        staff: employeeId,
        totalCases: Number(totalCases),
        orderNumber: orderNumber,
      };

      // Preferred: update endpoint with ID in URL
      const id = SaleOrder.id ?? SaleOrder.orderId ?? SaleOrder.saleOrderId;
      let res = await fetch(`/api/sales-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // fallback: some servers accept PUT to /api/sales-orders with orderId in body
      if (!res.ok) {
        // try fallback
        res = await fetch("/api/sales-orders", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: id, ...payload }),
          
        });
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(txt || "Failed to update sale order");
      }

      const data = await res.json();
      const updatedOrder = data?.saleOrder ?? data ?? {};

      toast.success("Sale order updated");
      setOpen(false);
      resetForm();

      if (typeof onUpdated === "function") {
        try {
          onUpdated(updatedOrder);
        } catch (err) {
          console.error("onUpdated callback error:", err);
        }
      }
    } catch (err) {
      console.error("update order error:", err);
      toast.error(err.message || "Error updating sale order");
      setSubmitting(false);
    }
  };

  const selectParty = (p) => {
    const label = p.partyName ?? p.name ?? "";
    const id = p.partyId ?? p.id ?? p.party_id ?? "";
    setPartyQuery(label);
    setPartyName(label);
    setPartyId(id);
    setPartyOpen(false);
  };

  const selectAgent = (a) => {
    const label = a.agentName ?? a.name ?? "";
    const id = a.agentId ?? a.id ?? a.agent_id ?? "";
    setAgentQuery(label);
    setAgentName(label);
    setAgentId(id);
    setAgentOpen(false);
  };

  const chooseCreateParty = (label) => {
    setPartyQuery(label);
    setPartyName(label);
    setPartyId("");
    setPartyOpen(false);
  };
  const chooseCreateAgent = (label) => {
    setAgentQuery(label);
    setAgentName(label);
    setAgentId("");
    setAgentOpen(false);
  };

  const clearParty = () => {
    setPartyQuery("");
    setPartyName("");
    setPartyId("");
  };
  const clearAgent = () => {
    setAgentQuery("");
    setAgentName("");
    setAgentId("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={triggerClassName}>
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Sale Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpdateOrder} className="space-y-4 mt-2">
          {/* Order Number */}
          <div>
            <Label htmlFor="order-number">Order Number</Label>
            <Input
              id="order-number"
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="mt-1"
              placeholder="Add Order Number"
            />
          </div>

          {/* PARTY combobox */}
          <div ref={partyRef} className="bg-gray-300 rounded-3xl w-full p-3">
            <Label htmlFor="party">Party</Label>
            <div className="mt-1">
              <Command>
                <CommandInput
                  id="party-input"
                  placeholder="Click to search or create party"
                  value={partyQuery}
                  onValueChange={(val) => {
                    setPartyQuery(val);
                    if (partyId) setPartyId("");
                  }}
                  onFocus={() => setPartyOpen(true)}
                />
                {partyOpen && (
                  <CommandList>
                    <CommandEmpty>No parties found.</CommandEmpty>
                    {filteredParties.map((p) => {
                      const label = p.partyName ?? p.name ?? "";
                      return (
                        <CommandItem
                          key={String(p.partyId ?? p.id ?? label)}
                          onSelect={() => selectParty(p)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{label}</span>
                            {partyId && partyId === (p.partyId ?? p.id ?? "") ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : null}
                          </div>
                        </CommandItem>
                      );
                    })}
                    {partyQuery.trim().length > 0 && !findPartyByLabel(partyQuery) && (
                      <CommandItem onSelect={() => chooseCreateParty(partyQuery)}>
                        <div className="flex items-center justify-between w-full">
                          <span>Create new party “{partyQuery}”</span>
                        </div>
                      </CommandItem>
                    )}
                  </CommandList>
                )}
              </Command>
            </div>

            {partyName ? (
              <div className="mt-2 inline-flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full text-sm">
                <span>{partyName}</span>
                <button type="button" onClick={clearParty} className="inline-flex items-center" aria-label="Clear party">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Pick a party.</p>
            )}
          </div>

          {/* AGENT combobox */}
          <div ref={agentRef} className="bg-gray-300 rounded-3xl w-full p-3">
            <Label htmlFor="agent">Agent</Label>
            <div className="mt-3">
              <Command>
                <CommandInput
                  id="agent-input"
                  placeholder="Click to search or create agent"
                  value={agentQuery}
                  onValueChange={(val) => {
                    setAgentQuery(val);
                    if (agentId) setAgentId("");
                  }}
                  onFocus={() => setAgentOpen(true)}
                />
                {agentOpen && (
                  <CommandList>
                    <CommandEmpty>No agents found.</CommandEmpty>
                    {filteredAgents.map((a) => {
                      const label = a.agentName ?? a.name ?? "";
                      return (
                        <CommandItem
                          key={String(a.agentId ?? a.id ?? label)}
                          onSelect={() => selectAgent(a)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{label}</span>
                            {agentId && agentId === (a.agentId ?? a.id ?? "") ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : null}
                          </div>
                        </CommandItem>
                      );
                    })}
                    {agentQuery.trim().length > 0 && !findAgentByLabel(agentQuery) && (
                      <CommandItem onSelect={() => chooseCreateAgent(agentQuery)}>
                        <div className="flex items-center justify-between w-full">
                          <span>Create new agent “{agentQuery}”</span>
                        </div>
                      </CommandItem>
                    )}
                  </CommandList>
                )}
              </Command>
            </div>

            {agentName ? (
              <div className="mt-2 inline-flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full text-sm">
                <span>{agentName}</span>
                <button type="button" onClick={clearAgent} className="inline-flex items-center" aria-label="Clear agent">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Pick an agent (click the field).</p>
            )}
          </div>

          {/* Employee select */}
          <div>
            <Label htmlFor="employee-select">Employee</Label>
            <Select onValueChange={(val) => setEmployeeId(val)} value={employeeId}>
              <SelectTrigger id="employee-select" className="mt-1">
                <SelectValue placeholder="— choose an employee —" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((ee) => {
                  const id = ee.employeeId ?? ee.id ?? ee.clerkId ?? "";
                  const label =
                    ee.employeeName ??
                    ee.username ??
                    `${ee.firstName ?? ""} ${ee.lastName ?? ""}`.trim() ??
                    id;
                  return (
                    <SelectItem key={String(id)} value={String(id)}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Total cases */}
          <div>
            <Label htmlFor="total-cases">Total Cases</Label>
            <Input
              id="total-cases"
              type="number"
              min={0}
              value={totalCases}
              onChange={(e) => setTotalCases(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Order date */}
          <div>
            <Label htmlFor="order-date">Order Date</Label>
            <Input id="order-date" type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="mt-1" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setOpen(false); resetForm(); }} disabled={submitting}>
              Cancel
            </Button>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Updating..." : "Update Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
