"use client";

import { createContext, useContext, useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";

const ProdManagerContext = createContext();

export const ProdManagerProvider = ({ children }) => {
  const [fabricators, setFabricators] = useState([{id:1,name:"amit"},{id:2,name:"viraaj"}]);
  const [loading, setLoading] = useState(false);

  const fetchFabricators = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("fabricators").select("*");
    if (!error) setFabricators(data);
    setLoading(false);
  };

  const addFabricator = async (name,total,dispatched,pending,managerId) => {
    const { data, error } = await supabase
      .from("fabricators")
      .insert([{ name,total,pending,dispatched,managerId }])
      .select()
      .single();

    if (!error) setFabricators((prev) => [...prev, data]);
    return { data, error };
  };

  useEffect(() => {
    fetchFabricators();
  }, []);

  return (
    <ProdManagerContext.Provider
      value={{ fabricators, addFabricator, loading }}
    >
      {children}
    </ProdManagerContext.Provider>
  );
};

export const useProdManager = () => useContext(ProdManagerContext);
