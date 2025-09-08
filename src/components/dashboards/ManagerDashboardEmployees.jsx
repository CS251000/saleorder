"use client";
import React, { useEffect, useState } from "react";

import Link from "next/link";

export default function ManagerDashboardEmployees({ currUser }) {
  const [employees, setEmployees] = useState([]);
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          `/api/employees?managerId=${currUser?.id}`
        );
        const data = await response.json();
        // console.log(data);
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

          <div className="overflow-x-auto mt-6">
            <table className="min-w-full divide-y divide-gray-100 border-solid border-separate border-spacing-y-2 ">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-center text-md font-medium text-gray-500 uppercase tracking-wider">
                    Pending
                  </th>
                  <th className="px-4 py-3 text-center text-md font-medium text-gray-500 uppercase tracking-wider">
                    Dispatched
                  </th>

                </tr>
              </thead>

              <tbody className="bg-white ">
                {employees.length === 0 ? (
                  <tr className="">
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-lg text-gray-500 border"
                    >
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => {
                    const id = emp.employeeId;
                    const name = emp.employeeName;
                    const pending = emp.employeePendingOrders;
                    const dispatched = emp.employeeDispatchedOrders;

                    return (
                        <tr
                          key={id}
                          className="hover:bg-gray-50 border border-black hover:cursor-pointer"
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Link href={`/employee-dashboard?id=${id}`}>
                              <div className="text-lg font-medium text-gray-900">
                                {name}
                              </div>
                            </Link>
                          </td>

                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <Link href={`/employee-dashboard?id=${id}`}>
                            <div className="text-lg font-semibold">{pending}</div>
                          </Link>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <Link href={`/employee-dashboard?id=${id}`}>
                            <div className="text-lg font-semibold">
                              {dispatched}
                            </div>
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
