"use client";

import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import { Clear } from "@mui/icons-material";
import { UsageFilters as UsageFiltersType, UsageType } from "@/types/usage";

interface UsageFiltersProps {
  filters: UsageFiltersType;
  onFilterChange: (filters: UsageFiltersType) => void;
}

const usageTypes: { value: UsageType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "data", label: "Data" },
  { value: "voice", label: "Voice" },
  { value: "sms", label: "SMS" },
  { value: "roaming", label: "Roaming" },
];

function hasActiveFilters(filters: UsageFiltersType): boolean {
  return Boolean(filters.type || filters.startDate || filters.endDate);
}

export function UsageFilters({ filters, onFilterChange }: UsageFiltersProps) {
  const handleTypeChange = (value: string) => {
    onFilterChange({
      ...filters,
      type: value === "all" ? undefined : (value as UsageType),
    });
  };

  const handleStartDateChange = (value: string) => {
    onFilterChange({
      ...filters,
      startDate: value || undefined,
    });
  };

  const handleEndDateChange = (value: string) => {
    onFilterChange({
      ...filters,
      endDate: value || undefined,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      type: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="usage-type-label">Usage Type</InputLabel>
            <Select
              labelId="usage-type-label"
              id="usage-type-select"
              value={filters.type || "all"}
              label="Usage Type"
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              {usageTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Start Date"
            value={filters.startDate || ""}
            onChange={(e) => handleStartDateChange(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="End Date"
            value={filters.endDate || ""}
            onChange={(e) => handleEndDateChange(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />
        </Grid>
        {hasActiveFilters(filters) && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleClearFilters}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
