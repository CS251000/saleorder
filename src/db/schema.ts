import { sql } from "drizzle-orm";
import { boolean, date, index, integer, jsonb, numeric, pgEnum, pgTable, text, unique, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";


export const roleEnum = pgEnum("role", ["Manager", "Admin","Employee"]);
export const saleOrderStatus= pgEnum("status",["Dispatched","Pending"]);
export const jobSlipStatus= pgEnum("Job_slip_status",["Pending","Completed"]);
export const plans= pgEnum("plan_names",["EazyCore","EazyPro","EazyElite"]);
export const paymentStatus=pgEnum("payment_status",["Paid","Pending","Failed"]);

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
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  planName: plans("plan_name").notNull(),
  startDate: date("start_date").defaultNow(),
  endDate: date("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  autoRenew: boolean("auto_renew").default(true),
  paymentStatus: varchar("payment_status").default("paid")
},(t)=>[
  index("user_subscription_index").on(t.userId)
]);


export const usage=pgTable("usage",{
  id:uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  userId:uuid("user_id").references(()=>users.id),
  startDate:date("start_date").defaultNow(),
  tasksPerMonth:integer("tasks_per_month"),
  jobOrdersPerMonthLimit:integer("job_orders_per_month_limit"),
  purchaseOrdersPerMonthLimit:integer("purchase_orders_per_month_limit")
},(t)=>[
  index("user_usage_index").on(t.userId)
])

export const employees = pgTable("employees", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  employeeId: uuid("employee_id").unique().references(() => users.id),
  managerId: uuid("manager_id").references(() => users.id),
  pendingOrders: integer("pending_orders").default(0),
  dispatchedOrders: integer("dispatched_orders").default(0)
});

export const agents= pgTable("agents",{
  id:uuid("agent_id").default(sql`gen_random_uuid()`).primaryKey(),
  name:text("name"),
  managerId: uuid("manager_id").references(() => users.id),
},(t)=>[
  unique("agent_per_manager").on(t.name,t.managerId)
])
export const party= pgTable("party",{
  id:uuid("party_id").default(sql`gen_random_uuid()`).primaryKey(),
  name:text("name"),
  managerId: uuid("manager_id").references(() => users.id),
  pendingCases: integer("pending_cases").default(0),
  dispatchedCases: integer("dispatched_cases").default(0)
},(t)=>[
  unique("party_per_manager").on(t.name,t.managerId)
])

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
  id:uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  name:varchar("name").notNull(),
  total:integer("total"),
  dispatched:integer("dispatched"),
  pending:integer("pending"),
  managerId:uuid("manager_id").notNull().references(()=>users.id)
},(t)=>[
  index("manager_fabricator_index").on(t.managerId),
  unique("fabricator_per_manager").on(t.managerId,t.name)
]);

export const cloths=pgTable("cloths",{
  id:uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  name:varchar("name").notNull(),
  total:integer("total"),
  dispatched:integer("dispatched"),
  pending:integer("pending"),
  managerId:uuid("manager_id").notNull().references(()=>users.id)
},(t)=>[
  index("manager_cloth_index").on(t.managerId),
  unique("cloth_per_manager").on(t.managerId,t.name)
]);

export const designs=pgTable("designs",{
  id:uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  name:varchar("name").notNull(),
  total:integer("total"),
  dispatched:integer("dispatched"),
  pending:integer("pending"),
  managerId:uuid("manager_id").notNull().references(()=>users.id)
},(t)=>[
  index("manager_design_index").on(t.managerId),
  unique("design_per_manager").on(t.managerId,t.name)
]);

export const clothBuyAgents=pgTable("buy_agents",{
  id:uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  name:varchar("name").notNull(),
  total:integer("total"),
  dispatched:integer("dispatched"),
  pending:integer("pending"),
  managerId:uuid("manager_id").notNull().references(()=>users.id)
},(t)=>[
  index("manager_buyagent_index").on(t.managerId),
  unique("clothAgent_per_manager").on(t.managerId,t.name)
]);

export const categories=pgTable("categories",{
  id:uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  name:varchar("name").notNull(),
  managerId:uuid("manager_id").notNull().references(()=>users.id)
},(t)=>[
  index("manager_category_index").on(t.managerId),
  unique("category_per_manager").on(t.managerId,t.name)
]);


export const jobOrder= pgTable("job_order",{
  jobSlipNumber: varchar("job_slip_no.").primaryKey(),
  managerId:uuid("manager_id").notNull().references(()=>users.id),
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
  salePrice:numeric("sale_price").default("0.0"),
  isBestSeller:boolean("is_best_seller").default(false),
  expenses: jsonb("expenses").$type<{ expenseId: number; amount: number }[]>().default(sql`'[]'::jsonb`),
  status: jobSlipStatus("status").default("Pending")

},(t)=>[
  index("fabricator_wise_index").on(t.fabricatorId),
  index("design_wise_index").on(t.designId),
  index("manager_wise_job_orders").on(t.managerId)
]);

export const jobOrderExpenses = pgTable("job_order_expenses", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  expenseName: varchar("expense_name").notNull(),
  managerId:uuid("manager_id").notNull().references(()=>users.id),
},(t)=>[
  index("manager_job_order_expenses").on(t.managerId)
]);


export const purchaseOrder=pgTable("purchase_order",{
  id:uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  POnumber:varchar("po_number"),
  managerId:uuid("manager_id").notNull().references(()=>users.id),
  orderDate:date("order_date").defaultNow(),
  agentId:uuid("agent_id").references(()=>clothBuyAgents.id),
  categoryId:uuid("category_id").references(()=>categories.id),
  clothId:uuid("cloth_id").references(()=>cloths.id),
  purchaseRate:numeric("price").default("0.0"),
  quantity:numeric("quantity"),
  description:text("description"),
  dueDate:date("due_date").defaultNow(),
  designId:uuid("design_id").references(()=>designs.id),
  fabricatorId:uuid("fabricator_id").references(()=>fabricators.id),
  status: jobSlipStatus("status").default("Pending")
},(t)=>[
  uniqueIndex("po_number_index").on(t.POnumber),
  index("agent_wise_index").on(t.agentId),
  index("cloth_wise_index").on(t.clothId),
  index("design_wise__po_index").on(t.designId),
  index("fabricator_wise_po_index").on(t.fabricatorId),
  index("manager_wise_purchase_orders")
])





