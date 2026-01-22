"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Tabs,
  Tab,
  Skeleton,
  Card,
} from "@mui/material";
import { Addon, AddonType } from "@/types/plans";
import { AddonCard } from "./AddonCard";

interface AddonListProps {
  addons: Addon[];
  onAddAddon?: (addon: Addon) => void;
  activeAddonIds?: string[];
  showFilters?: boolean;
  loading?: boolean;
  title?: string;
}

type FilterValue = "all" | AddonType;

const filterTabs: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "data", label: "Data" },
  { value: "voice", label: "Voice" },
  { value: "sms", label: "SMS" },
  { value: "roaming", label: "Roaming" },
  { value: "entertainment", label: "Entertainment" },
  { value: "security", label: "Security" },
];

function AddonSkeleton() {
  return (
    <Card
      variant="outlined"
      sx={{ p: 2, height: 200 }}
      data-testid="addon-skeleton"
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2 }}>
        <Skeleton variant="rectangular" width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={20} />
        </Box>
      </Box>
      <Skeleton variant="text" width="100%" height={20} />
      <Skeleton variant="text" width="80%" height={20} />
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Skeleton variant="text" width="30%" height={32} />
        <Skeleton variant="rectangular" width={60} height={32} />
      </Box>
    </Card>
  );
}

export function AddonList({
  addons,
  onAddAddon,
  activeAddonIds = [],
  showFilters = false,
  loading = false,
  title,
}: AddonListProps) {
  const [filter, setFilter] = useState<FilterValue>("all");

  // Get available filter tabs based on actual addon types
  const availableFilters = useMemo(() => {
    if (!showFilters) return [];
    const addonTypes = new Set(addons.map((a) => a.type));
    return filterTabs.filter(
      (tab) => tab.value === "all" || addonTypes.has(tab.value as AddonType)
    );
  }, [addons, showFilters]);

  // Filter addons based on selected type
  const filteredAddons = useMemo(() => {
    if (filter === "all") return addons;
    return addons.filter((addon) => addon.type === filter);
  }, [addons, filter]);

  const handleFilterChange = (_event: React.SyntheticEvent, newValue: FilterValue) => {
    setFilter(newValue);
  };

  const handleAddAddon = (addon: Addon) => {
    if (onAddAddon) {
      onAddAddon(addon);
    }
  };

  if (loading) {
    return (
      <Box>
        {title && (
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            {title}
          </Typography>
        )}
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <AddonSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (addons.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No add-ons available at this time.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {title && (
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}

      {showFilters && availableFilters.length > 1 && (
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={filter}
            onChange={handleFilterChange}
            aria-label="filter addons by type"
          >
            {availableFilters.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </Tabs>
        </Box>
      )}

      <Grid container spacing={2}>
        {filteredAddons.map((addon) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={addon.id}>
            <AddonCard
              addon={addon}
              onAdd={handleAddAddon}
              isActive={activeAddonIds.includes(addon.id)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
