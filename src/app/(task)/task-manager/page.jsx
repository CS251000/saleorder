"use client";
import ManagerDashboard from '@/components/dashboards/ManagerDashboard';
import Navbar2 from '@/components/Navbar2';
import { useSearchParams } from 'next/navigation';
import React from 'react'

export default function TaskManager() {
  const searchParams = useSearchParams();
  const userParam = searchParams.get("user");
  const currentUser = userParam ? JSON.parse(decodeURIComponent(userParam)) : null;
  return (
    <div>
      <Navbar2/>
      <ManagerDashboard currUser={currentUser}/>
    </div>
  )
}
