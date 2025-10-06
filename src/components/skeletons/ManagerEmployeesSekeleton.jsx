"use client";

import React from "react";

export default function ManagerDashboardEmployeesSkeleton({ rows = 5 }) {
  const skeletonRows = Array.from({ length: rows });

  return (
    <div>
      {/* Header */}
      <div className="h-8 w-64 bg-gray-300 rounded mb-4 animate-pulse"></div>

      <div className="overflow-x-auto mt-2">
        <table className="min-w-full divide-y divide-gray-100 border-solid border-separate border-spacing-y-2">
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

          <tbody className="bg-white">
            {skeletonRows.map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="h-6 w-32 bg-gray-300 rounded"></div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <div className="h-6 w-12 bg-gray-300 rounded mx-auto"></div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <div className="h-6 w-12 bg-gray-300 rounded mx-auto"></div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <div className="h-6 w-12 bg-gray-300 rounded mx-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
