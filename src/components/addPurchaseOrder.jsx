"use client";

import { useState } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { ScrollArea } from "./ui/scroll-area";

// Dummy Data
const agents = [
  { id: 1, name: "Agent A" },
  { id: 2, name: "Agent B" },
  { id: 3, name: "Agent C" },
];
const mills = [
  { id: 1, name: "Mill X" },
  { id: 2, name: "Mill Y" },
  { id: 3, name: "Mill Z" },
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
const fabricators = [
  { id: 1, name: "Fabricator 1", total: 100, dispatched: 80, pending: 20 },
  { id: 2, name: "Fabricator 2", total: 200, dispatched: 150, pending: 50 },
  { id: 3, name: "Fabricator 3", total: 300, dispatched: 250, pending: 50 },
  { id: 4, name: "Fabricator 4", total: 400, dispatched: 350, pending: 50 },
];

export function AddPurchaseOrderForm() {
  // First part states
  const [POnumber, setPOnumber] = useState("");
  const [date, setDate] = useState(null);
  const [agentOpen, setAgentOpen] = useState(false);
  const [agent, setAgent] = useState("");
  const [millOpen, setMillOpen] = useState(false);
  const [mill, setMill] = useState("");
  const [clothName, setClothName] = useState("");
  const [clothOpen, setClothOpen] = useState(false);
  const [designName, setDesignName] = useState("");
  const [designOpen, setDesignOpen] = useState(false);
  const [fabricator, setFabricator] = useState("");
  const [fabOpen, setFabOpen] = useState(false);
  // Second part states
  const [purchaseRate, setPurchaseRate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [dueDate, setDueDate] = useState(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CirclePlus className="h-5 w-5" />
          Purchase Order
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] w-[95%] rounded-xl">
        <ScrollArea className="h-[80vh] pr-3">
          <form className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Add Purchase Order
              </DialogTitle>
              <DialogDescription className="text-sm">
                Fill in the required information below. Click{" "}
                <b>Save changes</b> when done.
              </DialogDescription>
            </DialogHeader>

            {/* Purchase Order Number */}
            <div className="flex space-x-1 mb-0">
              <Label htmlFor="POno.">Purchase Order No.</Label>
              <Input
                id="POno."
                type="text"
                placeholder="Enter PO no."
                value={POnumber}
                onChange={(e) => setPOnumber(e.target.value)}
                className={'w-32'}
              />
            </div>

            {/* Accordion Sections */}
            <Accordion
              type="multiple"
              collapsible="true"
              className="w-full"
              defaultValue={["item-1", "item-2"]}
            >
              {/* Section 1: Order Details */}
              <AccordionItem value="item-1"
              className="border border-gray-200 rounded-xl shadow-sm bg-white my-2"
              >
                <AccordionTrigger className="text-md font-semibold px-4 py-2 text-gray-800 cursor-pointer hover:text-indigo-700">
                  Order Details
                </AccordionTrigger>
                <AccordionContent className="p-4 text-gray-600 bg-gray-50 rounded-b-xl">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Order Date */}
                    <div className="flex flex-col space-y-1">
                      <Label>Order Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              !date ? "text-muted-foreground" : ""
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? (
                              format(date, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
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

                    {/* Agent Dropdown */}
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="agent">Agent</Label>
                      <Popover open={agentOpen} onOpenChange={setAgentOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={agentOpen}
                            className="w-full justify-between"
                          >
                            {agent ? (
                              agent
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
                            <CommandInput placeholder="Search agent..." />
                            <CommandList>
                              <CommandEmpty>No agent found.</CommandEmpty>
                              <CommandGroup>
                                {agents.map((a) => (
                                  <CommandItem
                                    key={a.id}
                                    value={a.name}
                                    onSelect={(v) => {
                                      setAgent(v === agent ? "" : v);
                                      setAgentOpen(false);
                                    }}
                                  >
                                    <CheckIcon
                                      className={`mr-2 h-4 w-4 ${
                                        agent === a.name
                                          ? "opacity-100"
                                          : "opacity-0"
                                      }`}
                                    />
                                    {a.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Mill Dropdown */}
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="mill">Mill</Label>
                      <Popover open={millOpen} onOpenChange={setMillOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={millOpen}
                            className="w-full justify-between"
                          >
                            {mill ? (
                              mill
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
                            <CommandInput placeholder="Search mill..." />
                            <CommandList>
                              <CommandEmpty>No mill found.</CommandEmpty>
                              <CommandGroup>
                                {mills.map((m) => (
                                  <CommandItem
                                    key={m.id}
                                    value={m.name}
                                    onSelect={(v) => {
                                      setMill(v === mill ? "" : v);
                                      setMillOpen(false);
                                    }}
                                  >
                                    <CheckIcon
                                      className={`mr-2 h-4 w-4 ${
                                        mill === m.name
                                          ? "opacity-100"
                                          : "opacity-0"
                                      }`}
                                    />
                                    {m.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Cloth Name */}
                    <div className="flex flex-col space-y-1">
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
                            <CommandInput placeholder="Search cloth..." />
                            <CommandList>
                              <CommandEmpty>No cloth found.</CommandEmpty>
                              <CommandGroup>
                                {cloths.map((c) => (
                                  <CommandItem
                                    key={c.id}
                                    value={c.name}
                                    onSelect={(v) => {
                                      setClothName(v === clothName ? "" : v);
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
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section 2: Purchase Details */}
              <AccordionItem value="item-2" className="border border-gray-200 rounded-xl shadow-sm bg-white my-2">
                <AccordionTrigger className="text-md font-semibold px-4 py-2 text-gray-800 cursor-pointer hover:text-indigo-700">
                  Purchase Details
                </AccordionTrigger>
                <AccordionContent className="p-4 text-gray-600 bg-gray-50 rounded-b-xl">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Rate */}
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="rate">Purchase Rate</Label>
                      <Input
                        id="rate"
                        type="number"
                        placeholder="Enter rate"
                        value={purchaseRate}
                        onChange={(e) => setPurchaseRate(e.target.value)}
                      />
                    </div>

                    {/* Quantity */}
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="qty">Quantity</Label>
                      <Input
                        id="qty"
                        type="number"
                        placeholder="Enter quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>

                    {/* Due Date */}
                    <div className="flex flex-col space-y-1 col-span-2">
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Design + Fabricator */}
            <div className="grid grid-cols-2 gap-4">
              {/* Design */}
              <div className="flex flex-col space-y-1">
                <Label htmlFor="designname">Design</Label>
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
                        <span className="text-muted-foreground">Select...</span>
                      )}
                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search design..." />
                      <CommandList>
                        <CommandEmpty>No design found.</CommandEmpty>
                        <CommandGroup>
                          {designs.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.name}
                              onSelect={(v) => {
                                setDesignName(v === designName ? "" : v);
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

              {/* Fabricator */}
              <div className="flex flex-col space-y-1">
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
                              onSelect={(v) => {
                                setFabricator(v === fabricator ? "" : v);
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
            </div>

            {/* Footer */}
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
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
