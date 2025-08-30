"use client";
import React, { useEffect, useState } from "react";
import ManagerDashboardEmployeeCard from "../cards/ManagerDashboardEmployeeCard";

export default function ManagerDashboardEmployees({ currUser }) {
  const [employees, setEmployees] = useState([]);
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          `/api/employees?managerId=${currUser?.id}`
        );
        const data = await response.json();

        // Ensure employees is always an array
        setEmployees(Array.isArray(data) ? data : data.employees || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setEmployees([]);
      }
    };
    if (currUser?.id) fetchEmployees();
  }, [currUser?.id]);

  return (
    <div>
      <h2 className="text-lg font-bold">
        Employees under {currUser?.username}
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4">
        {employees.length === 0 ? (
          <p className="text-gray-500">No employees found</p>
        ) : (
          employees.map((employee) => (
            <ManagerDashboardEmployeeCard
              key={employee.employeeId}
              employee={employee}
            />
          ))
        )}
      </div>
    </div>
  );
}
