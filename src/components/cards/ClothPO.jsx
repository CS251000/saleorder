"use client"
import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Edit3, Info, Trash2 } from 'lucide-react';

export default function ClothPO({purchaseOrder}) {
  return (
    <div>
      <Card className="hover:shadow-lg transition-all">
        <CardHeader>
          <div className='flex justify-between'>
            <CardTitle className="text-lg font-semibold">
            P0 #{purchaseOrder.POnumber}
          </CardTitle>
            <div className="text-sm font-medium text-blue-600">
            {purchaseOrder.status}
          </div>
          </div>
          
          <CardDescription>
            <div className='flex flex-col space-y-2'>
            <span>Agent: {purchaseOrder.agent}</span>
            <span>Mill: {purchaseOrder.mill}</span>
            </div>
            </CardDescription>
          
        </CardHeader>

        <CardContent className="text-sm space-y-1">
          <p>📅 Order Date: {purchaseOrder.OrderDate}</p>
          <p>🚚 Due Date: {purchaseOrder.dueDate}</p>
        </CardContent>

        <CardFooter className="flex justify-center items-center gap-3">
          <Button
            variant="destructive"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md shadow-sm transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>

          <Button
            onClick={() => console.log("Edit clicked")}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md shadow-sm transition-all"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </Button>

          <Button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md shadow-sm transition-all"
          >
            <Info
             className="w-4 h-4" />
            Info
          </Button>
        </CardFooter>
      </Card>

      {/* Info Dialog */}
      {/* <JobSlipInfoDialog open={open} setOpen={setOpen} jobSlip={jobSlip} /> */}
    </div>
  );
}
