"use client";

import { useState } from "react";
import { Box, Typography, Container } from "@mui/material";
import { UsageHistory } from "@/components/selfcare/usage/UsageHistory";
import { UsageFilters } from "@/components/selfcare/usage/UsageFilters";
import { UsageFilters as UsageFiltersType } from "@/types/usage";

export default function UsageHistoryPage() {
  const [filters, setFilters] = useState<UsageFiltersType>({
    type: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  // Build API URL with filters
  const buildApiUrl = () => {
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);

    const queryString = params.toString();
    return queryString ? `/api/usage/history?${queryString}` : "/api/usage/history";
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          Usage History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View detailed history of your usage
        </Typography>
      </Box>

      <UsageFilters filters={filters} onFilterChange={setFilters} />

      <UsageHistory key={buildApiUrl()} apiUrl={buildApiUrl()} />
    </Container>
  );
}
