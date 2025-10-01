import React, { useCallback, useEffect, useState } from "react";
import { Switch } from "../ui/switch";
import AddSaleOrderForm from "../addSaleOrder";
import { Input } from "../ui/input";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { useUser } from "@clerk/nextjs";
import PartySaleOrder from "../cards/PartySaleOrder";
import toast, { Toaster } from "react-hot-toast";

export default function PartyDashboard({ partyId }) {
  const[party, setParty] = useState(null);
  const [salesOrders, setSalesOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingCases, setPendingCases] = useState(0);
  const [dispatchedCases, setDispatchedCases] = useState(0);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [showPending, setShowPending] = useState(true);
  const { user, isLoaded } = useUser();
  const [searchTerm,setSearchTerm]= useState("");


  

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

  //Search

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
        const employeeName= o.employeeName || "";
        const agentName = o.agentName || "";
        return (
          (ordernumber &&
            String(ordernumber).toLowerCase().includes(lowerTerm)) ||
          (partyName && partyName.toLowerCase().includes(lowerTerm)) ||
          (employeeName && employeeName.toLowerCase().includes(lowerTerm)) ||
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

  const fetchSalesOrders= useCallback(async()=>{
    if(!partyId)return;
    try{
      const res = await fetch(
        `/api/sales-orders?partyId=${encodeURIComponent(partyId)}`
      );
      if (!res.ok) throw new Error("Failed to fetch sales orders");
      const data = await res.json();
      const all = data.salesOrders || [];
      setParty(data.party);
      setSalesOrders(all);

      const { pending, completed } = partitionFromOrders(all);
      setPendingOrders(pending);
      setCompletedOrders(completed);
      // totals will be updated by the useEffect watching salesOrders
    } catch (err) {
      console.error("fetchSalesOrders error:", err);
      toast.error("Could not load sales orders");
    }
  },[partyId, partitionFromOrders]);

  const handleOnDispatched = async (updatedOrderOrId) => {
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
    
  };

  const handleDeleteOrder = async (deleteOrderId) => {
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
      
    } catch (err) {
      console.error("Failed to delete order:", err);
      toast.error("Failed to delete order");
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchSalesOrders();
    }
  }, [isLoaded, fetchSalesOrders]);

  if(!isLoaded){
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" />
      {/* Header Section */}
      <div className="flex flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-bold text-3xl">{party?.name}</h2>

        <div className="flex flex-row gap-4 items-center">
          {/* Toggle Switch */}
          <div className="flex items-center space-x-2">
                <Switch
                  checked={showPending}
                  onCheckedChange={(checked) => setShowPending(checked)}
                />

                <span className="text-sm font-medium">
                  {showPending ? "Pending Orders" : "Completed Orders"}
                </span>
          </div>

          {/* <AddSaleOrderForm
            currUser={currUser}
            onCreated={fetchSalesOrders}
            managerId={managerId}
            employeeDashboard={true}
            triggerLabel="Add Sale Order"
            triggerClassName="flex items-center gap-2"
          /> */}
        </div>
      </div>

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
              <PartySaleOrder
                SaleOrder={order}
                onDispatched={handleOnDispatched}
                // userRole={role}
                handleDeleteOrder={handleDeleteOrder}
              />
            </div>
          ))}

        {!showPending &&
          completedOrders.map((order) => (
            <div key={order.id} className="h-full">
              <PartySaleOrder
                SaleOrder={order}
                // userRole={role}
                handleDeleteOrder={handleDeleteOrder}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
