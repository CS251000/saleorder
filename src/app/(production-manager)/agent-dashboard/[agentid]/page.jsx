"use client";
import { AddPurchaseOrderForm } from '@/components/addPurchaseOrder';
import AgentPO from '@/components/cards/AgentPo';
import Navbar2 from '@/components/Navbar2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'

const agents = [
  { id: 1, name: "Agent A" },
  { id: 2, name: "Agent B" },
  { id: 3, name: "Agent C" },
];

const purchaseOrders = [
  {
    POnumber: "PO-001",
    id: 1,
    orderDate: "2024-01-15",
    agentId: 1,
    mill: "Mill X",
    clothName: "Cloth A",
    purchaseRate: "50",
    designName: "Design X",
    fabricator: "Fabricator 1",
    quantity: "100",
    dueDate: "2024-02-15",
    status:"Pending"
  },
  {
    POnumber: "PO-002",
    id: 2,
    orderDate: "2024-01-16",
    agentId: 2,
    mill: "Mill Y",
    clothName: "Cloth B",
    purchaseRate: "60",
    quantity: "200",
    dueDate: "2024-02-16",
    status:"Completed"
  },
  {
    POnumber: "PO-003",
    id: 3,
    orderDate: "2024-01-17",
    agentId: 3,
    mill: "Mill Z",
    clothName: "Cloth A",
    designName: "Design Y",
    fabricator: "Fabricator 2",
    purchaseRate: "70",
    quantity: "300",
    dueDate: "2024-02-17",
    status:"Completed"
  },
];

export default function ClothDashboardPage() {
  const params= useParams();
  const {agentid}=params;
  const [searchTerm, setSearchTerm] =useState("");
  const [showType,setShowType]=useState("all");
  return (
    <div>
      {/* <Navbar2/> */}
      <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-bold text-3xl break-words">{agents.find((a)=>a.id==agentid).name}</h2>
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
            placeholder="Search POs..."
            className="pl-12 pr-4 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-row gap-3 flex-wrap justify-center sm:justify-end">
          <AddPurchaseOrderForm agentId={agentid}/>
        </div>

        
      </div>
      <Card className="shadow-md p-4 w-full">
        <CardHeader className="p-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold">
              Purchase Orders
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
            </TabsList>
          </Tabs>
        </div>

        </CardContent>
      </Card>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-4'>
        {purchaseOrders.filter((po)=>{
          if(showType==="all"){
            return po;
          }
          if(showType==="pending"){
            return po.status==="Pending";
          }
          if(showType==="completed"){
            return po.status==="Completed";
          }
        }).map((po)=>(
          <AgentPO key={po.id} purchaseOrder={po} />
        ))}
      </div>

    </div>
    </div>
  )
}
