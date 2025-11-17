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
import { Edit3, Info, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { EditPurchaseOrderForm } from "./editPurchaseOrder";

export default function PurchaseOrderInfoDialog({ open, setOpen, po }) {
  if (!po) return null;

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
            Purchase Order Details
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 text-sm">
            Complete information about the selected purchase order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-3">
          {/* 🧾 Basic Info */}
          <SectionTitle title="Basic Information" />
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
              <InfoItem title="PO Number" value={po.poNumber} />
              <InfoItem title="Status" value={po.status} />
              <InfoItem
                title="Order Date"
                value={format(new Date(po.orderDate), "do MMM yyyy")}
              />
              <InfoItem
                title="Due Date"
                value={
                  po.dueDate
                    ? format(new Date(po.dueDate), "do MMM yyyy")
                    : "-"
                }
              />
              <InfoItem title="Quantity" value={`${po.quantity || 0} m`} />
              <InfoItem
                title="Purchase Rate"
                value={`₹${po.purchaseRate || 0}`}
              />
              <InfoItem className="col-span-2" title="Description" value={po.description || "-"} />
            </CardContent>
          </Card>

          {/* 🧵 Parties Involved */}
          <SectionTitle title="Associated Parties" />
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
              <InfoItem title="Agent" value={po.agentName || "-"} />
              <InfoItem title="Category" value={po.categoryName || "-"} />
              <InfoItem title="Fabricator" value={po.fabricatorName || "-"} />
            </CardContent>
          </Card>

          {/* 👕 Material & Design */}
          <SectionTitle title="Material & Design Details" />
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3">
              <InfoItem title="Cloth Name" value={po.clothName || "-"} />
              <InfoItem title="Design Name" value={po.designName || "-"} />
            </CardContent>
          </Card>
        </div>

        <Separator className="my-3" />

        <DialogFooter className="flex flex-row justify-end pt-2">
          <Button
            variant="destructive"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md shadow-sm transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>

          <EditPurchaseOrderForm purchaseOrder={po}/>
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
