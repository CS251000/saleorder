"use client";
import { AddJobOrderForm } from '@/components/addJobOrder';
import FabricatorJobSlipCard from '@/components/cards/FabricatorJobSlip';
import { FilterJobOrder } from '@/components/filterJobOrder';
import Navbar2 from '@/components/Navbar2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'

const fabricators = [
  { id: 1, name: "Fabricator 1", total: 100, dispatched: 80, pending: 20 },
  { id: 2, name: "Fabricator 2", total: 200, dispatched: 150, pending: 50 },
  { id: 3, name: "Fabricator 3", total: 300, dispatched: 250, pending: 50 },
  { id: 4, name: "Fabricator 4", total: 400, dispatched: 350, pending: 50 },
];

const items = [
  {
    id: 1,
    designNumber: "D001",
    orderDate: "2023-10-01",
    deliveryDate: "2023-10-05",
    status: "Pending",
    fabricatorId: 1,
    isSampleGiven: true,
    materialDetails: {
      clothName: "Cotton Poplin",
      totalMeter: 45,
      price: 3200,
    },
    shirtDetails: {
      designName: "Classic White Shirt",
      average: 1.2, // meters per shirt
      fabrication: 150,
      expense: 80,
      costing: 350,
    },
  },
  {
    id: 2,
    designNumber: "D002",
    orderDate: "2023-10-02",
    deliveryDate: "2023-10-06",
    status: "Completed",
    fabricatorId: 2,
    isSampleGiven: false,
    materialDetails: {
      clothName: "Linen Blend",
      totalMeter: 60,
      price: 4800,
    },
    shirtDetails: {
      designName: "Casual Linen Shirt",
      average: 1.4,
      fabrication: 200,
      expense: 90,
      costing: 400,
    },
  },
  {
    id: 3,
    designNumber: "D003",
    orderDate: "2023-10-03",
    deliveryDate: "2023-10-07",
    status: "Bestseller",
    fabricatorId: 3,
    isSampleGiven: true,
    materialDetails: {
      clothName: "Egyptian Cotton",
      totalMeter: 100,
      price: 9500,
    },
    shirtDetails: {
      designName: "Premium Formal Shirt",
      average: 1.1,
      fabrication: 220,
      expense: 120,
      costing: 480,
    },
  },
  {
    id: 4,
    designNumber: "D004",
    orderDate: "2023-10-04",
    deliveryDate: "2023-10-08",
    status: "Reordered",
    fabricatorId: 1,
    isSampleGiven: false,
    materialDetails: {
      clothName: "Oxford Cotton",
      totalMeter: 80,
      price: 6200,
    },
    shirtDetails: {
      designName: "Oxford Blue Shirt",
      average: 1.3,
      fabrication: 180,
      expense: 100,
      costing: 420,
    },
  },
];


export default function FabricatorDashboardPage() {
  const params= useParams();
  const {fabricatorId}=params;
  const {managerId}=params;
  const [searchTerm, setSearchTerm] =useState("");
  const [showType,setShowType]=useState("all");
  return (
    <div>
      {/* <Navbar2/> */}
      <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-bold text-3xl break-words">{fabricators.find((f)=>f.id==fabricatorId).name}</h2>
        <div className="relative w-full sm:w-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-500 left-3"
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
            placeholder="Search job slips..."
            className="pl-12 pr-4 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-row gap-3 flex-wrap justify-center sm:justify-end">
          <AddJobOrderForm fabricatorId={fabricatorId} managerId={managerId}/>
          <FilterJobOrder/>
        </div>

        
      </div>
      <Card className="shadow-md p-4 w-full">
        <CardHeader className="p-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold">
              Job Slips
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className={'flex flex-row gap-4'}>
          <div className="w-full flex justify-center sm:justify-start">
          <Tabs
            defaultValue="all"
            className="w-full sm:w-auto rounded-md p-1"
          >
            <TabsList className="flex flex-row justify-around w-full sm:w-auto">
              <TabsTrigger value="all"
                onClick={()=>setShowType("all")}
              >
                All
              </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  onClick={()=>setShowType("pending")}
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  onClick={()=>setShowType("completed")}
                >
                  Completed
                </TabsTrigger>
                <TabsTrigger
                  value="reordered"
                  onClick={()=>setShowType("reordered")}
                >
                  Reordered
                </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        </CardContent>
      </Card>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-4'>
        {items.filter((item)=>{
          if(showType==="all"){
            return item;
          }
          if(showType==="pending"){
            return item.status==="Pending";
          }
          if(showType==="completed"){
            return item.status==="Completed";
          }
          if(showType==="reordered"){
            return item.status==="Reordered";
          }
        }).map((item)=>(
          <FabricatorJobSlipCard key={item.id} jobSlip={item} />
        ))}
      </div>

    </div>
    </div>
  )
}
