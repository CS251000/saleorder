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

export default function ItemJobSlipCard({ jobSlip }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Card className="hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Job #{jobSlip.id}
          </CardTitle>
          <CardDescription>Fabricator: {jobSlip.fabricator}</CardDescription>
          <div className="text-sm font-medium text-blue-600">
            Status: {jobSlip.status}
          </div>
        </CardHeader>

        <CardContent className="text-sm space-y-1">
          <p>📅 Order Date: {jobSlip.OrderDate}</p>
          <p>🚚 Delivery Date: {jobSlip.deliveryDate}</p>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button
            onClick={() => setOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Info
          </Button>
        </CardFooter>
      </Card>

      {/* Info Dialog */}
      <JobSlipInfoDialog open={open} setOpen={setOpen} jobSlip={jobSlip} />
    </div>
  );
}
