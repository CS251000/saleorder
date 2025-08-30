import { sql } from "drizzle-orm";
import { integer, pgEnum, pgTable, serial, text, uuid, varchar } from "drizzle-orm/pg-core";


export const roleEnum = pgEnum("role", ["Manager", "Admin","Employee"]);

export const users= pgTable("users", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  clerkId: varchar("clerk_id").unique(),
  email: text("email").unique(),
  phone: varchar("phone"),
  username: varchar("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: roleEnum("role"),
  age: integer("age")
});

export const employees = pgTable("employees", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  employeeId: uuid("employee_id").unique().references(() => users.id),
  managerId: uuid("manager_id").references(() => users.id),
});