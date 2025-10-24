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
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";

const fabricators = [
  { id: 1, name: "Fabricator 1", total: 100, dispatched: 80, pending: 20 },
  { id: 2, name: "Fabricator 2", total: 200, dispatched: 150, pending: 50 },
  { id: 3, name: "Fabricator 3", total: 300, dispatched: 250, pending: 50 },
  { id: 4, name: "Fabricator 4", total: 400, dispatched: 350, pending: 50 },
];
export const expenses = [
  { value: "washing", label: "Washing" },
  { value: "kadhai", label: "Kadhai" },
  { value: "pasting", label: "Pasting" },
  { value: "button", label: "Button" },
  { value: "design", label: "Design" },
  { value: "print", label: "Print" },
  { value: "id", label: "ID" },
  { value: "double-pocket", label: "Double Pocket" },
  { value: "others", label: "Others" },
];

const cloths = [
  { id: 1, name: "Cloth A" },
  { id: 2, name: "Cloth B" },
  { id: 3, name: "Cloth C" },
  { id: 4, name: "Cloth D" },
];

const designs = [
  { id: 1, name: "Design X" },
  { id: 2, name: "Design Y" },
  { id: 3, name: "Design Z" },
  { id: 4, name: "Design W" },
];

export function AddJobOrderForm({ fabricatorId, managerId }) {
  const [date, setDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [fabricator, setFabricator] = useState("");
  const [manager] = useState(managerId || "");
  const [fabOpen, setFabOpen] = useState(false);
  const [clothName, setClothName] = useState("");
  const [clothOpen, setClothOpen] = useState(false);
  const [designName, setDesignName] = useState("");
  const [designOpen, setDesignOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseValues, setExpenseValues] = useState(expenses.map(() => ""));

  const handleExpenseChange = (index, value) => {
    const updated = [...expenseValues];
    updated[index] = value;
    setExpenseValues(updated);
  };

  // ✅ Preselect fabricator if ID is passed via props
  useEffect(() => {
    if (fabricatorId) {
      const found = fabricators.find((f) => f.id === Number(fabricatorId));
      if (found) setFabricator(found.name);
    }
  }, [fabricatorId]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CirclePlus className="h-5 w-5" />
          Create Job Order
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[650px] w-[95%]">
        <form className="space-y-6">
          <DialogHeader>
            <DialogTitle>Add Job Order</DialogTitle>
            <DialogDescription>
              Fill in the required information below. Click <b>Save changes</b>{" "}
              when done.
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
                        <span className="text-muted-foreground">Select...</span>
                      )}
                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search fabricator..." />
                      <CommandList>
                        <CommandEmpty>No fabricator found.</CommandEmpty>
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

              <div className="flex space-x-2">
                <Checkbox />
                <Label>Is sample given?</Label>
              </div>
            </div>
            {/* Material details */}
            <Accordion type="multiple" className="w-full">
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

                    {/* Total meter */}
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="totmeter">Total Meter</Label>
                      <Input
                        id="totmeter"
                        name="totmeter"
                        placeholder="Enter total meter..."
                        className="w-full"
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
                      <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex items-center gap-2 text-sm"
                          >
                            Click here
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[400px] rounded-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-lg font-semibold">
                              Enter Expenses
                            </DialogTitle>
                          </DialogHeader>

                          <Separator className="my-2" />

                          <ScrollArea className="max-h-[300px] pr-2">
                            {expenses.map((expense, index) => (
                              <div key={index} className="space-y-1 mb-3">
                                <Label
                                  htmlFor={`expense-${index}`}
                                  className="text-sm"
                                >
                                  {expense.label}
                                </Label>
                                <Input
                                  id={`expense-${index}`}
                                  type="number"
                                  value={expenseValues[index]}
                                  onChange={(e) =>
                                    handleExpenseChange(index, e.target.value)
                                  }
                                  placeholder="Enter amount"
                                />
                              </div>
                            ))}
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
      </DialogContent>
    </Dialog>
  );
}
