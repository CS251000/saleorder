"use client"
import PartyDashboard from '@/components/dashboards/PartyDashboard';
import { Button } from '@/components/ui/button';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useParams } from 'next/navigation'
import React, { Suspense } from 'react'

function PartyDashboardContent() {
  const params = useParams();
  const {partyId} = params;
  const { user, isLoaded } = useUser();

  return(
    <div className='flex flex-col space-y-5 h-screen'>
          {/* Navbar */}
          <div className="flex items-center justify-between px-6 py-4 bg-white shadow">
            <Link href="/">
              <h1 className="flex-1 min-w-0 text-2xl font-bold text-blue-600 truncate">
                Sales Order
              </h1>
            </Link>
            <h1 className="text-2xl hidden lg:inline font-bold">Party Dashboard</h1>
            <div className="flex items-center space-x-3 flex-nowrap">
              {!user ? (
                <>
                  <SignUpButton />
                  <SignInButton mode="modal">
                    <Button>Sign In</Button>
                  </SignInButton>
                </>
              ) : (
                <UserButton />
                  
              )}
            </div>
          </div>
          <PartyDashboard partyId={partyId} />
        </div>
  )
}
    
export default function PartyDashboardPage() {
  return (
    <Suspense fallback={
          <div className="flex items-center justify-center h-screen">
            <div>Loading...</div>
          </div>
        }>
        <PartyDashboardContent/>
    </Suspense>
  )
}

