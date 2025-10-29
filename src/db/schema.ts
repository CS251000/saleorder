import { sql } from "drizzle-orm";
import { boolean, date, integer, pgEnum, pgTable, serial, text, uuid, varchar } from "drizzle-orm/pg-core";


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
});

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
})
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 150 }),
  website: varchar("website", { length: 255 }),
  createdBy: uuid("created_by").notNull().references(()=>users.id),
  createdAt: date("created_at").defaultNow().notNull(),
});
