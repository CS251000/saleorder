"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";

export default function JobSlipInfoDialog({ open, setOpen, jobSlip }) {
  if (!jobSlip) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="
          max-w-md md:max-w-xl
          rounded-2xl
          p-4 md:p-6
          overflow-y-auto
          max-h-[85vh]
          sm:max-h-[80vh]
        "
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg md:text-xl font-semibold text-center text-gray-900">
            Job Slip Details
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 text-sm">
            Complete information about the selected job slip.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Basic Info */}
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3">
              <InfoItem title="Job Slip No." value={jobSlip.id} />
              <InfoItem title="Design Number" value={jobSlip.designNumber} />
              <InfoItem title="Status" value={jobSlip.status} />
              <InfoItem title="Order Date" value={jobSlip.orderDate} />
              <InfoItem title="Delivery Date" value={jobSlip.deliveryDate} />
              <InfoItem title="Fabricator" value={jobSlip.fabricator} />
              <InfoItem
                title="Sample Given"
                value={
                  jobSlip.isSampleGiven ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Yes
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                      No
                    </Badge>
                  )
                }
              />
            </CardContent>
          </Card>

          {/* Material Details */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              Material Details
            </h3>
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3">
                <InfoItem
                  title="Cloth Name"
                  value={jobSlip.materialDetails.clothName}
                />
                <InfoItem
                  title="Total Meter"
                  value={`${jobSlip.materialDetails.totalMeter} m`}
                />
                <InfoItem
                  title="Price"
                  value={`₹${jobSlip.materialDetails.price}`}
                />
              </CardContent>
            </Card>
          </div>

          {/* Shirt Details */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              Shirt Details
            </h3>
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3">
                <InfoItem
                  title="Design Name"
                  value={jobSlip.shirtDetails.designName}
                />
                <InfoItem
                  title="Average"
                  value={`${jobSlip.shirtDetails.average} m/shirt`}
                />
                <InfoItem
                  title="Fabrication"
                  value={`₹${jobSlip.shirtDetails.fabrication}`}
                />
                <InfoItem
                  title="Expense"
                  value={`₹${jobSlip.shirtDetails.expense}`}
                />
                <InfoItem
                  title="Costing"
                  value={`₹${jobSlip.shirtDetails.costing}`}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-2" />

        <DialogFooter className="flex justify-center pt-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ✅ Reusable Info Item Component
function InfoItem({ title, value }) {
  return (
    <div className="flex flex-col gap-1">
      <Badge
        variant="secondary"
        className="w-fit text-xs font-medium bg-gray-100 text-gray-700"
      >
        {title}
      </Badge>
      <span className="text-sm font-medium text-gray-900 truncate">{value}</span>
    </div>
  );
}
