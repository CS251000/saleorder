"use client";

import React, { useEffect, useState } from "react";
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
import { format, parseISO } from "date-fns";
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
import useSWR, { mutate } from "swr";


export default function EditJobOrder({ jobSlip = {}, onSuccess,open,setOpen }) {
  const { currentUser } = useGlobalUser();
  const managerId= currentUser.id;
  // UI state
  const [fabOpen, setFabOpen] = useState(false);
  const [clothOpen, setClothOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseComboOpen, setExpenseComboOpen] = useState(false);
  const [expensesOptions, setExpensesOptions] = useState([]);
  const [expenseSaving, setExpenseSaving] = useState(false);

  // Prod manager helpers
  const {
    fabricators,
    addFabricator,
    cloths,
    addCloth,
    designs,
    addDesign,
  } = useProdManager();

  // form state (controlled)
  const initialForm = {
    id: jobSlip.id ?? null,
    jobSlipNumber: jobSlip.jobSlipNumber ?? "",
    managerId: currentUser?.id ?? null,
    orderDate: jobSlip.orderDate ? parseISO(jobSlip.orderDate) : new Date(),
    fabricatorId: jobSlip.fabricatorId ?? jobSlip.fabricatorId ?? null,
    fabricatorName: jobSlip.fabricatorName ?? "",
    dueDate: jobSlip.dueDate ? parseISO(jobSlip.dueDate) : null,
    isSampleGiven: !!jobSlip.isSampleGiven,
    clothId: jobSlip.clothId ?? null,
    clothName: jobSlip.clothName ?? "",
    totalMeter: jobSlip.totalMeter ?? 0,
    price: jobSlip.price ?? 0,
    designId: jobSlip.designId ?? null,
    designName: jobSlip.designName ?? "",
    average: jobSlip.average ?? 0,
    fabrication: jobSlip.fabrication ?? 0,
    costing: jobSlip.costing ?? 0,
    isBestSeller: !!jobSlip.isBestSeller,
  };

  const [form, setForm] = useState(initialForm);

  // selected expenses (array of { value, label, amount })
  const [selectedExpenses, setSelectedExpenses] = useState([]);
useEffect(() => {
  if (jobSlip?.expenses) {
    try {
      const parsed = Array.isArray(jobSlip.expenses)
        ? jobSlip.expenses
        : JSON.parse(jobSlip.expenses);

      setSelectedExpenses(
        parsed.map((e) => ({
          value: e.value,
          label: e.label,
          amount: e.amount ?? "",
        }))
      );
    } catch {
      setSelectedExpenses([]);
    }
  }
}, [jobSlip]);
  // const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {

    setForm((prev) => ({
      ...prev,
      jobSlipNumber: jobSlip.jobSlipNumber ?? prev.jobSlipNumber,
      managerId: currentUser?.id ?? prev.managerId,
      orderDate: jobSlip.orderDate ? parseISO(jobSlip.orderDate) : prev.orderDate,
      fabricatorId: jobSlip.fabricatorId ?? prev.fabricatorId,
      fabricatorName: jobSlip.fabricatorName ?? prev.fabricatorName,
      dueDate: jobSlip.dueDate ? parseISO(jobSlip.dueDate) : prev.dueDate,
      isSampleGiven: !!jobSlip.isSampleGiven,
      clothId: jobSlip.clothId ?? prev.clothId,
      clothName: jobSlip.clothName ?? prev.clothName,
      totalMeter: jobSlip.totalMeter ?? prev.totalMeter,
      price: jobSlip.price ?? prev.price,
      designId: jobSlip.designId ?? prev.designId,
      designName: jobSlip.designName ?? prev.designName,
      average: jobSlip.average ?? prev.average,
      fabrication: jobSlip.fabrication ?? prev.fabrication,
      costing: jobSlip.costing ?? prev.costing,
      isBestSeller: !!jobSlip.isBestSeller,
    }));

    // set selectedPO if jobSlip has POnumber
    if (jobSlip.POnumber) {
      setSelectedPO({ POnumber: jobSlip.POnumber, id: jobSlip.poId ?? null });
    }
  }, [jobSlip, currentUser]);

  // Fetch expenses list for combobox
  async function fetchExpenses() {
    if (!currentUser?.id) return;
    try {
      const res = await fetch(`/api/expenses?managerId=${currentUser.id}`);
      if (!res.ok) throw new Error("Failed to fetch expenses");
      const data = await res.json();
      const formatted = data.map((exp) => ({ value: exp.id, label: exp.expenseName }));
      setExpensesOptions(formatted);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    }
  }

  // Add a new expense option
  async function handleAddNewExpense(name) {
    if (!name || !currentUser?.id) return;
    try {
      setExpenseSaving(true);
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseName: name, managerId: currentUser.id }),
      });
      if (!res.ok) throw new Error("Failed to create expense");
      const newExpense = await res.json();
      const formatted = { value: newExpense.id, label: newExpense.expenseName };
      setExpensesOptions((p) => [...p, formatted]);
      // auto-select newly created expense
      setSelectedExpenses((prev) => [...prev, { ...formatted, amount: "" }]);
      setExpenseComboOpen(false);
    } catch (err) {
      console.error("Error adding expense:", err);
      toast.error("Failed to add expense");
    } finally {
      setExpenseSaving(false);
    }
  }

  // Combobox add expense handler
  const handleAddExpense = (value) => {
    const found = expensesOptions.find((e) => e.value === value);
    if (!found) return;
    if (selectedExpenses.some((s) => s.value === found.value)) return;
    setSelectedExpenses((prev) => [...prev, { ...found, amount: "" }]);
  };

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
  // submit handler — convert to PUT (edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) {
      toast.error("User not loaded");
      return;
    }

    try {
      setSaving(true);

      let payload = {
        jobSlipNumber: form.jobSlipNumber,
        managerId: currentUser.id,
        orderDate: form.orderDate ? form.orderDate.toISOString() : null,
        fabricatorId: form.fabricatorId,
        fabricatorName: form.fabricatorName,
        dueDate: form.dueDate ? form.dueDate.toISOString() : null,
        isSampleGiven: !!form.isSampleGiven,
        clothId: form.clothId,
        clothName: form.clothName,
        totalMeter: Number(form.totalMeter) || 0,
        price: Number(form.price) || 0,
        designId: form.designId,
        designName: form.designName,
        average: Number(form.average) || 0,
        fabrication: Number(form.fabrication) || 0,
        costing: Number(form.costing) || 0,
        isBestSeller: !!form.isBestSeller,
        expenses: selectedExpenses.map((s) => ({
  value: s.value,
  label: s.label,
  amount: s.amount,
})),

        isEditForm: true,
      };

      if (!payload.fabricatorId && payload.fabricatorName) {
        const newFab = await addFabricator(payload.fabricatorName);
        payload.fabricatorId = newFab?.id ?? payload.fabricatorId;
      }
      if (!payload.clothId && payload.clothName) {
        const newCloth = await addCloth(payload.clothName);
        payload.clothId = newCloth?.id ?? payload.clothId;
      }
      if (!payload.designId && payload.designName) {
        const newDesign = await addDesign(payload.designName);
        payload.designId = newDesign?.id ?? payload.designId;
      }

      const res = await fetch("/api/jobOrder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server Error: ${res.status} ${text}`);
      }

      const data = await res.json();

      toast.success("Job Slip updated successfully ✅");
      setOpen(false);
      mutate(`/api/fabricators?managerId=${managerId}`);
      mutate(`/api/designs?managerId=${managerId}`);

      if (onSuccess) onSuccess(data);
    } catch (err) {
      console.error("❌ Error submitting job slip:", err);
      toast.error("Error updating job slip");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[650px] w-[95%]">
        <ScrollArea className="h-[85vh] pr-4">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Job Order</DialogTitle>
              <DialogDescription>
                Update the job order details and click <b>Save changes</b>.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Job Slip ID */}
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="jobslipid">Job Slip No.</Label>
                  <Input
                    id="jobslipid"
                    name="jobslipid"
                    className="w-full"
                    value={form.jobSlipNumber}
                    disabled
                    onChange={(e) => setForm({ ...form, jobSlipNumber: e.target.value })}
                  />
                </div>

                {/* Job Date */}
                <div className="flex flex-col space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!form.orderDate ? "text-muted-foreground" : ""}`}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.orderDate ? format(form.orderDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.orderDate}
                        onSelect={(v) => setForm({ ...form, orderDate: v })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Fabricator Dropdown */}
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="fabricator">Fabricator</Label>
                  <Popover open={fabOpen} onOpenChange={setFabOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={fabOpen} className="w-full justify-between" disabled>
                        {form.fabricatorName ? form.fabricatorName : <span className="text-muted-foreground">Select...</span>}
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search fabricator..."
                          onValueChange={(v) => setForm({ ...form, fabricatorName: v })}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <div className="flex flex-col items-center gap-2 py-3">
                              <p className="text-sm text-muted-foreground">No fabricator found.</p>
                              <Button variant="outline" size="sm" onClick={async () => { if (!form.fabricatorName) return; 
                                setFabOpen(false); }}>
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
                                onSelect={() => {
                                  setForm({ ...form, fabricatorName: f.name, fabricatorId: f.id });
                                  setFabOpen(false);
                                }}
                              >
                                <CheckIcon className={`mr-2 h-4 w-4 ${form.fabricatorName === f.name ? "opacity-100" : "opacity-0"}`} />
                                {f.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Due Date Picker */}
                <div className="flex flex-col space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={`w-full justify-start text-left font-normal ${!form.dueDate ? "text-muted-foreground" : ""}`}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.dueDate ? format(form.dueDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={form.dueDate} onSelect={(v) => setForm({ ...form, dueDate: v })} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <Toggle pressed={form.isSampleGiven} onPressedChange={(p) => setForm({ ...form, isSampleGiven: p })} className={`cursor-pointer border border-slate-300 transition-all hover:bg-blue-50 hover:text-blue-600 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600 data-[state=on]:border-blue-300 data-[state=on]:*:[svg]:stroke-blue-600 data-[state=on]:*:[svg]:fill-blue-600`}>
                  <Shirt className="w-4 h-4 transition-all duration-200" />
                  <span className="font-medium">Sample Given</span>
                </Toggle>
              </div>

              {/* Material details */}
              <Accordion type="multiple" className="w-full" defaultValue={["shirtdetails"]}>
                <AccordionItem value="materialdetails" className="border border-gray-200 rounded-xl shadow-sm bg-white my-2">
                  <AccordionTrigger className="text-md font-semibold px-4 py-2 text-gray-800 cursor-pointer hover:text-indigo-700">Material Details</AccordionTrigger>

                  <AccordionContent className="p-4 text-gray-600 bg-gray-50 rounded-b-xl">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Cloth Name */}
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="clothname">Cloth Name</Label>
                        <Popover open={clothOpen} onOpenChange={setClothOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={clothOpen} className="w-full justify-between" disabled>
                              {form.clothName ? form.clothName : <span className="text-muted-foreground">Select...</span>}
                              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search cloth..." onValueChange={(v) => setForm({ ...form, clothName: v })} />
                              <CommandList>
                                <CommandEmpty>
                                  <div className="flex flex-col items-center gap-2 py-3">
                                    <p className="text-sm text-muted-foreground">No cloth found.</p>
                                    <Button variant="outline" size="sm" 
                                    onClick={async () => { 
                                      if (!form.clothName) return;  setClothOpen(false); }}>
                                      <CirclePlus className="w-4 h-4 mr-1" />
                                      Add “{form.clothName}”
                                    </Button>
                                  </div>
                                </CommandEmpty>
                                <CommandGroup>
                                  {cloths.map((c) => (
                                    <CommandItem key={c.id} value={c.name} onSelect={() => { setForm({ ...form, clothName: c.name, clothId: c.id }); setClothOpen(false); }}>
                                      <CheckIcon className={`mr-2 h-4 w-4 ${form.clothName === c.name ? "opacity-100" : "opacity-0"}`} />
                                      {c.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Purchase Order (Dynamic based on Cloth Name) */}
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="po">Purchase Order</Label>
                        <Popover open={false} onOpenChange={() => {}}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" disabled className={`w-full justify-between ${!form.clothName ? "cursor-not-allowed opacity-60" : ""}`}>
                              {selectedPO ? (
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">{selectedPO.POnumber}</span>
                                  <span className="text-xs text-muted-foreground">{selectedPO.designName} • {selectedPO.fabricator}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">{form.clothName ? "Selected PO (read-only)" : "Select cloth first"}</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                        </Popover>
                      </div>

                      {/* Total meter */}
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="totmeter">Total Meter</Label>
                        <Input id="totmeter" name="totmeter" placeholder="Enter total meter..." className="w-full" value={form.totalMeter} onChange={(e) => setForm({ ...form, totalMeter: e.target.value })} />
                      </div>

                      {/* Total price */}
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="totprice">Price</Label>
                        <Input id="totprice" name="totprice" placeholder="Enter price..." className="w-full" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Shirt Details */}
                <AccordionItem value="shirtdetails" className="border border-gray-200 rounded-xl shadow-sm bg-white my-2">
                  <AccordionTrigger className="text-md font-semibold px-4 py-2 text-gray-800 cursor-pointer hover:text-indigo-700">Shirt Details</AccordionTrigger>
                  <AccordionContent className="p-4 text-gray-600 bg-gray-50 rounded-b-xl">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* design Name */}
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="designname">Design</Label>
                        <Popover open={designOpen} onOpenChange={setDesignOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={designOpen} className="w-full justify-between" disabled>
                              {form.designName ? form.designName : <span className="text-muted-foreground">Select...</span>}
                              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search design..." onValueChange={(v) => setForm({ ...form, designName: v })} />
                              <CommandList>
                                <CommandEmpty>
                                  <div className="flex flex-col items-center gap-2 py-3">
                                    <p className="text-sm text-muted-foreground">No design found.</p>
                                    <Button variant="outline" size="sm" onClick={async () => { if (!form.designName) return; setDesignOpen(false); }}>
                                      <CirclePlus className="w-4 h-4 mr-1" />
                                      Add “{form.designName}”
                                    </Button>
                                  </div>
                                </CommandEmpty>
                                <CommandGroup>
                                  {designs.map((c) => (
                                    <CommandItem key={c.id} value={c.name} onSelect={() => { setForm({ ...form, designName: c.name, designId: c.id }); setDesignOpen(false); }}>
                                      <CheckIcon className={`mr-2 h-4 w-4 ${form.designName === c.name ? "opacity-100" : "opacity-0"}`} />
                                      {c.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* average */}
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="average">Average</Label>
                        <Input id="average" name="average" 
                        value={form.average} 
                        onChange={(e) => setForm({ ...form, average: e.target.value })} placeholder="Enter average..." className="w-full" />
                      </div>

                      {/* fabrication */}
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="fabrication">Fabrication</Label>
                        <Input id="fabrication" name="fabrication"    
                        value={form.fabrication}
                         onChange={(e) => setForm({ ...form, fabrication: e.target.value })} placeholder="Enter fabrication..." className="w-full" />
                      </div>

                      {/* --- EXPENSES SECTION --- */}
                      <div className="flex flex-col space-y-2">
                        <Label>Expenses</Label>

                        <Dialog open={expenseOpen} onOpenChange={(isOpen) => { setExpenseOpen(isOpen); if (isOpen && expensesOptions.length === 0) fetchExpenses(); }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2 text-sm">Click here</Button>
                          </DialogTrigger>

                          <DialogContent className="sm:max-w-[450px] rounded-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-semibold">Enter Expenses</DialogTitle>
                            </DialogHeader>

                            <Separator className="my-2" />

                            <ScrollArea className="max-h-[300px] pr-2">
                              {/* Combobox + Add Button */}
                              <div className="flex items-center gap-2 mb-4 border-2 p-2 rounded-lg">
                                <Label htmlFor="expense-select" className="min-w-[90px]">Add</Label>

                                <div className="flex-1">
                                  <Popover open={expenseComboOpen} onOpenChange={setExpenseComboOpen}>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" className="w-full justify-between text-left font-normal">{"-- Select expense --"}<ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-full p-0">
                                      <Command>
                                        <CommandInput placeholder="Search or add expense..." />
                                        <CommandList>
                                          <CommandEmpty>
                                            <div className="flex flex-col items-center gap-2 py-3">
                                              <p className="text-sm text-muted-foreground">No expense found.</p>
                                              {expenseSaving ? <Button variant={"outline"} size="sm" disabled>Adding...</Button> : <Button variant="outline" size="sm" onClick={async () => { const name = prompt("Expense name"); if (!name) return; await handleAddNewExpense(name); }}> <CirclePlus className="w-4 h-4 mr-1" /> Add</Button>}
                                            </div>
                                          </CommandEmpty>

                                          <CommandGroup>
                                            {expensesOptions.filter((ex) => !selectedExpenses.some((s) => s.value === ex.value)).map((ex) => (
                                              <CommandItem key={ex.value} value={ex.value} onSelect={() => { handleAddExpense(ex.value); setExpenseComboOpen(false); }}>
                                                <CheckIcon className={`mr-2 h-4 w-4 ${false ? "opacity-100" : "opacity-0"}`} />
                                                {ex.label}
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                <Button variant="outline" onClick={() => { const name = prompt("Expense name"); if (!name) return; handleAddNewExpense(name); }}>Add</Button>
                              </div>

                              {/* List of added expenses */}
                              {selectedExpenses.length === 0 && (
                                <p className="text-sm text-muted-foreground">No expenses added yet. Select one above to add.</p>
                              )}

                              <div className="space-y-3">
                                {selectedExpenses.map((se, idx) => (
                                  <div key={se.value} className="flex items-center gap-2">
                                    <div className="w-1/2">
                                      <Label className="text-sm">{se.label}</Label>
                                    </div>
                                    <div className="flex-1">
                                      <Input type="number" placeholder="Enter amount" value={se.amount} onChange={(e) => handleAmountChange(idx, e.target.value)} />
                                    </div>
                                    <div>
                                      <Button variant="outline" onClick={() => handleRemoveExpense(idx)}>Remove</Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>

                            <DialogFooter className="mt-3">
                              <DialogClose asChild>
                                <Button variant="outline">Close</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* costing */}
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="costing">Costing</Label>
                        <Input id="costing" name="costing" 
                        value={form.costing} 
                        onChange={(e) => setForm({ ...form, costing: e.target.value })} placeholder="Enter costing..." className="w-full" />
                      </div>
                    </div>

                    <Toggle pressed={form.isBestSeller} onPressedChange={(p) => setForm({ ...form, isBestSeller: p })} className=" data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-yellow-500 data-[state=on]:*:[svg]:stroke-yellow-500 cursor-pointer mt-2">
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
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => 
                { setForm(initialForm); setSelectedExpenses((jobSlip.expenses || []).map((e) => ({ value: e.id ?? e.value, label: e.expenseName ?? e.label ?? String(e.id || e.value), amount: e.amount ?? "" })) )
                }
                }>
                  Cancel
                </Button>
              </DialogClose>

              {saving ? (
                <Button type="submit" className="w-full sm:w-auto" disabled>Saving...</Button>
              ) : (
                <Button type="submit" className="w-full sm:w-auto">Save changes</Button>
              )}
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
