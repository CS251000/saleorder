"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Check, Mail, Phone, Building, Globe, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

const fetcher = (url) => fetch(url).then((res) => res.json());

function UserProfileContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const [copied, setCopied] = useState(false);
  const {user,isLoaded}= useUser();


  const { data, error, isLoading } = useSWR(
    userId ? `/api/profile?userId=${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 24 * 60 * 60000,
      refreshInterval: 0,
    }
  );

  if (isLoading)
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-600 mt-20">
        Failed to load profile: {error.message}
      </div>
    );

  if (!data?.user)
    return <div className="text-center text-gray-500 mt-20">No user found</div>;

  const userProfile = data.user;

  const handleCopy = async () => {
    if (!userId) return;
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-[#0D1B2A]">
            User Profile
          </h1>
          <Badge
            variant="outline"
            className="text-[#1B263B] border-[#1B263B] bg-[#E0E1DD]"
          >
            {userProfile.role}
          </Badge>
        </div>

        {/* Profile Card */}
        <Card className="shadow-lg border border-[#E0E1DD] rounded-2xl">
          <CardHeader className="flex flex-row items-center space-x-6">
            <Avatar className="h-20 w-20 border-2 border-[#415A77] shadow-sm">
              <AvatarImage src={user.imageUrl || ""} alt={userProfile.firstName} />
              <AvatarFallback className="bg-[#778DA9] text-white text-lg">
                {userProfile.firstName?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>

            <div>
              <CardTitle className="text-2xl font-semibold text-[#1B263B]">
                {userProfile.firstName} {userProfile.lastName}
              </CardTitle>
              <CardDescription className="text-gray-600">
                @{userProfile.userName}
              </CardDescription>

              <div className="flex items-center space-x-2 mt-3">
                <Badge
                  variant="secondary"
                  className="text-[#1B263B] bg-[#E0E1DD]"
                >
                  ID: {userId.slice(0, 6)}...
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="hover:bg-[#E0E1DD]"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-[#1B263B]" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Separator />

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-[#1B263B]" />
                <p className="text-sm text-gray-700">{userProfile.email}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-[#1B263B]" />
                <p className="text-sm text-gray-700">
                  {userProfile.phone || "Not provided"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-[#1B263B]" />
                <p className="text-sm text-gray-700">
                  Age: {userProfile.age || "N/A"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Organization Section */}
            <div>
              <h3 className="font-semibold text-lg text-[#0D1B2A] mb-2 flex items-center space-x-2">
                <Building className="h-5 w-5 text-[#1B263B]" />
                <span>Organization Details</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Organization Name
                  </p>
                  <p className="font-semibold text-[#1B263B]">
                    {userProfile.orgName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Organization Location
                  </p>
                  <p className="font-semibold text-[#1B263B]">
                    {userProfile.orgLocation || "N/A"}
                  </p>
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-[#1B263B]" />
                  <Link
                    href={userProfile.orgWebsite || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-700 hover:underline"
                  >
                    {userProfile.orgWebsite || "No website available"}
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function UserProfilePage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
        <UserProfileContent />
      </Suspense>
    </div>
  );
}
