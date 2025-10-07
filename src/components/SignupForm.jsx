"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";

export default function SignupForm({ onSuccess }) {
  const { user, isLoaded } = useUser();

  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    age: "",
    role: "",
  });

  const [organization, setOrganization] = useState({
    name: "",
    location: "",
    website: "",
  });

  useEffect(() => {
    if (isLoaded && user) {
      setForm((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        phone: user.primaryPhoneNumber?.phoneNumber || "",
      }));
    }
  }, [user, isLoaded]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        clerkId: user.id,
        ...form,
        role: selectedRole,
        organization:
          selectedRole === "Manager"
            ? {
                name: organization.name,
                location: organization.location,
                website: organization.website,
              }
            : null,
      };

      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save user");

      toast.success("Profile completed successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Card className="w-[400px] shadow-md border border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-700">
            Complete Your Profile
          </CardTitle>
          <p className="text-gray-500 text-sm mt-1">
            Fill in your details to get started
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Basic Info Section */}
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">First Name</Label>
              <Input
                placeholder="Enter your first name"
                name="firstName"
                value={form.firstName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, firstName: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Last Name</Label>
              <Input
                placeholder="Enter your last name"
                name="lastName"
                value={form.lastName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, lastName: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Username</Label>
              <Input
                placeholder="Choose a username"
                name="username"
                value={form.username}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, username: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Email</Label>
              <Input
                placeholder="Email address"
                name="email"
                value={form.email}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Phone</Label>
              <Input
                placeholder="Phone number"
                name="phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Age</Label>
              <Input
                type="number"
                placeholder="Enter your age"
                name="age"
                value={form.age}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, age: e.target.value }))
                }
              />
            </div>

            <Separator className="my-4" />

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">
                Select Your Role
              </Label>
              <select
                name="role"
                required
                className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">-- Choose Role --</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
              </select>
            </div>

            {/* Organization Fields (Only for Manager) */}
            {selectedRole === "Manager" && (
              <>
                <Separator className="my-4" />
                <h3 className="font-semibold text-blue-600 text-lg">
                  Organization Details
                </h3>

                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">
                    Organization Name
                  </Label>
                  <Input
                    placeholder="Enter your organization name"
                    name="orgName"
                    value={organization.name}
                    onChange={(e) =>
                      setOrganization((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">
                    Location
                  </Label>
                  <Input
                    placeholder="Enter organization location"
                    name="orgLocation"
                    value={organization.location}
                    onChange={(e) =>
                      setOrganization((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">
                    Website
                  </Label>
                  <Input
                    placeholder="https://example.com"
                    name="orgWebsite"
                    value={organization.website}
                    onChange={(e) =>
                      setOrganization((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || !selectedRole}
            >
              {loading ? "Saving..." : "Save & Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
