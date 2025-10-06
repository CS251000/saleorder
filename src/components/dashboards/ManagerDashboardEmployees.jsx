"use client";

import React from "react";
import Link from "next/link";
import ManagerDashboardEmployeesSkeleton from "../skeletons/ManagerEmployeesSekeleton";


export default function ManagerDashboardEmployees({
  employees = [],
  loading = false,
  managerName = "",
}) {
  if(loading){
    return <ManagerDashboardEmployeesSkeleton />
  }
  return (
    <div>
      <h2 className="text-lg font-bold">Employees under {managerName || "you"}</h2>

      <div className="overflow-x-auto mt-6">
        <table className="min-w-full divide-y divide-gray-100 border-solid border-separate border-spacing-y-2 ">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-center text-md font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-center text-md font-medium text-gray-500 uppercase tracking-wider">
                Dispatched
              </th>
              <th className="px-4 py-3 text-center text-md font-medium text-gray-500 uppercase tracking-wider">
                Pending
              </th>
            </tr>
          </thead>

          <tbody className="bg-white ">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-lg text-gray-500 border">
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const id = emp.employeeId ?? emp.id ?? emp.clerkId;
                const name =
                  emp.employeeName ??
                  emp.username ??
                  (emp.firstName || emp.lastName
                    ? `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim()
                    : id);
                const pending = emp.employeePendingOrders ?? 0;
                const dispatched = emp.employeeDispatchedOrders ?? 0;
                const total = pending + dispatched;

                return (
                  <tr
                    key={id}
                    className="hover:bg-gray-50 border border-black hover:cursor-pointer"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Link href={`/employee-dashboard/${id}`}>
                        <div className="text-lg font-medium text-gray-900">{name}</div>
                      </Link>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <Link href={`/employee-dashboard/${id}`}>
                        <div className="text-lg font-semibold">{total}</div>
                      </Link>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <Link href={`/employee-dashboard/${id}`}>
                        <div className="text-lg font-semibold">{dispatched}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <Link href={`/employee-dashboard/${id}`}>
                        <div className="text-lg font-semibold">{pending}</div>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
