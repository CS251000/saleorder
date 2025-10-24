"use client";
import Navbar2 from "@/components/Navbar2";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

const fabricators=[
  {id:1,name:"Fabricator 1",total:100,dispatched:80,pending:20},
  {id:2,name:"Fabricator 2",total:200,dispatched:150,pending:50},
  {id:3,name:"Fabricator 3",total:300,dispatched:250,pending:50},
  {id:4,name:"Fabricator 4",total:400,dispatched:350,pending:50},
]

export default function FabricatorWiseDetails() {
  const params = useParams();
  const { managerId } = params;
  
  return (
    <div>
      <Navbar2 />
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full divide-y divide-gray-100 border-solid border-separate border-spacing-y-2 ">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider">
                Fabricator Name
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
            {fabricators.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-center text-lg text-gray-500 border"
                >
                  No Fabricators found.
                </td>
              </tr>
            ) : (
              fabricators.map((fab) => {
                return (
                  <tr
                    key={fab.id}
                    className="hover:bg-gray-50 border border-black hover:cursor-pointer"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Link href={`/fabricator-dashboard/${fab.id}?managerId=${managerId}`}>
                        <div className="text-lg font-medium text-gray-900">
                          {fab.name}
                        </div>
                      </Link>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <Link href={`/fabricator-dashboard/${fab.id}?managerId=${managerId}`}>
                        <div className="text-lg font-semibold">{fab.total}</div>
                      </Link>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <Link href={`/fabricator-dashboard/${fab.id}?managerId=${managerId}`}>
                        <div className="text-lg font-semibold">
                          {fab.dispatched}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <Link href={`/fabricator-dashboard/${fab.id}?managerId=${managerId}`}>
                        <div className="text-lg font-semibold">{fab.pending}</div>
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
