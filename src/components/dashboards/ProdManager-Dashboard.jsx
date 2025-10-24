"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { AddJobOrderForm } from "../addJobOrder";
import { AddPurchaseOrderForm } from "../addPurchaseOrder";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { BookPlus, ClipboardList, ClipboardPlus, Factory, PackageSearch } from "lucide-react";
import Link from "next/link";

export default function ProdManagerDashboard({managerId}) {
  return (
    <div className="flex flex-col gap-8 px-4 sm:px-6 lg:px-10 py-6 bg-gray-50 min-h-screen">
      {/* ✅ Header Section */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white rounded-2xl shadow-md p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Production Manager Dashboard</h1>
          <p className="text-sm sm:text-base text-indigo-100">
            Manage your production pipeline, job orders, and purchase activities efficiently.
          </p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow">
            <ClipboardList className="w-4 h-4 mr-2" /> View Reports
          </Button>
          <Button className="bg-indigo-700 hover:bg-indigo-800 text-white shadow">
            <Factory className="w-4 h-4 mr-2" /> Manage Units
          </Button>
        </div>
      </div>

      {/* ✅ Accordion Section */}
      <Card className="shadow-sm border border-gray-200 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <PackageSearch  className="w-5 h-5 text-indigo-600" />
            Production Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full space-y-4 " >
            <AccordionItem
              value="itemwise"
              className="border border-gray-200 rounded-xl shadow-sm bg-white"
            >
              <AccordionTrigger className="text-lg font-semibold px-4 py-2 text-gray-800 cursor-pointer hover:text-indigo-700">
                Item-Wise Details
              </AccordionTrigger>
              <AccordionContent className="p-4 text-gray-600 bg-gray-50 rounded-b-xl">
                <p>📦 Display production statistics, pending jobs, and delivery statuses per item.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="fabricatorwise"
              className="border border-gray-200 rounded-xl shadow-sm bg-white"
            >
              <AccordionTrigger className="text-lg font-semibold px-4 py-2 text-gray-800 cursor-pointer hover:text-indigo-700">
                Fabricator-Wise Details
              </AccordionTrigger>
              <AccordionContent className="p-4 text-gray-600 bg-gray-50 rounded-b-xl">
                <Link href={`/fabricator-wise-details/${managerId}`}>
                View Fabricator wise details
                </Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* ✅ Actions Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1 shadow-sm border border-gray-200 rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ClipboardPlus className="w-5 h-5 text-indigo-600" />
              Add Job Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Create a new job order to assign production tasks and track progress.
            </p>
            <AddJobOrderForm managerId={managerId} />
          </CardContent>
        </Card>

        <Card className="flex-1 shadow-sm border border-gray-200 rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BookPlus className="w-5 h-5 text-indigo-600" />
              Add Purchase Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Record a new purchase order for materials or external fabrications.
            </p>
            <AddPurchaseOrderForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
