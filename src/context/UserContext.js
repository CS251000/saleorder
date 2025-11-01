"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import supabase from "@/lib/supabaseClient";

const UserContext = createContext();

export function UserProvider({ children }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ Load from cache or Supabase
  useEffect(() => {
    const loadUser = async () => {
      // Try from localStorage
      const cached = localStorage.getItem("appUser");
      if (cached) {
        const parsed = JSON.parse(cached);
        setCurrentUser(parsed);
        return; // already loaded
      }

      // If not cached, fetch from Supabase
      if (isLoaded && isSignedIn && user?.id) {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("clerk_id", user.id)
          .single();

        if (data) {
          setCurrentUser(data);
          localStorage.setItem("appUser", JSON.stringify(data));
        } else if (error) {
          console.error("Supabase user fetch error:", error.message);
        }
      }
    };

    loadUser();
  }, [isLoaded, isSignedIn, user?.id]);

  // ✅ Clear on logout
  useEffect(() => {
    if (!isSignedIn) {
      setCurrentUser(null);
      localStorage.removeItem("appUser");
    }
  }, [isSignedIn]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useGlobalUser = () => useContext(UserContext);
