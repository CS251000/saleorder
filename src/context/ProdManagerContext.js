"use client";

import { createContext, useContext, useCallback } from "react";
import useSWR, { mutate } from "swr";
import { useGlobalUser } from "./UserContext";

const ProdManagerContext = createContext();

export const ProdManagerProvider = ({ children }) => {
  const { currentUser } = useGlobalUser();
  const managerId = currentUser?.id;

  // Global fetcher for all APIs
  const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch: " + url);
    return res.json();
  };

  /* ----------------------------- 🧵 FABRICATORS ----------------------------- */
  const {
    data: fabricatorData,
    error: fabricatorError,
    isLoading: loadingFabricators,
    mutate: mutateFabricators,
  } = useSWR(
    managerId ? `/api/fabricators?managerId=${managerId}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60 * 1000, // 1 min
    }
  );

  const getFabricators = useCallback(() => mutateFabricators(), [mutateFabricators]);

  const addFabricator = useCallback(
    async (name) => {
      if (!name || !managerId) return;
      const res = await fetch("/api/fabricators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fabricatorName: name, managerId }),
      });
      const data = await res.json();
      if (res.ok) {
        const newFabricator = {
          id: data.fabricator.fabricatorId,
          name,
          total: 0,
          dispatched: 0,
          pending: 0,
        };
        // Optimistic update
        mutateFabricators(
          (prev) => ({ fabricators: [...(prev?.fabricators || []), newFabricator] }),
          false
        );
        // Background revalidation
        mutateFabricators();
        return newFabricator;
      } else console.error("Error adding fabricator:", data.error);
    },
    [managerId, mutateFabricators]
  );

  /* ------------------------------- 👕 CLOTHS ------------------------------- */
  const {
    data: clothData,
    error: clothError,
    isLoading: loadingCloths,
    mutate: mutateCloths,
  } = useSWR(
    managerId ? `/api/cloths?managerId=${managerId}` : null,
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 60 * 1000 }
  );

  const getCloths = useCallback(() => mutateCloths(), [mutateCloths]);

  const addCloth = useCallback(
    async (name) => {
      if (!name || !managerId) return;
      const res = await fetch("/api/cloths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clothName: name, managerId }),
      });
      const data = await res.json();
      if (res.ok) {
        const newCloth = { id: data.cloth.clothId, name };
        mutateCloths(
          (prev) => ({ clothsList: [...(prev?.clothsList || []), newCloth] }),
          false
        );
        mutateCloths();
        return newCloth;
      } else console.error("Error adding cloth:", data.error);
    },
    [managerId, mutateCloths]
  );

  /* ----------------------------- 🎨 DESIGNS ----------------------------- */
  const {
    data: designData,
    error: designError,
    isLoading: loadingDesigns,
    mutate: mutateDesigns,
  } = useSWR(
    managerId ? `/api/designs?managerId=${managerId}` : null,
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 60 * 1000 }
  );

  const getDesigns = useCallback(() => mutateDesigns(), [mutateDesigns]);

  const addDesign = useCallback(
    async (name) => {
      if (!name || !managerId) return;
      const res = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designName: name, managerId }),
      });
      const data = await res.json();
      if (res.ok) {
        const newDesign = { id: data.design.designId, name };
        mutateDesigns(
          (prev) => ({ designs: [...(prev?.designs || []), newDesign] }),
          false
        );
        mutateDesigns();
        return newDesign;
      } else console.error("Error adding design:", data.error);
    },
    [managerId, mutateDesigns]
  );

  /* ----------------------------- 🏭 Categories ----------------------------- */
  const {
    data: categoryData,
    error: categoryError,
    isLoading: loadingCategories,
    mutate: mutateCategories,
  } = useSWR(
    managerId ? `/api/category?managerId=${managerId}` : null,
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 60 * 1000 }
  );

  const getCategories = useCallback(() => mutateCategories(), [mutateCategories]);

  const addCategory = useCallback(
    async (name) => {
      if (!name || !managerId) return;
      const res = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName: name, managerId }),
      });
      const data = await res.json();
      if (res.ok) {
        const newCategory = { id: data.category.categoryId, name };
        mutateCategories(
          (prev) => ({ categories: [...(prev?.categories || []), newCategory] }),
          false
        );
        mutateCategories();
        return newCategory;
      } else console.error("Error adding category:", data.error);
    },
    [managerId, mutateCategories]
  );

  /* -------------------------- 🧾 CLOTH BUY AGENTS -------------------------- */
  const {
    data: agentData,
    error: agentError,
    isLoading: loadingAgents,
    mutate: mutateAgents,
  } = useSWR(
    managerId ? `/api/clothBuyAgents?managerId=${managerId}` : null,
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 60 * 1000 }
  );

  const getClothBuyAgents = useCallback(() => mutateAgents(), [mutateAgents]);

  const addClothBuyAgent = useCallback(
    async (name) => {
      if (!name || !managerId) return;
      const res = await fetch("/api/clothBuyAgents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentName: name, managerId }),
      });
      const data = await res.json();
      if (res.ok) {
        const newAgent = { id: data.clothBuyAgent.agentId, name };
        mutateAgents(
          (prev) => ({ agents: [...(prev?.agents || []), newAgent] }),
          false
        );
        mutateAgents();
        return newAgent;
      } else console.error("Error adding agent:", data.error);
    },
    [managerId, mutateAgents]
  );

  /* ----------------------------- 🚀 Context Value ----------------------------- */
  return (
    <ProdManagerContext.Provider
      value={{
        // Fabricators
        fabricators: fabricatorData?.fabricators || [],
        loadingFabricators,
        getFabricators,
        addFabricator,

        // Cloths
        cloths: clothData?.clothsList || [],
        loadingCloths,
        getCloths,
        addCloth,

        // Designs
        designs: designData?.designs || [],
        loadingDesigns,
        getDesigns,
        addDesign,
        
        // Categories
        categories: categoryData?.categories || [],
        loadingCategories,
        getCategories,
        addCategory,

        // Cloth Buy Agents
        clothBuyAgents: agentData?.agents || [],
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
