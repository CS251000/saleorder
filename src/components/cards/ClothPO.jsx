"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CircleCheckBig, CircleDot, Edit3, Info, Trash2 } from 'lucide-react';
import PurchaseOrderInfoDialog from '../purchaseOrderInfoDialog';
import { format } from 'date-fns';

export default function ClothPO({purchaseOrder,onComplete}) {
  const [open,setOpen]= useState(false);
  return (
    <div>
      <Card className="hover:shadow-lg transition-all">
        <CardHeader>
          <div className='flex justify-between'>
            <CardTitle className="text-lg font-semibold">
            P0 #{purchaseOrder.poNumber}
          </CardTitle>
            <div className="text-sm font-medium text-blue-600">
            {purchaseOrder.status}
          </div>
          </div>
          
          <CardDescription>
            <div className='flex flex-col space-y-2'>
            <span>Agent: {purchaseOrder.agentName}</span>
            <span>Category: {purchaseOrder.categoryName}</span>
            </div>
            </CardDescription>
          
        </CardHeader>

        <CardContent className="text-sm space-y-1">
          <p>📅 Order Date:  {format(new Date(purchaseOrder.orderDate), "do MMM yyyy")}</p>
          <p>🚚 Due Date: {format(new Date(purchaseOrder.dueDate), "do MMM yyyy")}</p>
        </CardContent>

        <CardFooter className="flex justify-center items-center gap-3">

          <Button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md shadow-sm transition-all"
          >
            <Info
             className="w-4 h-4" />
            Info
          </Button>

          {purchaseOrder.status=="Pending"?<Button size={"sm"} 
          onClick={() => onComplete(purchaseOrder)}
          >
            <CircleDot className="w-4 h-4" />
            Complete
          </Button>:
          <Button className={"bg-green-500 hover:bg-green-600"} size={"sm"}>
            <CircleCheckBig className="w-4 h-4" />
            Completed
          </Button>
          }
        </CardFooter>
      </Card>

      {/* Info Dialog */}
      <PurchaseOrderInfoDialog open={open} setOpen={setOpen} po={purchaseOrder} />
    </div>
  );
}
