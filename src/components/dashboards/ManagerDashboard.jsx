"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast, { Toaster } from 'react-hot-toast';
import ManagerDashboardEmployees from "./ManagerDashboardEmployees";

export default function ManagerDashboard({ currUser }) {
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);

  const userAddedNotify=()=> toast.success('Employee added successfully!');

  const handleSave = async () => {
    if (!employeeId.trim()) {
      console.error("Employee ID is required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: employeeId.trim(),
          managerId: currUser?.id, 
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add employee");
      }

      const data = await res.json();
      userAddedNotify();
      setEmployeeId("");
    } catch (error) {
      console.error("Error adding employee:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full px-4 sm:px-6">
      <Toaster position="top-right" />
      <div className="flex items-center w-full py-3 mb-10">
        {/* Centered Title */}
        <h1
          className="absolute left-1/2 transform -translate-x-1/2 
                 text-lg sm:text-2xl md:text-3xl font-bold text-center
                 truncate max-w-[calc(100%-8rem)]"
        >
          Manager Dashboard
        </h1>
        {/* Right-side Add Button */}
        <div className="ml-auto">
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
                <DialogDescription>
                  Enter the Employee ID below.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  name="employeeId"
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
        </div>
      </div>
      <ManagerDashboardEmployees currUser={currUser} />
    </div>
  );
}
