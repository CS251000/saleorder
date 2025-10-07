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
import toast, { Toaster } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import { mutate } from "swr";

export default function EditSaleOrderForm({
  SaleOrder,
  managerId,
  triggerLabel = "Edit",
  triggerClassName = "p-4 cursor-pointer",
  onUpdated,
}) {
  const [open, setOpen] = useState(false);
  const [loading,setLoading]= useState(false);

  // lists
  const [parties, setParties] = useState([]);
  const [agents, setAgents] = useState([]);

  // combobox state
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
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [totalCases, setTotalCases] = useState("");
  const [pendingCases,setPendingCases]= useState("");
  const [submitting, setSubmitting] = useState(false);

  // populate lists and defaults when dialog opens
  useEffect(() => {
    if (!open) return;
    let mounted = true;

    async function fetchAll() {
      try {
        setLoading(true);
        const [pRes, aRes] = await Promise.all([
          fetch(`/api/parties?managerId=${managerId}`),
          fetch(`/api/agents?managerId=${managerId}`),
        ]);

        if (!pRes.ok || !aRes.ok) throw new Error("Failed to fetch parties/agents");

        const [pData, aData] = await Promise.all([pRes.json(), aRes.json()]);
        if (!mounted) return;

        setParties(pData?.parties ?? (Array.isArray(pData) ? pData : []));
        setAgents(aData?.agents ?? (Array.isArray(aData) ? aData : []));

        if (SaleOrder) {
          const pId = SaleOrder.partyId ?? SaleOrder.party_id;
          const pLabel = SaleOrder.partyName ?? SaleOrder.party_name ?? "";
          const aId = SaleOrder.agentId ?? SaleOrder.agent_id;
          const aLabel = SaleOrder.agentName ?? SaleOrder.agent_name ?? "";

          setPartyId(pId ?? "");
          setPartyName(pLabel);
          setPartyQuery(pLabel);

          setAgentId(aId ?? "");
          setAgentName(aLabel);
          setAgentQuery(aLabel);

          setOrderNumber(SaleOrder.orderNumber ?? SaleOrder.order_number ?? "");
          setOrderDate((SaleOrder.orderDate ?? SaleOrder.order_date ?? "").slice(0, 10) || "");
          setTotalCases(String(SaleOrder.totalCase  ?? ""));
          setPendingCases(String(SaleOrder.pendingCase??""));
        }
      } catch (err) {
        console.error("fetch error:", err);
        toast.error("Could not load parties/agents");
      }finally{
        setLoading(false);
      }
    }

    fetchAll();
    return () => (mounted = false);
  }, [open, managerId, SaleOrder]);

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
    setTotalCases("");
    setPendingCases("");
    setOrderDate("");
    setOrderNumber("");
    setSubmitting(false);
  };

  const findPartyByLabel = (label) =>
    parties.find(
      (p) =>
        String(p.partyName ?? p.name ?? "").trim().toLowerCase() ===
        label.trim().toLowerCase()
    );

  const findAgentByLabel = (label) =>
    agents.find(
      (a) =>
        String(a.agentName ?? a.name ?? "").trim().toLowerCase() ===
        label.trim().toLowerCase()
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

  const createParty = async (name) => {
    const res = await fetch("/api/parties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partyName: name, managerId }),
    });
    if (!res.ok) throw new Error("Failed to create party");
    const data = await res.json();
    return data.party ?? data.newParty ?? data;
  };

  const createAgent = async (name) => {
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentName: name, managerId }),
    });
    if (!res.ok) throw new Error("Failed to create agent");
    const data = await res.json();
    return data.agent ?? data.newAgent ?? data;
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();

    if (
      (!partyId && !partyName.trim()) ||
      (!agentId && !agentName.trim()) ||
      !orderDate ||
      Number(totalCases) <= 0
    ) {
      toast.error("Fill party, agent, date, and total cases (>0).");
      return;
    }

    setSubmitting(true);
    try {
      let finalPartyId = partyId;
      let finalAgentId = agentId;

      if (!finalPartyId && partyName.trim()) {
        const existing = findPartyByLabel(partyName);
        finalPartyId = existing
          ? existing.partyId ?? existing.id
          : (await createParty(partyName)).partyId;
      }

      if (!finalAgentId && agentName.trim()) {
        const existing = findAgentByLabel(agentName);
        finalAgentId = existing
          ? existing.agentId ?? existing.id
          : (await createAgent(agentName)).agentId;
      }

      if (!finalPartyId) throw new Error("Party creation failed");
      if (!finalAgentId) throw new Error("Agent creation failed");

      const payload = {
        orderDate,
        partyId: finalPartyId,
        agentId: finalAgentId,
        totalCases: Number(totalCases),
        pendingCases:Number(pendingCases),
        orderNumber,
      };

      const id = SaleOrder.id ;
      const res = await fetch(`/api/sales-orders?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update sale order");
      const data = await res.json();

      toast.success("Sale order updated");
      mutate("/api/sales-orders");
      setOpen(false);
      resetForm();

      onUpdated?.(data.saleOrder ?? data);
    } catch (err) {
      console.error("update order error:", err);
      toast.error(err.message || "Error updating sale order");
      setSubmitting(false);
    }
  };

  const selectParty = (p) => {
    const label = p.partyName ?? p.name ?? "";
    const id = p.partyId ?? p.id ?? "";
    setPartyQuery(label);
    setPartyName(label);
    setPartyId(id);
    setPartyOpen(false);
  };

  const selectAgent = (a) => {
    const label = a.agentName ?? a.name ?? "";
    const id = a.agentId ?? a.id ?? "";
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
    <>
    <Toaster position="top-right"/>
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

        {loading?<div><p>"Loading"</p></div>:(
          <form onSubmit={handleUpdateOrder} className="space-y-4 mt-2">
          {/* Order Number */}
          <div>
            <Label htmlFor="order-number">Order Number</Label>
            <Input
              id="order-number"
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Add Order Number"
              className="mt-1"
            />
          </div>

          {/* Party */}
          <div ref={partyRef} className="bg-gray-300 rounded-3xl w-full p-3">
            <Label>Party</Label>
            <div className="mt-1">
              <Command>
                <CommandInput
                  placeholder="Search or create party"
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
                    {filteredParties.map((p) => (
                      <CommandItem
                        key={String(p.partyId ?? p.id)}
                        onSelect={() => selectParty(p)}
                      >
                        <div className="flex justify-between w-full">
                          <span>{p.partyName ?? p.name}</span>
                          {partyId === (p.partyId ?? p.id) && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                    {partyQuery.trim().length > 0 &&
                      !findPartyByLabel(partyQuery) && (
                        <CommandItem onSelect={() => chooseCreateParty(partyQuery)}>
                          <span>Create new party “{partyQuery}”</span>
                        </CommandItem>
                      )}
                  </CommandList>
                )}
              </Command>
            </div>
            {partyName && (
              <div className="mt-2 inline-flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full text-sm">
                <span>{partyName}</span>
                <button type="button" onClick={clearParty} aria-label="Clear party">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Agent */}
          <div ref={agentRef} className="bg-gray-300 rounded-3xl w-full p-3">
            <Label>Agent</Label>
            <div className="mt-3">
              <Command>
                <CommandInput
                  placeholder="Search or create agent"
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
                    {filteredAgents.map((a) => (
                      <CommandItem
                        key={String(a.agentId ?? a.id)}
                        onSelect={() => selectAgent(a)}
                      >
                        <div className="flex justify-between w-full">
                          <span>{a.agentName ?? a.name}</span>
                          {agentId === (a.agentId ?? a.id) && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                    {agentQuery.trim().length > 0 &&
                      !findAgentByLabel(agentQuery) && (
                        <CommandItem onSelect={() => chooseCreateAgent(agentQuery)}>
                          <span>Create new agent “{agentQuery}”</span>
                        </CommandItem>
                      )}
                  </CommandList>
                )}
              </Command>
            </div>
            {agentName && (
              <div className="mt-2 inline-flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full text-sm">
                <span>{agentName}</span>
                <button type="button" onClick={clearAgent} aria-label="Clear agent">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
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

          <div>
            <Label htmlFor="pending_cases">Pending Cases</Label>
            <Input
              id="pending-cases"
              type="number"
              min={0}
              value={pendingCases}
              onChange={(e) => setPendingCases(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Order date */}
          <div>
            <Label htmlFor="order-date">Order Date</Label>
            <Input
              id="order-date"
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              {submitting ? "Updating..." : "Update Order"}
            </Button>
          </div>
        </form>
        )}

        
      </DialogContent>
      

      
    </Dialog>
    </>
  );
}
