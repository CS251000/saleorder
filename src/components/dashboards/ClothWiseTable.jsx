"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Input } from "../ui/input";

const cloths = [
  { id: 1, name: "Cloth 1", total: 100, dispatched: 80, pending: 20 },
  { id: 2, name: "Cloth 2", total: 200, dispatched: 150, pending: 50 },
  { id: 3, name: "Cloth 3", total: 300, dispatched: 250, pending: 50 },
  { id: 4, name: "Cloth 4", total: 400, dispatched: 350, pending: 50 },
];

export default function ClothWiseDetailsTable() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClothes = cloths.filter((cloth) =>
    cloth.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col p-4 bg-white rounded-xl shadow-sm">
      {/* Search bar */}
      <div className="relative w-full sm:w-80 mx-auto mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-1/2 left-3 w-5 h-5 -translate-y-1/2 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <Input
          type="text"
          placeholder="Search items..."
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                Cloth Name
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
            {filteredClothes.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-lg text-gray-500 border"
                >
                  No items found.
                </td>
              </tr>
            ) : (
              filteredClothes.map((cloth) => (
                <tr
                  key={cloth.id}
                  className="hover:bg-gray-50 border-t border-gray-200 cursor-pointer"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Link
                      href={`/cloth-dashboard/${cloth.id}`}
                    >
                      <div className="text-lg font-medium text-gray-900">
                        {cloth.name}
                      </div>
                    </Link>
                  </td>

                  <td className="px-4 py-4 text-center font-semibold">
                    {cloth.total}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold">
                    {cloth.dispatched}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold">
                    {cloth.pending}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
