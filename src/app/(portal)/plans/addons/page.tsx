"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import Link from "next/link";
import { AddonList } from "@/components/selfcare/plans";
import { Addon, AddonListResponse, AddonSubscribeResponse } from "@/types/plans";

export default function AddonsPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAddonIds] = useState<string[]>(["addon-008"]); // Mock active addons
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    async function fetchAddons() {
      try {
        const response = await fetch("/api/plans/addons");
        const data: AddonListResponse = await response.json();
        setAddons(data.addons);
      } catch (error) {
        console.error("Failed to fetch addons:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAddons();
  }, []);

  const handleAddAddon = async (addon: Addon) => {
    try {
      const response = await fetch("/api/plans/addons/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addonId: addon.id,
          autoRenew: addon.recurring,
        }),
      });

      const result: AddonSubscribeResponse = await response.json();

      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message || `Successfully added ${addon.name}!`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: result.error || "Failed to add addon",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "An error occurred. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} href="/dashboard" color="inherit" underline="hover">
            Dashboard
          </MuiLink>
          <MuiLink component={Link} href="/plans" color="inherit" underline="hover">
            Plans
          </MuiLink>
          <Typography color="text.primary">Add-ons</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Available Add-ons
          </Typography>
          <Typography color="text.secondary">
            Enhance your plan with additional features and services
          </Typography>
        </Box>

        {/* Active Addons Info */}
        {activeAddonIds.length > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You have {activeAddonIds.length} active add-on(s). Active add-ons are marked below.
          </Alert>
        )}

        {/* Addons List */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <AddonList
            addons={addons}
            onAddAddon={handleAddAddon}
            activeAddonIds={activeAddonIds}
            showFilters
          />
        )}

        {/* Snackbar for feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
