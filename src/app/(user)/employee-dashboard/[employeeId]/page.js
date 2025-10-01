"use client"
import React, { useEffect, useState, Suspense } from 'react'
import EmployeeDashboard from '@/components/dashboards/EmployeeDashboard';
import { Button } from '@/components/ui/button';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { CircleUser } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';


// Separate component that uses useSearchParams
function EmployeeDashboardContent() {
  const params = useParams();
  const {employeeId} = params;

  const [currUser, setCurrUser] = useState(null);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/user?userId=${employeeId}`);
        const data = await res.json();
        // console.log("data", data);
        setCurrUser(data.currentUser);//employee details
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, [employeeId]);

  return (
    <div className='flex flex-col space-y-5 h-screen'>
      {/* Navbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <Link href="/">
          <h1 className="flex-1 min-w-0 text-2xl font-bold text-blue-600 truncate">
            Sales Order
          </h1>
        </Link>
        <h1 className="text-2xl hidden lg:inline font-bold">Employee Dashboard</h1>
        <div className="flex items-center space-x-3 flex-nowrap">
          {!user ? (
            <>
              <SignUpButton />
              <SignInButton mode="modal">
                <Button>Sign In</Button>
              </SignInButton>
            </>
          ) : (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Link
                  label="View User Id"
                  labelIcon={<CircleUser />}
                  href={`/view-user-id?id=${currUser?.id ?? ''}`}
                />
              </UserButton.MenuItems>
            </UserButton>
          )}
        </div>
      </div>
      <EmployeeDashboard currUser={currUser} />
    </div>
  );
}

// Main component with Suspense wrapper
export default function EmployeeDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    }>
      <EmployeeDashboardContent />
    </Suspense>
  );
}