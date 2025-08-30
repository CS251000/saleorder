CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY NOT NULL,
	"employee_id" varchar,
	"manager_id" uuid,
	CONSTRAINT "employees_employee_id_unique" UNIQUE("employee_id")
);
