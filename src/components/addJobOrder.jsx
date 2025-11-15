"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  CirclePlus,
  Shirt,
  StarIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format } from "date-fns";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Toggle } from "./ui/toggle";
import { useProdManager } from "@/context/ProdManagerContext";
import { useGlobalUser } from "@/context/UserContext";
import toast from "react-hot-toast";

export function AddJobOrderForm({ fabricatorId, designId, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [clothOpen, setClothOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseComboOpen, setExpenseComboOpen] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [expenseToAdd, setExpenseToAdd] = useState("");
  const [poOpen, setPoOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [POs, setPOs] = useState([]);
  const [saving, setSaving] = useState(false);

  const { currentUser } = useGlobalUser();
  const initialFormState = {
    jobSlipNumber: "",
    managerId: currentUser.id,
    orderDate: new Date(),
    fabricatorId: null,
    fabricatorName: "",
    dueDate: null,
    dueDays: "",
    isSampleGiven: false,
    clothId: null,
    clothName: "",
    totalMeter: "",
    price: "",
    designId: null,
    designName: "",
    average: 0.0,
    fabrication: 0.0,
    costing: 0.0,
    salePrice: 0.0,
    isBestSeller: false,
  };

  const [form, setForm] = useState(initialFormState);

  const {
    // Fabricators
    fabricators,
    addFabricator,
    // Cloths
    cloths,
    addCloth,
    // Designs
    designs,
    addDesign,
  } = useProdManager();

  const handleAddExpense = (e) => {
    const val = e.target.value;
    if (!val) return;

    const found = expenses.find((ex) => ex.value === val);
    if (!found) return;

    if (selectedExpenses.some((s) => s.value === found.value)) return;

    setSelectedExpenses((prev) => [...prev, { ...found, amount: "" }]);
  };

  async function handleCompletePO(purchaseOrder) {
    try {
      const res = await fetch(`/api/purchaseOrder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          POid: purchaseOrder.id,
          POnumber: purchaseOrder.poNumber,
          clothId: purchaseOrder.clothId,
          agentId: purchaseOrder.agentId,
        }),
      });

      if (!res.ok) throw new Error("Failed to complete purchase order");
      globalMutate(`/api/clothBuyAgents?managerId=${managerId}`);
      globalMutate(`/api/cloths?managerId=${managerId}`);
    } catch (error) {
      console.error("Error completing job slip:", error);
    }
  }

  const handleAmountChange = (index, value) => {
    setSelectedExpenses((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], amount: value };
      return copy;
    });
  };

  const handleRemoveExpense = (index) => {
    setSelectedExpenses((prev) => prev.filter((_, i) => i !== index));
  };

  async function fetchExpenses() {
    try {
      const res = await fetch(`/api/expenses?managerId=${currentUser.id}`);
      const data = await res.json();
      const formatted = data.map((exp) => ({
        value: exp.id,
        label: exp.expenseName,
      }));
      setExpenses(formatted);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    }
  }

  async function handleAddNewExpense(name) {
    try {
      setExpenseSaving(true);

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseName: name, managerId: currentUser.id }),
      });

      const newExpense = await res.json();
      const formatted = { value: newExpense.id, label: newExpense.expenseName };

      setExpenses((prev) => [...prev, formatted]);

      // Auto-add after creation
      handleAddExpense({ target: { value: formatted.value } });

      setExpenseToAdd("");
      setExpenseComboOpen(false);
    } catch (err) {
      console.error("Error adding expense:", err);
    } finally {
      setExpenseSaving(false);
    }
  }

  const handleCancel = () => {
    setForm({ ...initialFormState, managerId: currentUser.id });
    setSelectedExpenses([]);
  };

  useEffect(() => {
    if (!form.managerId || !form.clothId) return;

    const fetchPurchaseOrders = async () => {
      try {
        const params = new URLSearchParams({ managerId: form.managerId });

        params.append("clothId", form.clothId);

        const res = await fetch(`/api/purchaseOrder?${params.toString()}`);
        let data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch orders");

        // Filter pending POs
        data = data.filter((po) => po.status === "Pending");

        // Update state
        setPOs(data);

        console.log("Fetched Purchase Orders:", data);
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
      }
    };

    fetchPurchaseOrders();
  }, [form.managerId, form.clothId]);

  useEffect(() => {
    if (fabricatorId) {
      const found = fabricators.find((f) => f.id === Number(fabricatorId));
      if (found) {
        setForm((prev) => ({
          ...prev,
          fabricatorName: found.name,
        }));
      }
    }

    if (designId) {
      const foundDesign = designs.find((d) => d.id === Number(designId));
      if (foundDesign) {
        setForm((prev) => ({
          ...prev,
          designName: foundDesign.name,
        }));
      }
    }
  }, [fabricatorId, designId, fabricators, designs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.jobSlipNumber?.trim()) {
    toast.error("Job Slip Number is required");
    return;
  }

  if (!form.managerId) {
    toast.error("Manager ID is missing");
    return;
  }

    try {
      setSaving(true);

      let {
        jobSlipNumber,
        managerId,
        orderDate,
        fabricatorId,
        fabricatorName,
        dueDate,
        isSampleGiven,
        clothId,
        clothName,
        totalMeter,
        price,
        designId,
        designName,
        average,
        fabrication,
        costing,
        salePrice,
        isBestSeller,
      } = form;

      if (!fabricatorId && fabricatorName) {
        const newFab = await addFabricator(fabricatorName);
        fabricatorId = newFab?.id;
      }

      if (!clothId && clothName) {
        const newCloth = await addCloth(clothName);
        clothId = newCloth?.id;
      }

      if (!designId && designName) {
        const newDesign = await addDesign(designName);
        designId = newDesign?.id;
      }
      // 🏗️ Construct final object for submission
      const finalJobSlip = {
        jobSlipNumber,
        managerId,
        orderDate,
        fabricatorId,
        dueDate,
        isSampleGiven,
        clothId,
        totalMeter: parseFloat(totalMeter) || 0,
        price: parseFloat(price) || 0,
        designId,
        average: parseFloat(average) || 0,
        fabrication: parseFloat(fabrication) || 0,
        costing: parseFloat(costing) || 0,
        salePrice: parseFloat(salePrice) || 0,
        isBestSeller,
        expenses: selectedExpenses,
      };

      // 📨 Send to API
      const res = await fetch("/api/jobOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalJobSlip),
      });
      if (!res.ok) {
      if (res.status === 400) {
        toast.error(data.error || "Missing required fields");
      } else if (res.status === 409) {
        toast.error("Job Slip Number already exists. Please use a different number.");
      } else if (res.status === 500) {
        toast.error(data.error || "Server error occurred");
      } else {
        toast.error("Failed to create job order");
      }
      return;
    }

      const data = await res.json();
      

      toast.success("Job Slip created successfully ✅");
      if(selectedPO){
        await handleCompletePO(selectedPO)
      }
      
      setForm(initialFormState);
      setSelectedExpenses([]);

      if (onSuccess) {
        onSuccess();
      }
      setOpen(false);
    } catch (error) {
      console.error("❌ Error submitting job slip:", error);
      toast.error("Error creating job slip");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setOpen(true)}
        >
          <CirclePlus className="h-5 w-5" />
          Job Order
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] w-[100%]">
        <ScrollArea className="h-[85vh] ">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Job Order</DialogTitle>
              <DialogDescription>
                Fill in the required information below. Click{" "}
                <b>Save changes</b> when done.
              </DialogDescription>
            </DialogHeader>

            {/* Form Fields */}
            <div className="flex flex-col space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Job Slip ID */}
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="jobslipid">Job Slip No.</Label>
                  <Input
                    id="jobslipid"
                    placeholder="Enter..."
                    className="w-full"
                    onChange={(e) =>
                      setForm({ ...form, jobSlipNumber: e.target.value })
                    }
                  />
                </div>

                {/* Job Date */}
                <div className="flex flex-col space-y-1.5">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-between text-sm overflow-hidden"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CalendarIcon className="h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {form.orderDate
                              ? format(form.orderDate, "dd MMM yyyy")
                              : "Pick date"}
                          </span>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.orderDate}
                        onSelect={(v) => setForm({ ...form, orderDate: v })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Fabricator Dropdown */}
                <div className="flex flex-col space-y-1.5">
                  <Label>Fabricator</Label>
                  <Popover open={fabOpen} onOpenChange={setFabOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between text-sm overflow-hidden"
                      >
                        <span className="truncate max-w-[80%]">
                          {form.fabricatorName || "Select..."}
                        </span>
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="p-0 w-full">
                      <Command>
                        <CommandInput
                          placeholder="Search fabricator..."
                          onValueChange={(v) =>
                            setForm({ ...form, fabricatorName: v })
                          }
                        />
                        <CommandList>
                          <CommandEmpty>
                            <div className="flex flex-col items-center gap-2 py-3">
                              <p className="text-sm text-muted-foreground">
                                No fabricator found.
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (!form.fabricatorName) return;
                                  setFabOpen(false);
                                }}
                              >
                                <CirclePlus className="w-4 h-4 mr-1" />
                                Add “{form.fabricatorName}”
                              </Button>
                            </div>
                          </CommandEmpty>

                          <CommandGroup>
                            {fabricators.map((f) => (
                              <CommandItem
                                key={f.id}
                                value={f.name}
                                className="truncate"
                                onSelect={() => {
                                  setForm({
                                    ...form,
                                    fabricatorName: f.name,
                                    fabricatorId: f.id,
                                  });
                                  setFabOpen(false);
                                }}
                              >
                                <CheckIcon
                                  className={`mr-2 h-4 w-4 ${
                                    form.fabricatorName === f.name
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                <span className="truncate">{f.name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Sample Given Toggle */}
                <div className="mt-5 lg:mt-7">
                  <Toggle
                    pressed={form.isSampleGiven}
                    onPressedChange={(p) =>
                      setForm({ ...form, isSampleGiven: p })
                    }
                    className="cursor-pointer border border-slate-300 transition-all hover:bg-blue-50 hover:text-blue-600
                 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600 data-[state=on]:border-blue-300"
                  >
                    <Shirt className="w-4 h-4" />
                    <span className="font-medium">Sample Given</span>
                  </Toggle>
                </div>

                {/* Due Date + Days */}
                <div className="flex flex-col space-y-1.5 col-span-2">
                  <Label>Due date</Label>

                  <div className="flex items-center gap-3 w-full rounded-xl border bg-white px-3 py-2 shadow-sm">
                    {/* Due Date Picker */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-2 min-w-0 text-sm truncate"
                        >
                          <CalendarIcon className="h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {form.dueDate
                              ? format(form.dueDate, "dd MMM yyyy")
                              : "Pick due date"}
                          </span>
                        </button>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.dueDate}
                          onSelect={(v) => {
                            if (!v) return;
                            setForm((prev) => {
                              if (prev.orderDate) {
                                const diff = differenceInCalendarDays(
                                  v,
                                  prev.orderDate
                                );
                                return {
                                  ...prev,
                                  dueDate: v,
                                  dueDays: String(Math.max(0, diff)),
                                };
                              }
                              return { ...prev, dueDate: v };
                            });
                          }}
                        />
                      </PopoverContent>
                    </Popover>

                    {/* Divider */}
                    <div className="h-6 w-px bg-muted-foreground/20" />

                    {/* Days input */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Days
                      </span>
                      <input
                        type="number"
                        min={0}
                        className="w-20 rounded-md border px-2 py-1 text-sm text-center"
                        value={form.dueDays ?? ""}
                        placeholder="0"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setForm((p) => ({ ...p, dueDays: "" }));
                            return;
                          }
                          const days = Math.max(0, Number(val));
                          setForm((prev) => {
                            if (prev.orderDate) {
                              return {
                                ...prev,
                                dueDays: days,
                                dueDate: addDays(prev.orderDate, days),
                              };
                            }
                            return { ...prev, dueDays: days };
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Material details */}
              <Accordion
                type="multiple"
                className="w-full"
                defaultValue={["shirtdetails"]}
              >
                {/* ------------------ MATERIAL DETAILS ------------------ */}
                <AccordionItem
                  value="materialdetails"
                  className="border border-gray-200 rounded-xl shadow-sm bg-white my-2"
                >
                  <AccordionTrigger className="text-md font-semibold px-4 py-2 text-gray-800 cursor-pointer hover:text-indigo-700">
                    Material Details
                  </AccordionTrigger>

                  <AccordionContent className="p-4 text-gray-600 bg-gray-50 rounded-b-xl">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* CLOTH NAME */}
                      <div className="flex flex-col space-y-1.5">
                        <Label>Cloth Name</Label>

                        <Popover open={clothOpen} onOpenChange={setClothOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={clothOpen}
                              className="w-full justify-between overflow-hidden"
                            >
                              <span className="truncate">
                                {form.clothName || "Select..."}
                              </span>
                              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search cloth..."
                                onValueChange={(v) =>
                                  setForm({ ...form, clothName: v })
                                }
                              />
                              <CommandList>
                                <CommandEmpty>
                                  <div className="flex flex-col items-center gap-2 py-3">
                                    <p className="text-sm text-muted-foreground">
                                      No cloth found.
                                    </p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        if (!form.clothName) return;
                                        setClothOpen(false);
                                      }}
                                    >
                                      <CirclePlus className="w-4 h-4 mr-1" />
                                      Add “{form.clothName}”
                                    </Button>
                                  </div>
                                </CommandEmpty>

                                <CommandGroup>
                                  {cloths.map((c) => (
                                    <CommandItem
                                      key={c.id}
                                      value={c.name}
                                      className="truncate"
                                      onSelect={() => {
                                        setForm({
                                          ...form,
                                          clothName: c.name,
                                          clothId: c.id,
                                        });
                                        setClothOpen(false);
                                      }}
                                    >
                                      <CheckIcon
                                        className={`mr-2 h-4 w-4 ${
                                          form.clothName === c.name
                                            ? "opacity-100"
                                            : "opacity-0"
                                        }`}
                                      />
                                      <span className="truncate">{c.name}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* PURCHASE ORDER */}
                      <div className="flex flex-col space-y-1.5">
                        <Label>Purchase Order</Label>

                        <Popover open={poOpen} onOpenChange={setPoOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={poOpen}
                              disabled={!form.clothName}
                              className="w-full justify-between overflow-hidden text-left"
                            >
                              {selectedPO ? (
                                <div className="flex flex-col items-start min-w-0">
                                  <span className="truncate font-medium">
                                    {selectedPO.poNumber}
                                  </span>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {selectedPO.designName} •{" "}
                                    {selectedPO.fabricatorName}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground truncate">
                                  {form.clothName
                                    ? "Select purchase order..."
                                    : "Select cloth first"}
                                </span>
                              )}
                              <ChevronsUpDownIcon className="h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent className="w-[330px] p-0">
                            <Command>
                              <CommandInput placeholder="Search purchase order..." />
                              <CommandList>
                                <CommandEmpty>
                                  No purchase order found.
                                </CommandEmpty>

                                <CommandGroup>
                                  {POs.map((po) => (
                                    <CommandItem
                                      key={po.id}
                                      value={po.poNumber}
                                      className="truncate"
                                      onSelect={() => {
                                        setSelectedPO(po);
                                        setPoOpen(false);
                                        setForm({
                                          ...form,
                                          totalMeter: po.quantity,
                                          price: po.purchaseRate,
                                        });
                                      }}
                                    >
                                      <div className="flex flex-col min-w-0">
                                        <span className="truncate font-medium">
                                          {po.poNumber}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate">
                                          {po.designName} • {po.fabricatorName}
                                        </span>
                                        <span className="text-xs text-gray-500 truncate">
                                          Qty: {po.quantity} | Rate: ₹
                                          {po.purchaseRate}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* TOTAL METER */}
                      <div className="flex flex-col space-y-1.5">
                        <Label>Total Meter</Label>
                        <Input
                          placeholder="Enter total meter..."
                          className="w-full truncate"
                          value={form.totalMeter}
                          onChange={(e) =>
                            setForm({ ...form, totalMeter: e.target.value })
                          }
                        />
                      </div>

                      {/* PRICE */}
                      <div className="flex flex-col space-y-1.5">
                        <Label>Price</Label>
                        <Input
                          placeholder="Enter price..."
                          className="w-full truncate"
                          value={form.price}
                          onChange={(e) =>
                            setForm({ ...form, price: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* ------------------ SHIRT DETAILS ------------------ */}
                <AccordionItem
                  value="shirtdetails"
                  className="border border-gray-200 rounded-xl shadow-sm bg-white my-2"
                >
                  <AccordionTrigger className="text-md font-semibold px-4 py-2 text-gray-800 cursor-pointer hover:text-indigo-700">
                    Shirt Details
                  </AccordionTrigger>

                  <AccordionContent className="p-4 text-gray-600 bg-gray-50 rounded-b-xl">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* DESIGN */}
                      <div className="flex flex-col space-y-1.5">
                        <Label>Design</Label>

                        <Popover open={designOpen} onOpenChange={setDesignOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={designOpen}
                              className="w-full justify-between overflow-hidden"
                            >
                              <span className="truncate">
                                {form.designName || "Select..."}
                              </span>
                              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search design..."
                                onValueChange={(v) =>
                                  setForm({ ...form, designName: v })
                                }
                              />
                              <CommandList>
                                <CommandEmpty>
                                  <div className="flex flex-col items-center gap-2 py-3">
                                    <p className="text-sm text-muted-foreground">
                                      No design found.
                                    </p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        if (!form.designName) return;
                                        setDesignOpen(false);
                                      }}
                                    >
                                      <CirclePlus className="w-4 h-4 mr-1" />
                                      Add “{form.designName}”
                                    </Button>
                                  </div>
                                </CommandEmpty>

                                <CommandGroup>
                                  {designs.map((d) => (
                                    <CommandItem
                                      key={d.id}
                                      value={d.name}
                                      className="truncate"
                                      onSelect={() => {
                                        setForm({
                                          ...form,
                                          designName: d.name,
                                          designId: d.id,
                                        });
                                        setDesignOpen(false);
                                      }}
                                    >
                                      <CheckIcon
                                        className={`mr-2 h-4 w-4 ${
                                          form.designName === d.name
                                            ? "opacity-100"
                                            : "opacity-0"
                                        }`}
                                      />
                                      <span className="truncate">{d.name}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* AVERAGE */}
                      <div className="flex flex-col space-y-1.5">
                        <Label>Average</Label>
                        <Input
                          placeholder="Enter average..."
                          className="w-full truncate"
                          onChange={(e) =>
                            setForm({ ...form, average: e.target.value })
                          }
                        />
                      </div>

                      {/* FABRICATION */}
                      <div className="flex flex-col space-y-1.5">
                        <Label>Fabrication</Label>
                        <Input
                          placeholder="Enter fabrication..."
                          className="w-full truncate"
                          onChange={(e) =>
                            setForm({ ...form, fabrication: e.target.value })
                          }
                        />
                      </div>

                      {/* --- EXPENSES SECTION --- */}
                      <div className="flex flex-col space-y-2">
                        <Label>Expenses</Label>

                        <Dialog
                          open={expenseOpen}
                          onOpenChange={(isOpen) => {
                            setExpenseOpen(isOpen);
                            if (isOpen && expenses.length === 0) {
                              fetchExpenses();
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex items-center gap-2 text-sm"
                            >
                              Click here
                            </Button>
                          </DialogTrigger>

                          <DialogContent className="sm:max-w-[450px] rounded-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-semibold">
                                Enter Expenses
                              </DialogTitle>
                            </DialogHeader>

                            <Separator className="my-2" />

                            <ScrollArea className="max-h-[300px] pr-2">
                              {/* Combobox + Add Button */}
                              <div className="flex items-center gap-2 mb-4 border-2 p-2 rounded-lg">
                                <Label
                                  htmlFor="expense-select"
                                  className="min-w-[90px]"
                                >
                                  Add
                                </Label>

                                {/* ✅ Expense Combobox */}
                                <div className="flex-1">
                                  <Popover
                                    open={expenseComboOpen}
                                    onOpenChange={setExpenseComboOpen}
                                  >
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="w-full justify-between text-left font-normal"
                                      >
                                        {expenseToAdd ? (
                                          expenseToAdd
                                        ) : (
                                          <span className="text-muted-foreground">
                                            -- Select expense --
                                          </span>
                                        )}
                                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-full p-0">
                                      <Command>
                                        <CommandInput
                                          placeholder="Search or add expense..."
                                          value={expenseToAdd}
                                          onValueChange={setExpenseToAdd}
                                        />

                                        <CommandList>
                                          <CommandEmpty>
                                            <div className="flex flex-col items-center gap-2 py-3">
                                              <p className="text-sm text-muted-foreground">
                                                No expense found.
                                              </p>

                                              {expenseSaving ? (
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  disabled
                                                >
                                                  Adding...
                                                </Button>
                                              ) : (
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={async () => {
                                                    if (!expenseToAdd.trim())
                                                      return;
                                                    await handleAddNewExpense(
                                                      expenseToAdd.trim()
                                                    );
                                                  }}
                                                >
                                                  <CirclePlus className="w-4 h-4 mr-1" />{" "}
                                                  Add “{expenseToAdd}”
                                                </Button>
                                              )}
                                            </div>
                                          </CommandEmpty>

                                          <CommandGroup>
                                            {expenses
                                              .filter(
                                                (ex) =>
                                                  !selectedExpenses.some(
                                                    (s) => s.value === ex.value
                                                  )
                                              )
                                              .map((ex) => (
                                                <CommandItem
                                                  key={ex.value}
                                                  value={ex.label}
                                                  onSelect={() => {
                                                    handleAddExpense({
                                                      target: {
                                                        value: ex.value,
                                                      },
                                                    });
                                                    setExpenseToAdd("");
                                                    setExpenseComboOpen(false);
                                                  }}
                                                >
                                                  {ex.label}
                                                </CommandItem>
                                              ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    if (!expenseToAdd) return;
                                    handleAddExpense({
                                      target: { value: expenseToAdd },
                                    });
                                  }}
                                >
                                  Add
                                </Button>
                              </div>

                              {/* ✅ List of added expenses */}
                              {selectedExpenses.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                  No expenses added yet. Select one above to
                                  add.
                                </p>
                              )}

                              <div className="space-y-3">
                                {selectedExpenses.map((se, idx) => (
                                  <div
                                    key={se.value}
                                    className="flex items-center gap-2"
                                  >
                                    <div className="w-1/2">
                                      <Label className="text-sm">
                                        {se.label}
                                      </Label>
                                    </div>
                                    <div className="flex-1">
                                      <Input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={se.amount}
                                        onChange={(e) =>
                                          handleAmountChange(
                                            idx,
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Button
                                        variant="outline"
                                        onClick={() => handleRemoveExpense(idx)}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>

                            <DialogFooter className="mt-3">
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button onClick={() => setExpenseOpen(false)}>
                                Save
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* COSTING */}
                      <div className="flex flex-col space-y-1.5">
                        <Label>Costing</Label>
                        <Input
                          placeholder="Enter costing..."
                          className="w-full truncate"
                          onChange={(e) =>
                            setForm({ ...form, costing: e.target.value })
                          }
                        />
                      </div>
                      {/* SALE PRICE */}
                      <div className="flex flex-col space-y-1.5">
                        <Label>Sale Price</Label>
                        <Input
                          placeholder="Enter sale price..."
                          className="w-full truncate"
                          onChange={(e) =>
                            setForm({ ...form, salePrice: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    {/* BESTSELLER */}
                    <Toggle
                      pressed={form.isBestSeller}
                      onPressedChange={(p) =>
                        setForm({ ...form, isBestSeller: p })
                      }
                      className="mt-2 data-[state=on]:*:[svg]:fill-yellow-500 data-[state=on]:*:[svg]:stroke-yellow-500"
                    >
                      <StarIcon />
                      Bestseller
                    </Toggle>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-2">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </DialogClose>
              {saving ? (
                <Button type="submit" className="w-full sm:w-auto" disabled>
                  Saving...
                </Button>
              ) : (
                <Button type="submit" className="w-full sm:w-auto">
                  Save
                </Button>
              )}
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
