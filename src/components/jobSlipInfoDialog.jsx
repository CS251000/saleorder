"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";

export default function JobSlipInfoDialog({ open, setOpen, jobSlip }) {
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  if (!jobSlip) return null;

  // ✅ Normalize expenses to array
  const expenses = Array.isArray(jobSlip.expenses)
    ? jobSlip.expenses
    : (() => {
        try {
          return JSON.parse(jobSlip.expenses || "[]");
        } catch {
          return [];
        }
      })();

  const totalExpense = expenses.reduce(
    (sum, exp) => sum + (Number(exp.amount) || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="
          max-w-md md:max-w-2xl
          rounded-2xl
          p-4 md:p-6
          overflow-y-auto
          max-h-[85vh]
          sm:max-h-[80vh]
          bg-white
        "
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg md:text-xl font-semibold text-center text-gray-900">
            Job Slip Details
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 text-sm">
            Detailed view of all job slip information and expenses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-3">
          {/* 🧾 Basic Info */}
          <SectionTitle title="Basic Information" />
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="grid grid-cols-3 sm:grid-cols-3 gap-4 py-3">
              <InfoItem title="Job Slip No." value={jobSlip.jobSlipNumber} />
              <InfoItem title="Design" value={jobSlip.designName} />
              <InfoItem title="Status" value={jobSlip.status} />
              <InfoItem
                title="Order Date"
                value={new Date(jobSlip.orderDate).toLocaleDateString()}
              />
              <InfoItem
                title="Delivery Date"
                value={new Date(jobSlip.dueDate).toLocaleDateString()}
              />
              <InfoItem title="Fabricator" value={jobSlip.fabricatorName} />
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

          {/* 🧵 Material Details */}
          <SectionTitle title="Material Details" />
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="grid grid-cols-3 sm:grid-cols-3  gap-4 py-3">
              <InfoItem title="Cloth Name" value={jobSlip.clothName} />
              <InfoItem
                title="Total Meter"
                value={`${jobSlip.totalMeter} m`}
              />
              <InfoItem title="Price" value={`₹${jobSlip.price}`} />
            </CardContent>
          </Card>

          {/* 👕 Shirt Details */}
          <SectionTitle title="Shirt Details" />
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="grid grid-cols-3 sm:grid-cols-3  gap-4 py-3">
              <InfoItem title="Design Name" value={jobSlip.designName} />
              <InfoItem
                title="Average"
                value={`${jobSlip.average} m/shirt`}
              />
              <InfoItem
                title="Fabrication"
                value={`₹${jobSlip.fabrication}`}
              />

              {/* 💰 Expenses Section */}
              <div className="col-span-3 w-full flex justify-start">
                <Dialog
                  open={expenseDialogOpen}
                  onOpenChange={setExpenseDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 w-full sm:w-auto"
                    >
                      View Expenses —{" "}
                      <span className="font-semibold text-gray-900 ml-1">
                        ₹{totalExpense}
                      </span>
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-md rounded-xl bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-semibold text-center">
                        Job Slip Expenses
                      </DialogTitle>
                      <DialogDescription className="text-center text-gray-500">
                        Detailed breakdown of all recorded expenses.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 py-2 max-h-60 overflow-y-auto">
                      {expenses.length > 0 ? (
                        expenses.map((exp, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center p-2 border rounded-md bg-gray-50 hover:bg-gray-100 transition"
                          >
                            <span className="font-medium text-gray-800">
                              {exp.label}
                            </span>
                            <span className="text-gray-900 font-semibold">
                              ₹{exp.amount}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-sm text-gray-500 py-3">
                          No expenses found.
                        </p>
                      )}
                    </div>

                    <Separator className="my-3" />

                    <DialogFooter className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">
                        Total: ₹{totalExpense}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpenseDialogOpen(false)}
                      >
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <InfoItem title="Costing" value={`₹${jobSlip.costing}`} />
            </CardContent>
          </Card>
        </div>

        <Separator className="my-3" />

        <DialogFooter className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            className="px-6"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------- */
/* 🔹 Reusable Components */
/* --------------------- */

function InfoItem({ title, value }) {
  return (
    <div className="flex flex-col items-start justify-center">
      <Badge
        variant="secondary"
        className="w-fit text-xs font-medium bg-gray-100 text-gray-700"
      >
        {title}
      </Badge>
      <span className="text-sm font-medium text-gray-900 truncate mt-0.5">
        {value}
      </span>
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <h3 className="text-base font-semibold text-gray-800 border-l-4 border-gray-300 pl-2">
      {title}
    </h3>
  );
}
