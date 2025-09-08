import React from 'react'

export default function ManagerDashboardEmployeeCard({ employee }) {
  return (
    <div>
      <h3 className="text-md font-bold">{employee.employeeName}</h3>
      <p className="text-sm">Role: {employee.employeeRole}</p>
      <p className="text-sm">Pending Orders: {employee.employeePendingOrders}</p>
      <p className="text-sm">Dispatched Orders: {employee.employeeDispatchedOrders}</p>
    </div>
  )
}
