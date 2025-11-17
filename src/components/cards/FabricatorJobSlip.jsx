"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import JobSlipInfoDialog from "../jobSlipInfoDialog";
import { CircleCheckBig, CircleDot, Info } from "lucide-react";
import { format } from "date-fns";

export default function ItemJobSlipCard({ jobSlip,onComplete }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Card
        className={` ${
          jobSlip.isBestSeller ? "border-2 border-amber-200" : ""
        } hover:shadow-lg transition-all`}
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Job #{jobSlip.jobSlipNumber}
          </CardTitle>
          <CardDescription>Design: {jobSlip.designName}</CardDescription>
          <div className="text-sm font-medium text-blue-600">
            Status: {jobSlip.status}
          </div>
        </CardHeader>

        <CardContent className="text-sm space-y-1">
          <p>📅 Order Date: { format(new Date(jobSlip.orderDate), "do MMM yyyy")}</p>

          <p>🚚 Delivery Date: {format(new Date(jobSlip.dueDate), "do MMM yyyy")}</p>
        </CardContent>

        <CardFooter className="flex justify-between items-center gap-3">
          

          <Button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md shadow-sm transition-all"
          >
            <Info className="w-4 h-4" />
            Info
          </Button>
          {jobSlip.status=="Pending"?<Button size={"sm"} 
          onClick={() => onComplete(jobSlip)}
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
      <JobSlipInfoDialog open={open} setOpen={setOpen} jobSlip={jobSlip} />
    </div>
  );
}
