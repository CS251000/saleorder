"use client";

import React, { useEffect, useState, useCallback } from "react";
import EmployeeSaleOrder from "../cards/EmployeeSaleOrder";
import { Switch } from "../ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import AddSaleOrderForm from "../addSaleOrder";
import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import PartyEmployeeDashboardSkeleton from "../skeletons/party-employee-dashboards";


  const USER_META_TTL = 1440 * 60 * 1000;

function readUserMetaFromCache(userId) {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(`user_meta_${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (e) {
    console.warn("readUserMetaFromCache error", e);
    return null;
  }
}

function writeUserMetaToCache(userId, { role, managerId }) {
  if (!userId) return;
  try {
    localStorage.setItem(
      `user_meta_${userId}`,
      JSON.stringify({ role, managerId, ts: Date.now() })
    );
  } catch (e) {
    console.warn("writeUserMetaToCache error", e);
  }
}

export default function EmployeeDashboard({ currUser }) {
  const [salesOrders, setSalesOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingCases, setPendingCases] = useState(0);
  const [dispatchedCases, setDispatchedCases] = useState(0);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [showPending, setShowPending] = useState(true);
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState("");
  const [managerId, setManagerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);



  const getPending = (o) =>
    Number(o?.pendingCase ?? o?.pending_case ?? o?.pending ?? 0);

  const getDispatched = (o) =>
    Number(o?.dispatchedCase ?? o?.dispatched_case ?? o?.dispatched ?? 0);

  const partitionFromOrders = useCallback((orders) => {
    const pending = orders.filter((o) => {
      const st = o.orderStatus;
      return st === undefined ? getPending(o) > 0 : st === "Pending";
    });
    const completed = orders.filter((o) => {
      const st = o.orderStatus;
      return st === "Dispatched" || getPending(o) === 0;
    });
    return { pending, completed };
  }, []);

  // search logic
  useEffect(() => {
    if (!searchTerm || searchTerm.trim() === "") {
      // reset to all orders (partitionFromOrders will partition salesOrders)
      const { pending, completed } = partitionFromOrders(salesOrders);
      setPendingOrders(pending);
      setCompletedOrders(completed);
      return;
    }
    const lowerTerm = searchTerm.trim().toLowerCase();
    const filtered = salesOrders.filter((o) => {
      const ordernumber = o.orderNumber;
      const partyName = o.partyName || "";
      const agentName = o.agentName || "";
      return (
        (ordernumber &&
          String(ordernumber).toLowerCase().includes(lowerTerm)) ||
        (partyName && partyName.toLowerCase().includes(lowerTerm)) ||
        (agentName && agentName.toLowerCase().includes(lowerTerm))
      );
    });
    const { pending, completed } = partitionFromOrders(filtered);
    setPendingOrders(pending);
    setCompletedOrders(completed);
  }, [searchTerm, salesOrders, partitionFromOrders]);

  // Recalculate totals whenever salesOrders changes (keeps totals dynamic)
  useEffect(() => {
    let totalPending = 0;
    let totalDispatched = 0;

    salesOrders.forEach((order) => {
      totalPending += getPending(order);
      totalDispatched += getDispatched(order);
    });

    setPendingCases(totalPending);
    setDispatchedCases(totalDispatched);
  }, [salesOrders]);

  const fetchSalesOrders = useCallback(async () => {
    if (!currUser?.id) return;
    try {
      setLoading(true);
      const res = await fetch(
        `/api/sales-orders?employeeId=${encodeURIComponent(currUser.id)}`,{
          next: { tags: [`employee-sales-orders-${currUser.id}`], revalidate: 120 },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch sales orders");
      const data = await res.json();
      const all = data.salesOrders || [];
      setSalesOrders(all);

      const { pending, completed } = partitionFromOrders(all);
      setPendingOrders(pending);
      setCompletedOrders(completed);
      // totals will be updated by the useEffect watching salesOrders
    } catch (err) {
      console.error("fetchSalesOrders error:", err);
      toast.error("Could not load sales orders");
    }finally{
      setLoading(false);
    }
  }, [currUser, partitionFromOrders]);


 // CACHED role + managerId read + background revalidate
  useEffect(() => {
    if (!isLoaded || !currUser) return;

    const cached = readUserMetaFromCache(currUser.id);
    const now = Date.now();

    // If cache is valid use it immediately for snappy UI
    if (cached && cached.role) {
      setRole(cached.role);
      setManagerId(cached.managerId ?? null);
    }

    // Revalidate if no cache or stale
    const shouldFetch = !cached || (now - (cached.ts || 0) >= USER_META_TTL);

    if (!shouldFetch) return;

    let mounted = true;
    (async function fetchRole() {
      try {
        const res = await fetch(`/api/user?id=${encodeURIComponent(user.id)}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        const fetchedRole = data.currentUser?.role ?? "";
        let fetchedManagerId = null;

        if (fetchedRole === "Employee") {
          // fetch manager id for employees
          try {
            const mgrRes = await fetch(`/api/manager?employeeId=${encodeURIComponent(data.currentUser.id)}`);
            if (mgrRes.ok) {
              const datam = await mgrRes.json();
              fetchedManagerId = datam?.managerId ?? null;
            } else {
              console.warn("mgrRes not ok", mgrRes.status);
            }
          } catch (err) {
            console.error("Error fetching manager ID:", err);
          }
        } else {
          fetchedManagerId = data.currentUser?.id ?? null;
        }

        if (!mounted) return;
        setRole(fetchedRole);
        setManagerId(fetchedManagerId);
        writeUserMetaToCache(currUser.id, { role: fetchedRole, managerId: fetchedManagerId });
      } catch (err) {
        console.error("Error fetching user role:", err);
      }
    })();

    return () => { mounted = false; };
  }, [isLoaded, currUser, user]);

  // fetch orders once currUser is known
  useEffect(() => {
    if (!currUser?.id) return;
    fetchSalesOrders();
  }, [currUser, fetchSalesOrders]);



  useEffect(() => {
    if (!currUser?.id) return;
    fetchSalesOrders();
  }, [currUser, fetchSalesOrders]);


  const handleOnDispatched = useCallback(async (updatedOrderOrId) => {
    const updatedOrder =
      typeof updatedOrderOrId === "object" ? updatedOrderOrId : null;
    if (!updatedOrder) {
      await fetchSalesOrders();
      return;
    }
    const updatedId = updatedOrder.id;
    if (!updatedId) {
      await fetchSalesOrders();
      return;
    }
    setSalesOrders((prev) => {
      const found = prev.some((o) => String(o.id) === String(updatedId));
      const newList = found
        ? prev.map((o) =>
            String(o.id) === String(updatedId) ? updatedOrder : o
          )
        : [updatedOrder, ...prev];

      // recalc partitions and set them
      const { pending, completed } = partitionFromOrders(newList);
      setPendingOrders(pending);
      setCompletedOrders(completed);

      return newList;
    });
    toast.success("Order updated");
    // totals auto-updated by useEffect on salesOrders
  },[fetchSalesOrders,partitionFromOrders]);

  const handleDeleteOrder = useCallback(async (deleteOrderId) => {
    if (!deleteOrderId) return;

    if (
      !confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/sales-orders?orderId=${deleteOrderId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete order");
      toast.success("Order deleted");
      setSalesOrders((prev) =>
        prev.filter((o) => String(o.id) !== String(deleteOrderId))
      );
      // partitions/totals will update via effects
    } catch (err) {
      console.error("Failed to delete order:", err);
      toast.error("Failed to delete order");
    }
  },[]);


  if (!currUser || !isLoaded || loading) {
    return (
      <PartyEmployeeDashboardSkeleton />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-bold text-3xl">{currUser?.username}</h2>

        <div className="relative w-80 mx-auto">
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
          placeholder="Search"
          className="pl-12 pr-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

        <div className="flex flex-row gap-4 items-center">
          <AddSaleOrderForm
            currUser={currUser}
            onCreated={fetchSalesOrders}
            managerId={managerId}
            employeeDashboard={true}
            triggerLabel="Add Sale Order"
            triggerClassName="flex items-center gap-2"
          />
        </div>
      </div>

      

      {/* Toggle tabs */}
          <div>
            {role === "Manager" && (
              <div className="flex w-full max-w-sm flex-col gap-6 mb-4">
              <Tabs defaultValue={showPending ? "pending" : "completed"} className=" rounded-md p-1">
                <TabsList>
                  <TabsTrigger
                    value="pending"
                    className={"cursor-pointer"}
                    onClick={() => setShowPending(true)}
                  >
                    Pending Orders
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className={"cursor-pointer"}
                    onClick={() => setShowPending(false)}
                  >
                    Completed Orders
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              </div>
                
            )}
          </div>

      {/* Orders Header */}
      <Card className="shadow-md p-4">
        <CardHeader className="p-0">
          <div className="flex flex-col items-start justify-start gap-4">
            <div>
              <CardTitle className="text-lg font-semibold leading-tight mb-0">
                {showPending ? "Pending" : "Completed"}
              </CardTitle>
            </div>
            <div className="flex items-center gap-3">
              {/* Orders count */}
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold leading-tight">
                  {showPending ? pendingOrders.length : completedOrders.length}
                </span>
                <span className="text-md text-gray-500 leading-tight">
                  orders
                </span>
              </div>

              {/* Cases badge */}
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-center">
                <div className="text-lg font-semibold leading-tight">
                  {showPending ? pendingCases : dispatchedCases}
                </div>
                <div className="text-md text-gray-500 leading-tight">
                  {showPending ? "Pending Cases" : "Dispatched Cases"}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

      </Card>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {showPending &&
          pendingOrders.map((order) => (
            <div key={order.id} className="h-full">
              <EmployeeSaleOrder
                SaleOrder={order}
                onDispatched={handleOnDispatched}
                userRole={role}
                handleDeleteOrder={handleDeleteOrder}
                managerId={managerId}
                currUser={currUser}
              />
            </div>
          ))}

        {!showPending &&
          completedOrders.map((order) => (
            <div key={order.id} className="h-full">
              <EmployeeSaleOrder
                managerId={managerId}
                SaleOrder={order}
                userRole={role}
                currUser={currUser}
                handleDeleteOrder={handleDeleteOrder}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
