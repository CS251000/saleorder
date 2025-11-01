"use client";
import React, { useEffect, useState, Suspense } from "react";
import EmployeeDashboard from "@/components/dashboards/EmployeeDashboard";
import { useParams } from "next/navigation";
import Navbar2 from "@/components/Navbar2";

// Separate component that uses useSearchParams
function EmployeeDashboardContent() {
  const params = useParams();
  const { employeeId } = params;
  const [currUser, setCurrUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/user?userId=${employeeId}`);
        const data = await res.json();
        // console.log("data", data);
        setCurrUser(data.currentUser); //employee details
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, [employeeId]);

  return (
    <div>
      <Navbar2 />
      <EmployeeDashboard currUser={currUser} />
    </div>
  );
}

// Main component with Suspense wrapper
export default function EmployeeDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div>Loading...</div>
        </div>
      }
    >
      <EmployeeDashboardContent />
    </Suspense>
  );
}
