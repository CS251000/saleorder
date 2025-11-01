import { sql } from "drizzle-orm";
import { boolean, date, index, integer, numeric, pgEnum, pgTable, serial, text, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";


export const roleEnum = pgEnum("role", ["Manager", "Admin","Employee"]);
export const saleOrderStatus= pgEnum("status",["Dispatched","Pending"]);

export const users= pgTable("users", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  createdAt: date("created_at").defaultNow(),
  clerkId: varchar("clerk_id").unique(),
  email: text("email").unique(),
  phone: varchar("phone"),
  username: varchar("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  organization : uuid("organization").references(()=>organizations.id),
  role: roleEnum("role"),
  age: integer("age")
},(t)=>[
  uniqueIndex("clerk_user_index").on(t.clerkId)
]);

export const employees = pgTable("employees", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  employeeId: uuid("employee_id").unique().references(() => users.id),
  managerId: uuid("manager_id").references(() => users.id),
  pendingOrders: integer("pending_orders").default(0),
  dispatchedOrders: integer("dispatched_orders").default(0)
});

export const agents= pgTable("agents",{
  id:uuid("agent_id").default(sql`gen_random_uuid()`).primaryKey(),
  name:text("name").unique(),
  managerId: uuid("manager_id").references(() => users.id),
})
export const party= pgTable("party",{
  id:uuid("party_id").default(sql`gen_random_uuid()`).primaryKey(),
  name:text("name").unique(),
  managerId: uuid("manager_id").references(() => users.id),
  pendingCases: integer("pending_cases").default(0),
  dispatchedCases: integer("dispatched_cases").default(0)
})

export const saleOrder= pgTable("sales_order",{
  id:uuid("sales_order_id").default(sql`gen_random_uuid()`).primaryKey(),
  orderNumber: varchar("order_number"),
  employeeId: uuid("employee_id").references(() => employees.id),
  orderDate: date("order_date").defaultNow(),
  completedDate: date("completed_date").default(null),
  agentId: uuid("agent_id").references(() => agents.id),
  partyId: uuid("party_id").references(() => party.id),
  staff:uuid("staff").references(() => users.id),
  totalCase: integer("total_case"),
  pendingCase: integer("pending_case"),
  dispatchedCase: integer("dispatched_case"),
  status: saleOrderStatus("status").default("Pending"),
  edited:boolean("is_edited").default(false)
},(t)=>[
  index("employee_index").on(t.staff),
  index("party_wise_index").on(t.partyId)
])
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 150 }),
  website: varchar("website", { length: 255 }),
  createdBy: uuid("created_by").notNull().references(()=>users.id),
  createdAt: date("created_at").defaultNow().notNull(),
});

// PROD MANAGER TABLES

export const fabricators=pgTable("fabricators",{
  id:uuid("id").primaryKey(),
  name:varchar("name").notNull(),
  total:integer("total"),
  dispatched:integer("dispatched"),
  pending:integer("pending"),
  managerId:uuid("manager_id").notNull().references(()=>users.id)
},(t)=>[
  index("manager_fabricator_index").on(t.managerId)
]);

export const cloths=pgTable("cloths",{
  id:uuid("id").primaryKey(),
  name:varchar("name").notNull(),
  total:integer("total"),
  dispatched:integer("dispatched"),
  pending:integer("pending"),
  managerId:uuid("manager_id").notNull().references(()=>users.id)
},(t)=>[
  index("manager_cloth_index").on(t.managerId)
]);

export const designs=pgTable("designs",{
  id:uuid("id").primaryKey(),
  name:varchar("name").notNull(),
  total:integer("total"),
  dispatched:integer("dispatched"),
  pending:integer("pending"),
  managerId:uuid("manager_id").notNull().references(()=>users.id)
},(t)=>[
  index("manager_design_index").on(t.managerId)
]);

export const clothBuyAgents=pgTable("buy_agents",{
  id:uuid("id").primaryKey(),
  name:varchar("name").notNull(),
  total:integer("total"),
  dispatched:integer("dispatched"),
  pending:integer("pending"),
  managerId:uuid("manager_id").notNull().references(()=>users.id)
},(t)=>[
  index("manager_buyagent_index").on(t.managerId)
]);

export const mills=pgTable("mills",{
  id:uuid("id").primaryKey(),
  name:varchar("name").notNull(),
  managerId:uuid("manager_id").notNull().references(()=>users.id)
},(t)=>[
  index("manager_mill_index").on(t.managerId)
]);


export const jobOrder= pgTable("job_order",{
  jobSlipNumber: varchar("job_slip_no.").primaryKey(),
  orderDate:date("order_date").defaultNow(),
  fabricatorId:uuid("fabricator_id").references(()=>fabricators.id),
  dueDate:date("due_date"),
  isSampleGiven:boolean("is_sample_given").default(false),
  clothId:uuid("cloth_id").references(()=>cloths.id),
  totalMeter:numeric("total_meter").default("0.0"),
  price:numeric("price").default("0.0"),
  designId:uuid("design_id").references(()=>designs.id),
  average:numeric("average").default("0.0"),
  fabrication:numeric("fabrication").default("0.0"),
  costing:numeric("costing").default("0.0"),
  isBestSeller:boolean("is_best_seller").default(false)
  // expenses

},(t)=>[
  index("fabricator_wise_index").on(t.fabricatorId),
  index("design_wise_index").on(t.designId)
]);

export const jobOrderExpenses = pgTable("job_order_expenses", {
  id: serial("id").primaryKey(),
  jobSlipNumber: varchar("job_slip_no")
    .references(() => jobOrder.jobSlipNumber)
    .notNull(),
  expenseName: varchar("expense_name").notNull(),
  amount: numeric("amount").default("0.0").notNull(),
});


export const purchaseOrder=pgTable("purchase_order",{
  id:uuid("id").primaryKey(),
  POnumber:varchar("po_number"),
  orderDate:date("order_date").defaultNow(),
  agentId:uuid("agent_id").references(()=>clothBuyAgents.id),
  millId:uuid("mills_id").references(()=>mills.id),
  clothId:uuid("cloth_id").references(()=>cloths.id),
  purchaseRate:numeric("price").default("0.0"),
  quantity:numeric("quantity"),
  dueDate:date("order_date").defaultNow(),
  designId:uuid("design_id").references(()=>designs.id),
  fabricatorId:uuid("fabricator_id").references(()=>fabricators.id)
},(t)=>[
  uniqueIndex("po_number_index").on(t.POnumber),
  index("agent_wise_index").on(t.agentId),
  index("cloth_wise_index").on(t.clothId)
])





