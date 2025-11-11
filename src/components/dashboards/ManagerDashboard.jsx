"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast, { Toaster } from "react-hot-toast";
import ManagerDashboardEmployees from "./ManagerDashboardEmployees";
import AddSaleOrderForm from "../addSaleOrder";
import ManagerDashboardParties from "./ManagerDashboardParties";
import { planLimits } from "@/lib/constants";
import { useGlobalUser } from "@/context/UserContext";

export default function ManagerDashboard() {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingParties, setLoadingParties] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [partyView, setPartyView] = useState(false);
  const [parties, setParties] = useState([]);
  const {currentUser}= useGlobalUser();
  const currUser= currentUser;

  // Add employee form state
  const [employeeId, setEmployeeId] = useState("");
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [empDialogOpen, setEmpDialogOpen] = useState(false);

  const managerId = currUser?.id;
  const planName = currUser?.plan_name;

  const fetchEmployees = useCallback(async () => {
    if (!managerId) {
      setEmployees([]);
      return;
    }
    setLoadingEmployees(true);
    setFetchError(null);
    try {
      const res = await fetch(
        `/api/employees?managerId=${encodeURIComponent(managerId)}`,
        {
          next: { tags: ["employees"], revalidate: 150 },
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err?.error || `Failed to fetch employees (${res.status})`
        );
      }
      const data = await res.json();

      const list = Array.isArray(data) ? data : data.employees ?? [];
      list.sort(
        (a, b) =>
          (b.employeePendingOrders ?? 0) - (a.employeePendingOrders ?? 0)
      );
      setEmployees(list);
    } catch (err) {
      console.error("fetchEmployees error:", err);
      setFetchError(err.message || "Failed to load employees");
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  }, [managerId]);

  const fetchParties = useCallback(async () => {
    if (!managerId) {
      setParties([]);
      return;
    }
    setLoadingParties(true);
    setFetchError(null);
    try {
      const res = await fetch(
        `/api/parties?managerId=${encodeURIComponent(managerId)}`,
        {
          next: { tags: ["parties"], revalidate: 150 },
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err?.error || `Failed to fetch parties (${res.status})`
        );
      }
      const data = await res.json();
      // API may return array or { parties: [...] } — normalize
      const list = Array.isArray(data) ? data : data.parties ?? [];
      list.sort((a, b) => (b.pendingCases ?? 0) - (a.pendingCases ?? 0));
      setParties(list);
    } catch (err) {
      console.error("fetchParties error:", err);
      setFetchError(err.message || "Failed to load parties");
      setParties([]);
    } finally {
      setLoadingParties(false);
    }
  }, [managerId]);

  // fetch on mount / whenever managerId changes
  useEffect(() => {
    if (managerId) {
      fetchEmployees();
      fetchParties();
    }
  }, [managerId, fetchEmployees, fetchParties]);

  // Save employee and refresh list on success
  const handleSaveEmployee = async () => {
    if (!employeeId.trim()) {
      toast.error("Employee ID is required");
      return;
    }
    if (!managerId) {
      toast.error("Manager ID missing");
      return;
    }
    if (employees.length >= (planLimits[planName]?.employeeLimit)) {
      toast.error(`Employee limit reached for your plan (${planName}).Upgrade to continue`);
      return;
    }

    setSavingEmployee(true);
    try {
      const body = { employeeId: employeeId.trim(), managerId };
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.error || `Failed to add employee (${res.status})`
        );
      }

      toast.success("Employee added successfully!");
      // reset + close dialog
      setEmployeeId("");
      setEmpDialogOpen(false);

      // re-fetch so the new employee appears immediately
      await fetchEmployees();
    } catch (err) {
      console.error("add employee error:", err);
      toast.error(err.message || "Failed to add employee");
    } finally {
      setSavingEmployee(false);
    }
  };

  // Guard UI if parent didn't pass currUser
  if (!currUser) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-600">
          No manager found. Please sign in.
        </p>
      </div>
    );
  }

  const saleOrderUser = {
    id: currUser.id ?? currUser.clerkId,
    username: currUser.username,
    firstName: currUser.firstName,
    lastName: currUser.lastName,
  };

  const managerName =
    currUser.username ??
    `${currUser.firstName ?? ""} ${currUser.lastName ?? ""}`.trim();

  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center gap-3 py-3 mb-6">
        {/* Left: Add Sale Order */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="hidden sm:block">
            <AddSaleOrderForm
              currUser={saleOrderUser}
              managerId={currUser?.id}
              employeeDashboard={false}
              onCreated={() => {
                toast.success("Sale order added — refresh where needed.");
              }}
              triggerLabel="Add Sale Order"
              triggerClassName="inline-flex items-center space-x-2 px-3 py-2 text-sm"
            />
          </div>

          {/* Mobile compact button (icon-only) */}
          <div className="sm:hidden">
            <AddSaleOrderForm
              currUser={saleOrderUser}
              managerId={currUser?.id}
              employeeDashboard={false}
              onCreated={() => {
                toast.success("Sale order added — refresh where needed.");
              }}
              triggerLabel=""
              triggerClassName="inline-flex items-center justify-center p-2"
            />
          </div>
        </div>

        {/* Center Title */}
        <motion.h1
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 text-center text-lg sm:text-2xl md:text-3xl font-bold truncate"
          title={`Manager${managerName ? ` — ${managerName}` : ""}`}
        >
          Manager{managerName ? ` — ${managerName}` : ""}
        </motion.h1>

        {/* Right controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Add Employee Dialog */}
          <Dialog open={empDialogOpen} onOpenChange={setEmpDialogOpen}>
            <DialogTrigger asChild>
              <Button className="hidden md:inline-flex items-center space-x-2 px-4 py-2 text-sm md:text-base">
                <UserPlus />
                <span>Add New Employee</span>
              </Button>
            </DialogTrigger>

            {/* mobile icon trigger */}
            <DialogTrigger asChild>
              <Button
                className="md:hidden inline-flex items-center justify-center p-2"
                aria-label="Add New Employee"
              >
                <UserPlus />
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new Employee</DialogTitle>
                <p className="text-sm text-gray-500">
                  Enter the Employee ID below.
                </p>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveEmployee();
                }}
                className="space-y-4"
              >
                <label className="block text-sm">
                  <span className="sr-only">Employee ID</span>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Employee ID (ex: EMP123)"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-1"
                    aria-label="Employee ID"
                  />
                </label>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEmployeeId("");
                      setEmpDialogOpen(false);
                    }}
                    disabled={savingEmployee}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={savingEmployee}>
                    {savingEmployee ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* tabs + label */}
      <div className="flex w-full max-w-sm flex-col gap-6 mb-4">
        <Tabs defaultValue={partyView ? "parties" : "employees"}>
          <TabsList>
            <TabsTrigger
              className={"cursor-pointer text-md"}
              value="employees"
              onClick={() => setPartyView(false)}
            >
              Employees
            </TabsTrigger>
            <TabsTrigger
              className={"cursor-pointer text-md"}
              value="parties"
              onClick={() => setPartyView(true)}
            >
              Parties
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main content area */}
      <div className="w-full">
        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg p-4">
          {!partyView && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users />
                  <h4 className="text-sm font-semibold">Employees</h4>
                </div>
                <div className="text-xs text-gray-500">
                  {loadingEmployees
                    ? "Loading..."
                    : `${employees.length} employees`}
                </div>
              </div>

              {/**
               * ManagerDashboardEmployees receives same props as before.
               * It is responsible for rendering list and handling its own internal UI.
               */}
              <ManagerDashboardEmployees
                employees={employees}
                loading={loadingEmployees}
                managerName={managerName}
              />
            </div>
          )}

          {partyView && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users />
                  <h4 className="text-sm font-semibold">Parties</h4>
                </div>
                <div className="text-xs text-gray-500">
                  {loadingParties ? "Loading..." : `${parties.length} parties`}
                </div>
              </div>

              <ManagerDashboardParties
                parties={parties}
                loading={loadingParties}
                managerName={managerName}
              />
            </div>
          )}
        </div>

        {fetchError ? (
          <div className="mt-4 text-sm text-red-500">Error: {fetchError}</div>
        ) : null}
      </div>
    </div>
  );
}
