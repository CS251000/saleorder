"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { UserPlus, Users, UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast, { Toaster } from "react-hot-toast";
import ManagerDashboardEmployees from "./ManagerDashboardEmployees";
import AddSaleOrderForm from "../addSaleOrder";

export default function ManagerDashboard({ currUser }) {
  const [employeeId, setEmployeeId] = useState("");
  const [partyName, setPartyName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [loading, setLoading] = useState(false);

  const userAddedNotify = (msg) => toast.success(msg);

const handleSave = async (type) => {
  // VALIDATE BEFORE setLoading
  if (type === "employee") {
    if (!employeeId.trim()) {
      toast.error("Employee ID is required");
      return;
    }
    if (!currUser?.id) {
      toast.error("Manager ID missing (not signed in)");
      return;
    }
  } else if (type === "party") {
    if (!partyName.trim()) {
      toast.error("Party name is required");
      return;
    }
    if (!currUser?.id) {
      toast.error("Manager ID missing (not signed in)");
      return;
    }
  } else if (type === "agent") {
    if (!agentName.trim()) {
      toast.error("Agent name is required");
      return;
    }
    if (!currUser?.id) {
      toast.error("Manager ID missing (not signed in)");
      return;
    }
  }

  setLoading(true);
  try {
    let url = "";
    let body = {};

    if (type === "employee") {
      url = "/api/employees";
      body = { employeeId: employeeId.trim(), managerId: currUser.id };
    } else if (type === "party") {
      url = "/api/parties";
      body = { partyName: partyName.trim(), managerId: currUser.id };
    } else if (type === "agent") {
      url = "/api/agents";
      body = { agentName: agentName.trim(), managerId: currUser.id };
    }

    console.log("Sending to", url, body); // helpful while debugging

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // show message returned by server if available
      throw new Error(data?.error || `Failed to add ${type}`);
    }

    userAddedNotify(`${type} added successfully!`);

    // reset appropriate fields
    if (type === "employee") setEmployeeId("");
    if (type === "party") setPartyName("");
    if (type === "agent") setAgentName("");
  } catch (err) {
    console.error("handleSave error:", err);
    toast.error(err.message || "Failed to add item");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="relative w-full px-4 sm:px-6">
      <Toaster position="top-right" />
      <div className="flex items-center w-full py-3 mb-10">
        {/* Left-side Buttons */}
        <div className="flex space-x-2">
          {/* Add Party */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center space-x-2 px-3 py-2 text-sm">
                <Users />
                <span className="hidden sm:inline">Add Party</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new Party</DialogTitle>
                <DialogDescription>Enter the Party Name below.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave("party");
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder="Party Name"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPartyName("")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Add Agent */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center space-x-2 px-3 py-2 text-sm">
                <UserCog />
                <span className="hidden sm:inline">Add Agent</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new Agent</DialogTitle>
                <DialogDescription>Enter the Agent name below.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave("agent");
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder="Agent Name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAgentName("")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Centered Title */}
        <h1
          className="absolute left-1/2 transform -translate-x-1/2 
                 text-lg sm:text-2xl md:text-3xl font-bold text-center
                 truncate max-w-[calc(100%-8rem)]"
        >
          Manager
        </h1>

        {/* Right-side Add Employee + Add Sale Order */}
        <div className="ml-auto flex items-center gap-3">
          {/* Add Employee */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="hidden sm:inline-flex items-center space-x-2 px-4 py-2 text-sm md:text-base">
                <UserPlus />
                <span>Add New Employee</span>
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button
                className="sm:hidden inline-flex items-center justify-center p-2"
                aria-label="Add New Employee"
              >
                <UserPlus />
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new Employee</DialogTitle>
                <DialogDescription>Enter the Employee ID below.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave("employee");
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder="Employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEmployeeId("")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Add Sale Order Button (opens form dialog from AddSaleOrderForm) */}
          <AddSaleOrderForm
            currUser={currUser}
            onCreated={() => {
              // optionally refresh employees list or other state here
              toast.success("Sale order added — refresh where needed.");
            }}
            triggerLabel="Add Sale Order"
            triggerClassName="inline-flex items-center gap-2 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <ManagerDashboardEmployees currUser={currUser} />
    </div>
  );
}
