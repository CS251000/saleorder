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

export function AddJobOrderForm({ fabricatorId, designId }) {
  const [date, setDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [fabricator, setFabricator] = useState("");
  const [fabOpen, setFabOpen] = useState(false);
  const [clothName, setClothName] = useState("");
  const [clothOpen, setClothOpen] = useState(false);
  const [designName, setDesignName] = useState("");
  const [designOpen, setDesignOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseComboOpen, setExpenseComboOpen] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [expenseToAdd, setExpenseToAdd] = useState("");
  const [poOpen, setPoOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [totalMeter, setTotalMeter] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

  const [fabSearchTerm,setFabSearchTerm]= useState("");

  const { fabricators, addFabricator, expenses, designs, cloths,loading } =
    useProdManager();

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

  // ✅ Preselect fabricator if ID is passed via props
  useEffect(() => {
    if (fabricatorId) {
      const found = fabricators.find((f) => f.id === Number(fabricatorId));
      if (found) setFabricator(found.name);
    }
    if (designId) {
      const foundDesign = designs.find((d) => d.id === Number(designId));
      if (foundDesign) setDesignName(foundDesign.name);
    }
  }, [fabricatorId, designId]);

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
          <form className="space-y-6">
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
                          !date ? "text-muted-foreground" : ""
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
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
                        {fabricator ? (
                          fabricator
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
                        <CommandInput placeholder="Search fabricator..." onValueChange={(t)=>setFabSearchTerm(t)}/>
                        <CommandList>
                          <CommandEmpty>
                            <div className="flex flex-col items-center gap-2 py-3">
                              <p className="text-sm text-muted-foreground">
                                No fabricator found.
                              </p>
                              {loading?<Button variant={"outline"}
                              size="sm" disabled>
                                Adding
                                </Button>:<Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  if (!fabSearchTerm) return;
                                  if(!fabSearchTerm.trim())return;
                                  await addFabricator(fabSearchTerm);
                                  setFabricator(fabSearchTerm);
                                  setFabOpen(false);
                                }}
                              >
                                <CirclePlus className="w-4 h-4 mr-1" />
                                Add “
                                {fabSearchTerm}
                                ”
                              </Button>}
                              
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {fabricators.map((f) => (
                              <CommandItem
                                key={f.id}
                                value={f.name}
                                onSelect={(currentValue) => {
                                  setFabricator(
                                    currentValue === fabricator
                                      ? ""
                                      : currentValue
                                  );
                                  setFabOpen(false);
                                }}
                              >
                                <CheckIcon
                                  className={`mr-2 h-4 w-4 ${
                                    fabricator === f.name
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
                          !dueDate ? "text-muted-foreground" : ""
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? (
                          format(dueDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Toggle
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
                              {clothName ? (
                                clothName
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
                              <CommandInput placeholder="Search cloth name..." />
                              <CommandList>
                                <CommandEmpty>No cloth found.</CommandEmpty>
                                <CommandGroup>
                                  {cloths.map((c) => (
                                    <CommandItem
                                      key={c.id}
                                      value={c.name}
                                      onSelect={(currentValue) => {
                                        setClothName(
                                          currentValue === clothName
                                            ? ""
                                            : currentValue
                                        );
                                        setClothOpen(false);
                                        setSelectedPO(null); // reset PO when cloth changes
                                      }}
                                    >
                                      <CheckIcon
                                        className={`mr-2 h-4 w-4 ${
                                          clothName === c.name
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
                              disabled={!clothName} // disable until cloth selected
                              className={`w-full justify-between ${
                                !clothName
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
                                  {clothName
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
                                    .filter((po) => po.clothName === clothName)
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
                          value={totalMeter}
                          onChange={(e) => setTotalMeter(e.target.value)}
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
                          value={totalPrice}
                          onChange={(e) => setTotalPrice(e.target.value)}
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
                        <Label htmlFor="designname">Design Name</Label>
                        <Popover open={designOpen} onOpenChange={setDesignOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={designOpen}
                              className="w-full justify-between"
                            >
                              {designName ? (
                                designName
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
                              <CommandInput placeholder="Search cloth name..." />
                              <CommandList>
                                <CommandEmpty>No design found.</CommandEmpty>
                                <CommandGroup>
                                  {designs.map((c) => (
                                    <CommandItem
                                      key={c.id}
                                      value={c.name}
                                      onSelect={(currentValue) => {
                                        setDesignName(
                                          currentValue === designName
                                            ? ""
                                            : currentValue
                                        );
                                        setDesignOpen(false);
                                      }}
                                    >
                                      <CheckIcon
                                        className={`mr-2 h-4 w-4 ${
                                          designName === c.name
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

                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="average">Average</Label>
                        <Input
                          id="average"
                          name="average"
                          placeholder="Enter average..."
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="fabrication">Fabrication</Label>
                        <Input
                          id="fabrication"
                          name="fabrication"
                          placeholder="Enter fabrication..."
                          className="w-full"
                        />
                      </div>
                      {/* EXPENSES */}
                      <div className="flex flex-col space-y-2">
                        <Label>Expenses</Label>
                        <Dialog
                          open={expenseOpen}
                          onOpenChange={setExpenseOpen}
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
                              {/* Replace the select with this combobox */}
                              <div className="flex items-center gap-2 mb-4 border-2 p-2 rounded-lg">
                                <Label
                                  htmlFor="expense-select"
                                  className="min-w-[90px]"
                                >
                                  Add
                                </Label>

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
                                        <CommandInput placeholder="Search expenses..." />
                                        <CommandList>
                                          <CommandEmpty>
                                            No expense found.
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
                                                    // toggle selection in the combobox (but not adding to selectedExpenses yet)
                                                    setExpenseToAdd(
                                                      currentValue ===
                                                        expenseToAdd
                                                        ? ""
                                                        : currentValue
                                                    );
                                                    setExpenseComboOpen(false); // close popover after pick
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

                              {/* List of added expenses with amount inputs */}
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
                              <Button>Save</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="costing">Costing</Label>
                        <Input
                          id="costing"
                          name="costing"
                          placeholder="Enter costing..."
                          className="w-full"
                        />
                      </div>
                    </div>
                    <Toggle className=" data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-yellow-500 data-[state=on]:*:[svg]:stroke-yellow-500 cursor-pointer mt-2">
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
                <Button variant="outline" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="w-full sm:w-auto">
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
