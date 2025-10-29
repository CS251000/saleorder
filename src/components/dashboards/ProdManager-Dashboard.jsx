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
import { BookPlus, ClipboardPlus, PackageSearch } from "lucide-react";
import ItemWiseDetailsTable from "./ItemWiseTable";
import FabricatorWiseDetailsTable from "./FabricatorWiseTable";

export default function ProdManagerDashboard({managerId}) {
  return (
    <div className="flex flex-col gap-8 px-4 sm:px-6 lg:px-10 py-6 bg-gray-50 min-h-screen">
      {/* ✅ Header Section */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl shadow-md p-6 ">
        <div className="flex flex-col md:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg md:text-2xl text-white font-bold mb-2">Production Manager Dashboard</h1>
          <div className="flex space-x-2">
            <AddJobOrderForm managerId={managerId} />
            <AddPurchaseOrderForm />
          </div>
        </div>
      </div> 


      <div className="flex flex-col lg:flex-row justify-around">
      {/* ✅ Accordion Section */}
      <Card 
      className="shadow-sm border border-gray-200 rounded-2x w-full lg:w-fit"
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <PackageSearch  className="w-5 h-5 text-indigo-600" />
            Production Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-5"></div>
          <Accordion type="multiple" className="w-full space-y-4 " >
            <AccordionItem
              value="itemwise"
              className="border border-gray-200 rounded-xl shadow-sm bg-white"
            >
              <AccordionTrigger className="text-lg font-semibold px-4 py-2 text-gray-800 cursor-pointer hover:text-indigo-700">
                Item-Wise Details
              </AccordionTrigger>
              <AccordionContent className="p-4 text-gray-600 bg-gray-50 rounded-b-xl">
                <ItemWiseDetailsTable managerId={managerId}/>
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
                <FabricatorWiseDetailsTable managerId={managerId}/>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* accordion 2 */}
      <Card className="shadow-sm border border-gray-200 rounded-2xl w-full lg:w-fit">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <PackageSearch  className="w-5 h-5 text-indigo-600" />
            Order Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-5"></div>
          <Accordion type="multiple" className="w-full space-y-4 " >
            <AccordionItem
              value="clothwise"
              className="border border-gray-200 rounded-xl shadow-sm bg-white"
            >
              <AccordionTrigger className="text-lg font-semibold px-4 py-2 text-gray-800 cursor-pointer hover:text-indigo-700">
                Cloth-Wise Details
              </AccordionTrigger>
              <AccordionContent className="p-4 text-gray-600 bg-gray-50 rounded-b-xl">
                <ItemWiseDetailsTable managerId={managerId}/>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="agentwise"
              className="border border-gray-200 rounded-xl shadow-sm bg-white"
            >
              <AccordionTrigger className="text-lg font-semibold px-4 py-2 text-gray-800 cursor-pointer hover:text-indigo-700">
                Agent-Wise Details
              </AccordionTrigger>
              <AccordionContent className="p-4 text-gray-600 bg-gray-50 rounded-b-xl">
                <FabricatorWiseDetailsTable managerId={managerId}/>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      </div>

      {/* ✅ Actions Section */}
      {/* <div className="flex flex-col lg:flex-row gap-6">
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
      </div> */}
    </div>
  );
}
