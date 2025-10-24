"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";

export default function UserProfilePage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!userId) return;
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // reset after 2s
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="p-6">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        Back to Home
      </Link>
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      {userId && (
        <div className="flex items-center space-x-4">
          <p className="font-mono bg-gray-100 px-3 py-1 rounded">
            User ID= {userId}
          </p>
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {copied ? "✅ Copied!" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
