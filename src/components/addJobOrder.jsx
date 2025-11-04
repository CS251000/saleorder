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
import { format } from "date-fns";
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

const purchaseOrders = [
  {
    POnumber: "PO-001",
    id: 1,
    orderDate: "2024-01-15",
    agent: "Agent A",
    mill: "Mill X",
    clothName: "Cloth A",
    purchaseRate: "50",
    designName: "Design X",
    fabricator: "Fabricator 1",
    quantity: "100",
    dueDate: "2024-02-15",
  },
  {
    POnumber: "PO-002",
    id: 2,
    orderDate: "2024-01-16",
    agent: "Agent B",
    mill: "Mill Y",
    clothName: "Cloth B",
    purchaseRate: "60",
    quantity: "200",
    dueDate: "2024-02-16",
  },
  {
    POnumber: "PO-003",
    id: 3,
    orderDate: "2024-01-17",
    agent: "Agent C",
    mill: "Mill Z",
    clothName: "Cloth A",
    designName: "Design Y",
    fabricator: "Fabricator 2",
    purchaseRate: "70",
    quantity: "300",
    dueDate: "2024-02-17",
  },
];

export function AddJobOrderForm({ fabricatorId, designId,onSuccess }) {
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
  const [expenseSaving,setExpenseSaving]= useState(false);

  const [saving, setSaving] = useState(false);

  const { currentUser } = useGlobalUser();
  const initialFormState = {
  jobSlipNumber: "",
  managerId: currentUser.id,
  orderDate: new Date(),
  fabricatorId: null,
  fabricatorName: "",
  dueDate: null,
  isSampleGiven: false,
  clothId: null,
  clothName: "",
  totalMeter: 0.0,
  price: 0.0,
  designId: null,
  designName: "",
  average: 0.0,
  fabrication: 0.0,
  costing: 0.0,
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
    // prevent duplicate
    if (selectedExpenses.some((s) => s.value === found.value)) return;
    setSelectedExpenses((prev) => [...prev, { ...found, amount: "" }]);
    setExpenseToAdd("");
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
        body: JSON.stringify({ expenseName:name, managerId: currentUser.id }),
      });
      const newExpense = await res.json();
      const formatted = { value: newExpense.id, label: newExpense.expenseName };
      setExpenses((prev) => [...prev, formatted]);
      setExpenseToAdd(formatted.value);
      setExpenseComboOpen(false);
    } catch (err) {
      console.error("Error adding expense:", err);
    }finally{
      setExpenseSaving(false);
    }
  }

  const handleCancel=()=>{
    setForm({...initialFormState,managerId:currentUser.id});
    setSelectedExpenses([]);
  }
  


  


  // ✅ Preselect fabricator if ID is passed via props
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
        isBestSeller,
        expenses:selectedExpenses
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
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      toast.success("Job Slip created successfully ✅");
      setForm(initialFormState);
      setSelectedExpenses([]);

      if(onSuccess){
        onSuccess();
      }

    } catch (error) {
      console.error("❌ Error submitting job slip:", error);
      toast.error("Error creating job slip");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CirclePlus className="h-5 w-5" />
          Job Order
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[650px] w-[95%]">
        <ScrollArea className="h-[85vh] pr-4">
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
              <div className="grid grid-cols-2 gap-4">
                {/* Job Slip ID */}
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="jobslipid">Job Slip No.</Label>
                  <Input
                    id="jobslipid"
                    name="jobslipid"
                    placeholder="Enter job slip..."
                    // defaultValue="JobSlip123"
                    className="w-full"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        jobSlipNumber: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Job Date */}
                <div className="flex flex-col space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !form.orderDate ? "text-muted-foreground" : ""
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.orderDate ? (
                          format(form.orderDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
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
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={fabOpen}
                        className="w-full justify-between"
                      >
                        {form.fabricatorName ? (
                          form.fabricatorName
                        ) : (
                          <span className="text-muted-foreground">
                            Select...
                          </span>
                        )}
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search fabricator..."
                          onValueChange={(v) =>
                            setForm({
                              ...form,
                              fabricatorName: v,
                            })
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
                                onClick={async () => {
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
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !form.dueDate ? "text-muted-foreground" : ""
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.dueDate ? (
                          format(form.dueDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.dueDate}
                        onSelect={(v) => setForm({ ...form, dueDate: v })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Toggle
                  pressed={form.isSampleGiven}
                  onPressedChange={(p) =>
                    setForm({ ...form, isSampleGiven: p })
                  }
                  className={`cursor-pointer
    border border-slate-300 transition-all
    hover:bg-blue-50 hover:text-blue-600
    data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600
    data-[state=on]:border-blue-300
    data-[state=on]:*:[svg]:stroke-blue-600 data-[state=on]:*:[svg]:fill-blue-600
  `}
                >
                  <Shirt className="w-4 h-4 transition-all duration-200" />
                  <span className="font-medium">Sample Given</span>
                </Toggle>
              </div>
              {/* Material details */}
              <Accordion
                type="multiple"
                className="w-full"
                defaultValue={["shirtdetails"]}
              >
                {/* Material Details */}
                <AccordionItem
                  value="materialdetails"
                  className="border border-gray-200 rounded-xl shadow-sm bg-white my-2"
                >
                  <AccordionTrigger className="text-md font-semibold px-4 py-2 text-gray-800 cursor-pointer hover:text-indigo-700">
                    Material Details
                  </AccordionTrigger>

                  <AccordionContent className="p-4 text-gray-600 bg-gray-50 rounded-b-xl">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Cloth Name */}
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="clothname">Cloth Name</Label>
                        <Popover open={clothOpen} onOpenChange={setClothOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={clothOpen}
                              className="w-full justify-between"
                            >
                              {form.clothName ? (
                                form.clothName
                              ) : (
                                <span className="text-muted-foreground">
                                  Select...
                                </span>
                              )}
                              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search cloth..."
                                onValueChange={(v) =>
                                  setForm({
                                    ...form,
                                    clothName: v,
                                  })
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
                                      onClick={async () => {
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
                        <Popover open={poOpen} onOpenChange={setPoOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={poOpen}
                              disabled={!form.clothName} // disable until cloth selected
                              className={`w-full justify-between ${
                                !form.clothName
                                  ? "cursor-not-allowed opacity-60"
                                  : ""
                              }`}
                            >
                              {selectedPO ? (
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">
                                    {selectedPO.POnumber}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {selectedPO.designName} •{" "}
                                    {selectedPO.fabricator}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  {form.clothName
                                    ? "Select purchase order..."
                                    : "Select cloth first"}
                                </span>
                              )}
                              <ChevronsUpDownIcon className=" h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent className="w-[350px] p-0">
                            <Command>
                              <CommandInput placeholder="Search purchase order..." />
                              <CommandList>
                                <CommandEmpty>
                                  No purchase order found.
                                </CommandEmpty>
                                <CommandGroup>
                                  {purchaseOrders
                                    .filter(
                                      (po) => po.clothName === form.clothName
                                    )
                                    .map((po) => (
                                      <CommandItem
                                        key={po.id}
                                        value={po.POnumber}
                                        onSelect={() => {
                                          setSelectedPO(po);
                                          setPoOpen(false);
                                          setTotalMeter(po.quantity);
                                          setTotalPrice(po.purchaseRate);
                                        }}
                                      >
                                        <div className="flex flex-col cursor-pointer">
                                          <span className="font-medium">
                                            {po.POnumber}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {po.designName} • {po.fabricator}
                                          </span>
                                          <span className="text-xs text-gray-500">
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

                      {/* Total meter */}
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="totmeter">Total Meter</Label>
                        <Input
                          id="totmeter"
                          name="totmeter"
                          placeholder="Enter total meter..."
                          className="w-full"
                          value={form.totalMeter}
                          onChange={(e) =>
                            setForm({ ...form, totalMeter: e.target.value })
                          }
                        />
                      </div>

                      {/* Total price */}
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="totprice">Price</Label>
                        <Input
                          id="totprice"
                          name="totprice"
                          placeholder="Enter price..."
                          className="w-full"
                          value={form.price}
                          onChange={(e) =>
                            setForm({ ...form, price: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Shirt Details */}
                <AccordionItem
                  value="shirtdetails"
                  className="border border-gray-200 rounded-xl shadow-sm bg-white my-2"
                >
                  <AccordionTrigger className="text-md font-semibold px-4 py-2 text-gray-800 cursor-pointer hover:text-indigo-700">
                    Shirt Details
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-gray-600 bg-gray-50 rounded-b-xl">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* design Name */}
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="designname">Design</Label>
                        <Popover open={designOpen} onOpenChange={setDesignOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={designOpen}
                              className="w-full justify-between"
                            >
                              {form.designName ? (
                                form.designName
                              ) : (
                                <span className="text-muted-foreground">
                                  Select...
                                </span>
                              )}
                              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search design..."
                                onValueChange={(v) =>
                                  setForm({
                                    ...form,
                                    designName: v,
                                  })
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
                                      onClick={async () => {
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
                                  {designs.map((c) => (
                                    <CommandItem
                                      key={c.id}
                                      value={c.name}
                                      onSelect={() => {
                                        setForm({
                                          ...form,
                                          designName: c.name,
                                          designId: c.id,
                                        });
                                        setDesignOpen(false);
                                      }}
                                    >
                                      <CheckIcon
                                        className={`mr-2 h-4 w-4 ${
                                          form.designName === c.name
                                            ? "opacity-100"
                                            : "opacity-0"
                                        }`}
                                      />
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
                        <Input
                          id="average"
                          name="average"
                          value={form.average}
                          onChange={(e) =>
                            setForm({ ...form, average: e.target.value })
                          }
                          placeholder="Enter average..."
                          className="w-full"
                        />
                      </div>
                      {/* fabrication */}
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="fabrication">Fabrication</Label>
                        <Input
                          id="fabrication"
                          name="fabrication"
                          value={form.fabrication}
                          onChange={(e) =>
                            setForm({ ...form, fabrication: e.target.value })
                          }
                          placeholder="Enter fabrication..."
                          className="w-full"
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
                                          expenses.find(
                                            (e) => e.value === expenseToAdd
                                          )?.label
                                        ) : (
                                          <span className="text-muted-foreground">
                                            -- Select expense --
                                          </span>
                                        )}
                                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                                              {expenseSaving?<Button variant={"outline"} size="sm" disabled>Adding...</Button>:
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
                                                <CirclePlus className="w-4 h-4 mr-1" />
                                                Add “{expenseToAdd}”
                                              </Button>}
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
                                                  value={ex.value}
                                                  onSelect={(currentValue) => {
                                                    setExpenseToAdd(
                                                      currentValue ===
                                                        expenseToAdd
                                                        ? ""
                                                        : currentValue
                                                    );
                                                    setExpenseComboOpen(false);
                                                  }}
                                                >
                                                  <CheckIcon
                                                    className={`mr-2 h-4 w-4 ${
                                                      expenseToAdd === ex.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                    }`}
                                                  />
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

                      {/* costing */}
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="costing">Costing</Label>
                        <Input
                          id="costing"
                          name="costing"
                          value={form.costing}
                          onChange={(e) =>
                            setForm({ ...form, costing: e.target.value })
                          }
                          placeholder="Enter costing..."
                          className="w-full"
                        />
                      </div>
                    </div>
                    <Toggle
                      pressed={form.isBestSeller}
                      onPressedChange={(p) =>
                        setForm({ ...form, isBestSeller: p })
                      }
                      className=" data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-yellow-500 data-[state=on]:*:[svg]:stroke-yellow-500 cursor-pointer mt-2"
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
                <Button variant="outline" className="w-full sm:w-auto" onClick={handleCancel}>
                  Cancel
                </Button>
              </DialogClose>
              {saving ? (
                <Button type="submit" className="w-full sm:w-auto" disabled>
                  Saving...
                </Button>
              ) : (
                <Button type="submit" className="w-full sm:w-auto">
                  Save changes
                </Button>
              )}
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
