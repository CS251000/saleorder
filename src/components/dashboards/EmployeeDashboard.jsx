"use client";

import React, { useEffect, useState, useCallback } from "react";
import EmployeeSaleOrder from "../cards/EmployeeSaleOrder";
import { Switch } from "../ui/switch";
import { Card, CardHeader, CardTitle } from "../ui/card";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

import AddSaleOrderForm from "../addSaleOrder";

export default function EmployeeDashboard({ currUser }) {
  const [salesOrders, setSalesOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [showPending, setShowPending] = useState(true);
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState("");

  const getId = (o) =>
    o?.id ?? o?.sales_order_id ?? o?.salesOrderId ?? o?.orderId ?? o?.order_id;
  const getStatus = (o) => o?.orderStatus ?? o?.status ?? o?.order_status;
  const getPending = (o) =>
    Number(o?.pendingCase ?? o?.pending_case ?? o?.pending ?? 0);

  const partitionFromOrders = useCallback((orders) => {
    const pending = orders.filter((o) => {
      const st = getStatus(o);
      return st === undefined ? getPending(o) > 0 : st === "Pending";
    });
    const completed = orders.filter((o) => {
      const st = getStatus(o);
      return st === "Dispatched" || getPending(o) === 0;
    });
    return { pending, completed };
  }, []);

  const fetchSalesOrders = useCallback(async () => {
    if (!currUser?.id) return;
    try {
      const res = await fetch(
        `/api/sales-orders?employeeId=${encodeURIComponent(currUser.id)}`
      );
      if (!res.ok) throw new Error("Failed to fetch sales orders");
      const data = await res.json();
      const all = data.salesOrders || data?.sales_orders || data || [];
      setSalesOrders(all);

      const { pending, completed } = partitionFromOrders(all);
      setPendingOrders(pending);
      setCompletedOrders(completed);
    } catch (err) {
      console.error("fetchSalesOrders error:", err);
      toast.error("Could not load sales orders");
    }
  }, [currUser, partitionFromOrders]);

  useEffect(() => {
    if (!isLoaded || !currUser) return;
    async function fetchRole() {
      try {
        const res = await fetch(`/api/user?id=${user.id}`);
        const data = await res.json();
        setRole(data.currentUser?.role ?? "");
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    }
    fetchRole();
  }, [isLoaded, currUser, user]);

  useEffect(() => {
    if (!currUser?.id) return;
    fetchSalesOrders();
  }, [currUser, fetchSalesOrders]);

  // called by child with the updated order object (returned by server)
  const handleOnDispatched = async (updatedOrderOrId) => {
    // sometimes child may pass only id; if so, refetch full list
    const updatedOrder =
      typeof updatedOrderOrId === "object" ? updatedOrderOrId : null;
    if (!updatedOrder) {
      // fallback: refetch whole list
      await fetchSalesOrders();
      return;
    }

    const updatedId = getId(updatedOrder);
    if (!updatedId) {
      await fetchSalesOrders();
      return;
    }

    // Replace the row in salesOrders (if found) or append if not present
    setSalesOrders((prev) => {
      const found = prev.some((o) => String(getId(o)) === String(updatedId));
      const newList = found
        ? prev.map((o) =>
            String(getId(o)) === String(updatedId) ? updatedOrder : o
          )
        : [updatedOrder, ...prev];

      // recalc partitions and set them
      const { pending, completed } = partitionFromOrders(newList);
      setPendingOrders(pending);
      setCompletedOrders(completed);

      return newList;
    });

    toast.success("Order updated");
  };

  if (!currUser) {
    return (
      <h1 className="text-center text-xl font-semibold mt-8">Loading...</h1>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-bold text-3xl">{currUser?.username}</h2>

        <div className="flex flex-row gap-4 items-center">
          {/* Toggle Switch */}
          <div className="flex items-center space-x-2">
            {role === "Manager" && (
              <>
                <Switch
                  checked={showPending}
                  onCheckedChange={(checked) => setShowPending(checked)}
                />

                <span className="text-sm font-medium">
                  {showPending ? "Pending Orders" : "Completed Orders"}
                </span>
              </>
            )}
          </div>

          <AddSaleOrderForm
            currUser={currUser}
            onCreated={fetchSalesOrders}
            employeeDashboard={true}
            triggerLabel="Add Sale Order"
            triggerClassName="flex items-center gap-2"
          />
        </div>
      </div>

      {/* Orders Header */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {showPending ? "Pending Orders" : "Completed Orders"} (
            {showPending ? pendingOrders.length : completedOrders.length})
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {showPending &&
          pendingOrders.map((order) => (
            <div key={getId(order)} className="h-full">
              <EmployeeSaleOrder
                SaleOrder={order}
                onDispatched={handleOnDispatched}
              />
            </div>
          ))}

        {!showPending &&
          completedOrders.map((order) => (
            <div key={getId(order)} className="h-full">
              <EmployeeSaleOrder SaleOrder={order} />
            </div>
          ))}
      </div>
    </div>
  );
}
