"use client";

import { useEffect, useState } from "react";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";
import EmployeeDashboard from "@/components/dashboards/EmployeeDashboard";
import { CircleUser } from "lucide-react";

export default function Home() {
  const { user, isLoaded } = useUser();
  const [isInDB, setIsInDB] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    if (isLoaded && user) {
      checkUserInDB(user);
    }
  }, [isLoaded, user]);

  async function checkUserInDB(user) {
    try {
      const res = await fetch(`/api/user?id=${user.id}`);
      const data = await res.json();
      setIsInDB(data.exists);
      setCurrentUser(data.currentUser);
    } catch (err) {
      console.error("Error checking user:", err);
      setIsInDB(false);
    }
  }

  async function handleFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const body = Object.fromEntries(formData.entries());

  try {
    const res = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkId: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        ...body,
      }),
    });

    const data = await res.json();

    // ✅ Set both flags
    setIsInDB(true);
    setCurrentUser(data.user || data.currentUser || { 
      clerkId: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      ...body,
    });
  } catch (err) {
    console.error("Error saving user:", err);
  }
}


  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-medium">
        ⏳ Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <h1 className="flex-1 min-w-0 text-2xl font-bold text-blue-600 truncate">
          Sales Order
        </h1>

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
                  href={`/view-user-id?id=${currentUser?.id ?? ''}`}

                />
              </UserButton.MenuItems>
            </UserButton>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center mt-12">
        {!user ? (
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-4">Welcome to MyApp 🚀</h2>
            <p className="text-gray-600">
              Please sign in or sign up to get started.
            </p>
          </div>
        ) : isInDB === null ? (
          <div className="text-lg mt-10">🔍 Checking user...</div>
        ) : !isInDB ? (
          <Card className="w-[350px] mt-8">
            <CardHeader>
              <CardTitle>Select Your Role</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <select
                  name="role"
                  required
                  className="border rounded p-2 w-full"
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                  }}
                >
                  <option value="">-- Choose Role --</option>
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                </select>
                <Button type="submit" className="w-full">
                  Save & Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : currentUser.role === "Manager" ? (
          <ManagerDashboard currUser={currentUser} />
        ) : (
          <EmployeeDashboard currUser={currentUser} />
        )}
      </main>
    </div>
  );
}
