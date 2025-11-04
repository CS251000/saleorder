"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useGlobalUser } from "./UserContext";

const ProdManagerContext = createContext();

export const ProdManagerProvider = ({ children }) => {
  const { currentUser } = useGlobalUser();

  /* ----------------------------- 🧵 FABRICATORS ----------------------------- */
  const [fabricators, setFabricators] = useState([]);
  const [loadingFabricators, setLoadingFabricators] = useState(false);

  const getFabricators = async () => {
    if (!currentUser?.id) return;
    setLoadingFabricators(true);
    try {
      const res = await fetch(`/api/fabricators?managerId=${currentUser.id}`);
      const data = await res.json();
      if (res.ok) setFabricators(data.fabricators || []);
      else console.error("Error fetching fabricators:", data.error);
    } catch (err) {
      console.error("Failed to fetch fabricators:", err);
    } finally {
      setLoadingFabricators(false);
    }
  };

  const addFabricator = async (name) => {
    if (!name || !currentUser?.id) return;
    try {
      const res = await fetch("/api/fabricators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fabricatorName: name, managerId: currentUser.id }),
      });
      const data = await res.json();
      if (res.ok) {
        const newFabricator= {id:data.fabricator.fabricatorId,name,total:0,dispatched:0,pending:0};
        setFabricators((prev) => [
          ...prev,newFabricator
        ]);
        return newFabricator
      } else console.error("Error adding fabricator:", data.error);
    } catch (err) {
      console.error("Failed to add fabricator:", err);
    }
  };

  /* ------------------------------- 👕 CLOTHS ------------------------------- */
  const [cloths, setCloths] = useState([]);
  const [loadingCloths, setLoadingCloths] = useState(false);

  const getCloths = async () => {
    if (!currentUser?.id) return;
    setLoadingCloths(true);
    try {
      const res = await fetch(`/api/cloths?managerId=${currentUser.id}`);
      const data = await res.json();
      if (res.ok) setCloths(data.clothsList || []);
      else console.error("Error fetching cloths:", data.error);
    } catch (err) {
      console.error("Failed to fetch cloths:", err);
    } finally {
      setLoadingCloths(false);
    }
  };

  const addCloth = async (name) => {
    if (!name || !currentUser?.id) return;
    try {
      const res = await fetch("/api/cloths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clothName: name, managerId: currentUser.id }),
      });
      const data = await res.json();
      if (res.ok) {
        const newCloth={id: data.cloth.clothId, name}
        setCloths((prev) => [...prev, newCloth]);
        return newCloth
      } else console.error("Error adding cloth:", data.error);
    } catch (err) {
      console.error("Failed to add cloth:", err);
    }
  };

  /* ----------------------------- 🎨 DESIGNS ----------------------------- */
  const [designs, setDesigns] = useState([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);

  const getDesigns = async () => {
    if (!currentUser?.id) return;
    setLoadingDesigns(true);
    try {
      const res = await fetch(`/api/designs?managerId=${currentUser.id}`);
      const data = await res.json();
      if (res.ok) setDesigns(data.designs || []);
      else console.error("Error fetching designs:", data.error);
    } catch (err) {
      console.error("Failed to fetch designs:", err);
    } finally {
      setLoadingDesigns(false);
    }
  };

  const addDesign = async (name) => {
    if (!name || !currentUser?.id) return;
    try {
      const res = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designName: name, managerId: currentUser.id }),
      });
      const data = await res.json();
      if (res.ok) {
        const newDesign={ id: data.design.designId, name }
        setDesigns((prev) => [...prev,newDesign ]);
        return newDesign;
      } else console.error("Error adding design:", data.error);
    } catch (err) {
      console.error("Failed to add design:", err);
    }
  };

  /* ----------------------------- 🏭 MILLS ----------------------------- */
  const [mills, setMills] = useState([]);
  const [loadingMills, setLoadingMills] = useState(false);

  const getMills = async () => {
    if (!currentUser?.id) return;
    setLoadingMills(true);
    try {
      const res = await fetch(`/api/mills?managerId=${currentUser.id}`);
      const data = await res.json();
      if (res.ok) setMills(data.mills || []);
      else console.error("Error fetching mills:", data.error);
    } catch (err) {
      console.error("Failed to fetch mills:", err);
    } finally {
      setLoadingMills(false);
    }
  };

  const addMill = async (name) => {
    if (!name || !currentUser?.id) return;
    try {
      const res = await fetch("/api/mills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ millName: name, managerId: currentUser.id }),
      });
      const data = await res.json();
      if (res.ok) {
        const newMill={ id: data.mill.millId, name }
        setMills((prev) => [...prev,newMill]);
        return newMill
      } else console.error("Error adding mill:", data.error);
    } catch (err) {
      console.error("Failed to add mill:", err);
    }
  };

  /* -------------------------- 🧾 CLOTH BUY AGENTS -------------------------- */
  const [clothBuyAgents, setClothBuyAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const getClothBuyAgents = async () => {
    if (!currentUser?.id) return;
    setLoadingAgents(true);
    try {
      const res = await fetch(`/api/clothBuyAgents?managerId=${currentUser.id}`);
      const data = await res.json();
      if (res.ok) setClothBuyAgents(data.agents || []);
      else console.error("Error fetching agents:", data.error);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
    } finally {
      setLoadingAgents(false);
    }
  };

  const addClothBuyAgent = async (name) => {
    if (!name || !currentUser?.id) return;
    try {
      const res = await fetch("/api/clothBuyAgents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentName: name, managerId: currentUser.id }),
      });
      const data = await res.json();
      if (res.ok) {
        const newAgent={ id: data.clothBuyAgent.agentId, name }
        setClothBuyAgents((prev) => [...prev,newAgent ]);
        return newAgent;
      } else console.error("Error adding agent:", data.error);
    } catch (err) {
      console.error("Failed to add agent:", err);
    }
  };

  /* -------------------------- 🌐 Auto fetch all -------------------------- */
  useEffect(() => {
    if (currentUser?.id) {
      getFabricators();
      getCloths();
      getDesigns();
      getMills();
      getClothBuyAgents();
    }
  }, [currentUser]);


  /* ----------------------------- 🚀 Context value ----------------------------- */
  return (
    <ProdManagerContext.Provider
      value={{
        // Fabricators
        fabricators,
        loadingFabricators,
        getFabricators,
        addFabricator,

        // Cloths
        cloths,
        loadingCloths,
        getCloths,
        addCloth,

        // Designs
        designs,
        loadingDesigns,
        getDesigns,
        addDesign,

        // Mills
        mills,
        loadingMills,
        getMills,
        addMill,

        // Cloth Buy Agents
        clothBuyAgents,
        loadingAgents,
        getClothBuyAgents,
        addClothBuyAgent,

      }}
    >
      {children}
    </ProdManagerContext.Provider>
  );
};

export const useProdManager = () => useContext(ProdManagerContext);
