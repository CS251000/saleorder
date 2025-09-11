"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { CirclePlus, X, Check } from "lucide-react";
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

/* shadcn Command components (combobox-like) */
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";

/**
 * AddSaleOrderForm (dropdowns open only on click/focus)
 */
export default function AddSaleOrderForm({
  currUser,
  onCreated,
  employeeDashboard,
  triggerLabel = "Add Sale Order",
  triggerClassName = "flex items-center gap-2",
}) {
  const [open, setOpen] = useState(false);

  // data
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

  // open flags for dropdowns (only render list when true)
  const [partyOpen, setPartyOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);

  // refs for outside-click detection
  const partyRef = useRef(null);
  const agentRef = useRef(null);

  // order form
  const [employeeId, setEmployeeId] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [totalCases, setTotalCases] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const todayString = () => new Date().toISOString().slice(0, 10);

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

        setParties(
          pData?.parties ?? (Array.isArray(pData) ? pData : pData ?? [])
        );
        setAgents(
          aData?.agents ?? (Array.isArray(aData) ? aData : aData ?? [])
        );
        setEmployees(
          eData?.employees ?? (Array.isArray(eData) ? eData : eData ?? [])
        );

        // default date to today on open
        setOrderDate((d) => d || todayString());
        if (employeeDashboard && currUser?.id) {
          setEmployeeId(currUser.id);
        }
        console.log("dashboard", employeeDashboard, currUser?.id);
      } catch (err) {
        console.error("fetch error:", err);
        toast.error("Could not load parties/agents/employees");
      }
    }

    fetchAll();
    return () => {
      mounted = false;
    };
  }, [open, currUser?.id, employeeDashboard]);

  // close dropdowns when clicking outside
  useEffect(() => {
    function onDocMouseDown(e) {
      if (partyRef.current && !partyRef.current.contains(e.target)) {
        setPartyOpen(false);
      }
      if (agentRef.current && !agentRef.current.contains(e.target)) {
        setAgentOpen(false);
      }
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

  // helper finders (case-insensitive)
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

  // filtered lists for UI
  const filteredParties = useMemo(() => {
    const q = partyQuery.trim().toLowerCase();
    if (!q) return parties;
    return parties.filter((p) =>
      String(p.partyName ?? p.name ?? "")
        .toLowerCase()
        .includes(q)
    );
  }, [parties, partyQuery]);

  const filteredAgents = useMemo(() => {
    const q = agentQuery.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter((a) =>
      String(a.agentName ?? a.name ?? "")
        .toLowerCase()
        .includes(q)
    );
  }, [agents, agentQuery]);

  // create helpers
  const createParty = async (name) => {
    const payload = {
      partyName: name,
      managerId: currUser?.id ?? currUser?.clerkId ?? null,
    };
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
    const payload = {
      agentName: name,
      managerId: currUser?.id ?? currUser?.clerkId ?? null,
    };
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

  const handleCreateOrder = async (e) => {
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
          finalPartyId =
            created.partyId ?? created.id ?? created.party_id ?? null;
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
          finalAgentId =
            created.agentId ?? created.id ?? created.agent_id ?? null;
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
        orderStatus: "Pending",
      };

      const res = await fetch("/api/sales-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Failed to create order");
      }

      await res.json();
      toast.success("Sale order created");

      setOpen(false);
      resetForm();

      if (typeof onCreated === "function") {
        try {
          await onCreated();
        } catch (err) {
          console.error("onCreated error:", err);
        }
      }
    } catch (err) {
      console.error("create order error:", err);
      toast.error(err.message || "Error creating sale order");
      setSubmitting(false);
    }
  };

  // selecting an existing party/agent from the list
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

  // choose to create new (keeps typed label, id empty)
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

  // clear pills
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
          {/* PARTY combobox (opens only when clicked/focused) */}
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
                    // user edited input -> clear selected id
                    if (partyId) setPartyId("");
                  }}
                  onFocus={() => setPartyOpen(true)}
                />
                {/* render list only when partyOpen is true */}
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
                            {partyId &&
                            partyId === (p.partyId ?? p.id ?? "") ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : null}
                          </div>
                        </CommandItem>
                      );
                    })}

                    {partyQuery.trim().length > 0 &&
                      !findPartyByLabel(partyQuery) && (
                        <CommandItem
                          onSelect={() => chooseCreateParty(partyQuery)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>Create new party “{partyQuery}”</span>
                          </div>
                        </CommandItem>
                      )}
                  </CommandList>
                )}
              </Command>
            </div>

            {/* selected pill */}
            {partyName ? (
              <div className="mt-2 inline-flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full text-sm">
                <span>{partyName}</span>
                <button
                  type="button"
                  onClick={clearParty}
                  className="inline-flex items-center"
                  aria-label="Clear party"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Pick a party .</p>
            )}
          </div>

          {/* AGENT combobox (opens only when clicked/focused) */}
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
                            {agentId &&
                            agentId === (a.agentId ?? a.id ?? "") ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : null}
                          </div>
                        </CommandItem>
                      );
                    })}

                    {agentQuery.trim().length > 0 &&
                      !findAgentByLabel(agentQuery) && (
                        <CommandItem
                          onSelect={() => chooseCreateAgent(agentQuery)}
                        >
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
                <button
                  type="button"
                  onClick={clearAgent}
                  className="inline-flex items-center"
                  aria-label="Clear agent"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Pick an agent (click the field).
              </p>
            )}
          </div>

          {/* EMPLOYEE select */}
          {/* EMPLOYEE select */}
          <div>
            <Label htmlFor="employee-select">Employee</Label>

            <Select
              onValueChange={(val) => setEmployeeId(val)}
              value={employeeId}
              disabled={employeeDashboard} 
            >
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

          {/* Order date (defaults to today on open) */}
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
              {submitting ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
