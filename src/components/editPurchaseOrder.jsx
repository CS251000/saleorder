"use client";

import { useEffect, useState } from "react";
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
  Edit,
  Edit3,
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
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { ScrollArea } from "./ui/scroll-area";
import { useProdManager } from "@/context/ProdManagerContext";
import { useGlobalUser } from "@/context/UserContext";
import toast from "react-hot-toast";
import { Textarea } from "./ui/textarea";

export function EditPurchaseOrderForm({ purchaseOrder, onSuccess }) {
  const [agentOpen, setAgentOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [clothOpen, setClothOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { currentUser } = useGlobalUser();

  const {
    fabricators,
    addFabricator,
    cloths,
    addCloth,
    designs,
    addDesign,
    categories,
    addCategory,
    clothBuyAgents,
    addClothBuyAgent,
  } = useProdManager();

  const [form, setForm] = useState({
    id: "",
    POnumber: "",
    date: new Date(),
    agentId: null,
    agentName: "",
    categoryId: null,
    categoryName: "",
    clothId: null,
    clothName: "",
    designId: null,
    designName: "",
    fabricatorId: null,
    fabricatorName: "",
    purchaseRate: "",
    quantity: "",
    description: "",
    dueDate: null,
    dueDays: "",
    managerId: currentUser?.id,
  });

  // Load purchase order data when dialog opens
  useEffect(() => {
    if (open && purchaseOrder) {
      // Find related names
      const agent = clothBuyAgents.find((a) => a.id === purchaseOrder.agentId);
      const category = categories.find((c) => c.id === purchaseOrder.categoryId);
      const cloth = cloths.find((c) => c.id === purchaseOrder.clothId);
      const design = designs.find((d) => d.id === purchaseOrder.designId);
      const fabricator = fabricators.find((f) => f.id === purchaseOrder.fabricatorId);

      // Parse dates
      const orderDate = purchaseOrder.orderDate ? new Date(purchaseOrder.orderDate) : new Date();
      const dueDate = purchaseOrder.dueDate ? new Date(purchaseOrder.dueDate) : null;

      // Calculate due days
      let dueDays = "";
      if (orderDate && dueDate) {
        dueDays = String(differenceInCalendarDays(dueDate, orderDate));
      }

      setForm({
        id: purchaseOrder.id || "",
        POnumber: purchaseOrder.poNumber || "",
        date: orderDate,
        agentId: purchaseOrder.agentId || null,
        agentName: agent?.name || "",
        categoryId: purchaseOrder.categoryId || null,
        categoryName: category?.name || "",
        clothId: purchaseOrder.clothId || null,
        clothName: cloth?.name || "",
        designId: purchaseOrder.designId || null,
        designName: design?.name || "",
        fabricatorId: purchaseOrder.fabricatorId || null,
        fabricatorName: fabricator?.name || "",
        purchaseRate: purchaseOrder.purchaseRate?.toString() || "",
        quantity: purchaseOrder.quantity?.toString() || "",
        description: purchaseOrder.description || "",
        dueDate: dueDate,
        dueDays: dueDays,
        managerId: purchaseOrder.managerId || currentUser?.id,
      });
    }
  }, [open, purchaseOrder, clothBuyAgents, categories, cloths, designs, fabricators, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id) {
      toast.error("Purchase order ID is missing");
      return;
    }

    try {
      setSaving(true);
      let {
        agentId,
        agentName,
        categoryId,
        categoryName,
        clothId,
        clothName,
        designId,
        designName,
        fabricatorId,
        fabricatorName,
      } = form;

      // Add new entities if needed and get their IDs
      if (!agentId && agentName) {
        const newAgent = await addClothBuyAgent(agentName);
        agentId = newAgent?.id || agentName;
      }
      if (!categoryId && categoryName) {
        const newCategory = await addCategory(categoryName);
        categoryId = newCategory?.id || categoryName;
      }
      if (!clothId && clothName) {
        const newCloth = await addCloth(clothName);
        clothId = newCloth?.id || clothName;
      }
      if (!designId && designName) {
        const newDesign = await addDesign(designName);
        designId = newDesign?.id || designName;
      }
      if (!fabricatorId && fabricatorName) {
        const newFab = await addFabricator(fabricatorName);
        fabricatorId = newFab?.id || fabricatorName;
      }

      // Construct final object
      const finalOrder = {
        ...form,
        agentId,
        categoryId,
        clothId,
        designId,
        fabricatorId,
        isEditForm:true,
      };

      const res = await fetch("/api/purchaseOrder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalOrder),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 400) {
          toast.error(data.error || "Missing required fields");
        } else if (res.status === 404) {
          toast.error("Purchase order not found");
        } else if (res.status === 500) {
          toast.error(data.error || "Server error occurred");
        } else {
          toast.error("Failed to update purchase order");
        }
        return;
      }

      const data = await res.json();
      toast.success("Purchase order updated successfully");

      if (onSuccess) {
        onSuccess();
      }
      setOpen(false);
    } catch (error) {
      console.error("❌ Error updating purchase order:", error);
      toast.error("Error updating purchase order");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  if (!currentUser) return <div>Loading...</div>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {(
          <Button variant="outline" className=" bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1.5 rounded-md shadow-sm transition-all gap-2">
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] w-[95%] rounded-xl">
        <ScrollArea className="h-[80vh] pr-3">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Edit Purchase Order
              </DialogTitle>
              <DialogDescription className="text-sm">
                Update the purchase order information below. Click{" "}
                <b>Save changes</b> when done.
              </DialogDescription>
            </DialogHeader>

            {/* Purchase Order Number */}
            <div className="flex space-x-1 mb-0">
              <Label htmlFor="POno.">Purchase Order No.</Label>
              <Input
                id="POno."
                type="text"
                disabled={true}
                placeholder="Enter PO no."
                value={form.POnumber}
                onChange={(e) => setForm({ ...form, POnumber: e.target.value })}
                className="w-32"
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
              <AccordionItem
                value="item-1"
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
                              !form.date ? "text-muted-foreground" : ""
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.date ? (
                              format(form.date, "dd MMM yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={form.date}
                            onSelect={(val) =>
                              setForm({ ...form, date: val ?? new Date() })
                            }
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
                            {form.agentName ? (
                              form.agentName
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
                              placeholder="Search agent..."
                              onValueChange={(v) =>
                                setForm({
                                  ...form,
                                  agentName: v,
                                })
                              }
                            />
                            <CommandList>
                              <CommandEmpty>
                                <div className="flex flex-col items-center gap-2 py-3">
                                  <p className="text-sm text-muted-foreground">
                                    No agent found.
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      if (!form.agentName) return;
                                      setAgentOpen(false);
                                    }}
                                  >
                                    <CirclePlus className="w-4 h-4 mr-1" />
                                    Add "{form.agentName}"
                                  </Button>
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {clothBuyAgents.map((a) => (
                                  <CommandItem
                                    key={a.id}
                                    value={a.name}
                                    onSelect={() => {
                                      setForm({
                                        ...form,
                                        agentId: a.id,
                                        agentName: a.name,
                                      });
                                      setAgentOpen(false);
                                    }}
                                  >
                                    <CheckIcon
                                      className={`mr-2 h-4 w-4 ${
                                        form.agentName === a.name
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

                    {/* Category Dropdown */}
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="category">Category</Label>
                      <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={categoryOpen}
                            className="w-full justify-between"
                          >
                            {form.categoryName ? (
                              form.categoryName
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
                              placeholder="Search category..."
                              onValueChange={(v) =>
                                setForm({
                                  ...form,
                                  categoryName: v,
                                })
                              }
                            />
                            <CommandList>
                              <CommandEmpty>
                                <div className="flex flex-col items-center gap-2 py-3">
                                  <p className="text-sm text-muted-foreground">
                                    No category found.
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      if (!form.categoryName) return;
                                      setCategoryOpen(false);
                                    }}
                                  >
                                    <CirclePlus className="w-4 h-4 mr-1" />
                                    Add "{form.categoryName}"
                                  </Button>
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {categories.map((c) => (
                                  <CommandItem
                                    key={c.id}
                                    value={c.name}
                                    onSelect={() => {
                                      setForm({
                                        ...form,
                                        categoryName: c.name,
                                        categoryId: c.id,
                                      });
                                      setCategoryOpen(false);
                                    }}
                                  >
                                    <CheckIcon
                                      className={`mr-2 h-4 w-4 ${
                                        form.categoryName === c.name
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
                                    Add "{form.clothName}"
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
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section 2: Purchase Details */}
              <AccordionItem
                value="item-2"
                className="border border-gray-200 rounded-xl shadow-sm bg-white my-2"
              >
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
                        value={form.purchaseRate}
                        onChange={(e) =>
                          setForm({ ...form, purchaseRate: e.target.value })
                        }
                      />
                    </div>

                    {/* Quantity */}
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="qty">Quantity</Label>
                      <Input
                        id="qty"
                        type="number"
                        placeholder="Enter quantity"
                        value={form.quantity}
                        onChange={(e) =>
                          setForm({ ...form, quantity: e.target.value })
                        }
                      />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col space-y-1.5 col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter description"
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                      />
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
                                  if (prev.date) {
                                    const diff = differenceInCalendarDays(
                                      v,
                                      prev.date
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
                                if (prev.date) {
                                  return {
                                    ...prev,
                                    dueDays: days,
                                    dueDate: addDays(prev.date, days),
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Design + Fabricator */}
            <div className="grid grid-cols-2 gap-4">
              {/* Design */}
              <div className="flex flex-col space-y-1">
                <Label htmlFor="designname">Shirt Item</Label>
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
                        <span className="text-muted-foreground">Select...</span>
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
                              Add "{form.designName}"
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
                      {form.fabricatorName ? (
                        form.fabricatorName
                      ) : (
                        <span className="text-muted-foreground">Select...</span>
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
                              Add "{form.fabricatorName}"
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
            </div>

            {/* Footer */}
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
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
                  Save Changes
                </Button>
              )}
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}