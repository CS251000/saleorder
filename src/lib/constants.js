
export const formattedDate = (date) => {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleString('default', { month: 'short' });
  const year = d.getFullYear();

  // Get ordinal suffix for the day
  const getOrdinal = (n) => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  return `${day}${getOrdinal(day)} ${month},${year}`;
}

  
export const planLimits = {
  EazyCore: {
    employeeLimit:5,
    totalTasksperMonth:150,
    partyLimit:10,
    agentLimit:10,
    designLimit:10,
    clothLimit:20,
    fabricatorLimit:10,
    buyAgentLimit:5,
    jobOrdersPerMonthLimit:50,
    purchaseOrdersPerMonthLimit:35
  },
  EazyPro: {
    employeeLimit:10,
    totalTasksperMonth:300,
    partyLimit:20,
    agentLimit:20,
    designLimit:25,
    clothLimit:40,
    fabricatorLimit:20,
    buyAgentLimit:10,
    jobOrdersPerMonthLimit:125,
    purchaseOrdersPerMonthLimit:90
  },
  EazyElite: {
    employeeLimit:50,
    totalTasksperMonth:1000,
    partyLimit:100,
    agentLimit:100,
    designLimit:100,
    clothLimit:200,
    fabricatorLimit:100,
    buyAgentLimit:50,
    jobOrdersPerMonthLimit:500,
    purchaseOrdersPerMonthLimit:350
  }
}