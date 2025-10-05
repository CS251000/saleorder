"use client";

import React from "react";
import Link from "next/link";


export default function ManagerDashboardParties({
  parties = [],
  loading = false,
  managerName = "",
}){
  return (
    <div>
      <h2 className="text-lg font-bold">Parties under {managerName || "you"}</h2>

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
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-lg text-gray-500 border">
                  Loading parties...
                </td>
              </tr>
            ) : parties.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-lg text-gray-500 border">
                  No parties found.
                </td>
              </tr>
            ) : (
              parties.filter((party)=>party.pendingCases > 0).map((party) => {
                const id = party.partyId;
                const name = party.partyName;
                const pending = party.pendingCases ?? 0;
                const dispatched = party.dispatchedCases ?? 0;
                const total = pending + dispatched;

                return (
                  <tr
                    key={id}
                    className="hover:bg-gray-50 border border-black hover:cursor-pointer"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Link href={`/party-dashboard/${id}`}>
                        <div className="text-lg font-medium text-gray-900">{name}</div>
                      </Link>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <Link href={`/party-dashboard/${id}`}>
                        <div className="text-lg font-semibold">{total}</div>
                      </Link>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <Link href={`/party-dashboard/${id}`}>
                        <div className="text-lg font-semibold">{dispatched}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <Link href={`/party-dashboard/${id}`}>
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
