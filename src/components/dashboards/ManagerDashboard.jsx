"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { UserPlus } from "lucide-react";
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

/**
 * ManagerDashboard - expects currUser prop from parent (Home)
 * currUser is the DB user object you store for the logged-in Clerk user.
 */
export default function ManagerDashboard({ currUser }) {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Add employee form state
  const [employeeId, setEmployeeId] = useState("");
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [empDialogOpen, setEmpDialogOpen] = useState(false);

  // Resolve manager id (support either currUser.id or currUser.clerkId if needed)
  const managerId = currUser?.id ?? currUser?.clerkId ?? null;

  const fetchEmployees = useCallback(async () => {
    if (!managerId) {
      setEmployees([]);
      return;
    }
    setLoadingEmployees(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/employees?managerId=${encodeURIComponent(managerId)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Failed to fetch employees (${res.status})`);
      }
      const data = await res.json();
      // API may return array or { employees: [...] } — normalize
      const list = Array.isArray(data) ? data : data.employees ?? [];
      setEmployees(list);
    } catch (err) {
      console.error("fetchEmployees error:", err);
      setFetchError(err.message || "Failed to load employees");
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  }, [managerId]);

  // fetch on mount / whenever managerId changes
  useEffect(() => {
    if (managerId) fetchEmployees();
  }, [managerId, fetchEmployees]);

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
        throw new Error(data?.error || `Failed to add employee (${res.status})`);
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
        <p className="text-center text-gray-600">No manager found. Please sign in.</p>
      </div>
    );
  }

  const saleOrderUser = {
    id: currUser.id ?? currUser.clerkId,
    username: currUser.username,
    firstName: currUser.firstName,
    lastName: currUser.lastName,
  };

  return (
    <div className="relative w-full px-4 sm:px-6">
      <Toaster position="top-right" />

      <div className="flex items-center w-full py-3 mb-10">
        {/* Left-side: Add Sale Order */}
        <div className="flex space-x-2">
          <AddSaleOrderForm
            currUser={saleOrderUser}
            employeeDashboard={false}
            onCreated={() => {
              toast.success("Sale order added — refresh where needed.");
            }}
            triggerLabel="Add Sale Order"
            triggerClassName="inline-flex items-center space-x-2 px-3 py-2 text-sm"
          />
        </div>

        {/* Centered Title */}
        <h1
          className="absolute left-1/2 transform -translate-x-1/2 
                 text-lg sm:text-2xl md:text-3xl font-bold text-center
                 truncate max-w-[calc(100%-8rem)]"
        >
          Manager
        </h1>

        {/* Right-side: Add Employee */}
        <div className="ml-auto flex items-center gap-3">
          <Dialog open={empDialogOpen} onOpenChange={setEmpDialogOpen}>
            <DialogTrigger asChild>
              <Button className="hidden sm:inline-flex items-center space-x-2 px-4 py-2 text-sm md:text-base">
                <UserPlus />
                <span>Add New Employee</span>
              </Button>
            </DialogTrigger>

            {/* mobile trigger */}
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
                <p className="text-sm text-gray-500">Enter the Employee ID below.</p>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveEmployee();
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

      {/* Employees list */}
      <ManagerDashboardEmployees
        employees={employees}
        loading={loadingEmployees}
        managerName={currUser.username ?? `${currUser.firstName ?? ""} ${currUser.lastName ?? ""}`.trim()}
      />

      {fetchError ? (
        <div className="mt-4 text-sm text-red-500">Error: {fetchError}</div>
      ) : null}
    </div>
  );
}
