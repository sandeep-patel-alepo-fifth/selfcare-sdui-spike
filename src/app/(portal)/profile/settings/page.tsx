"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Container, Typography, Alert, Grid, Breadcrumbs, Link } from "@mui/material";
import NextLink from "next/link";
import { NotificationSettings } from "@/components/selfcare/profile";
import { UserPreferences } from "@/types/profile";
import { useAuth } from "@/lib/core/auth-context";

export default function SettingsPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile/preferences");
      if (!response.ok) {
        throw new Error("Failed to load preferences");
      }
      const data = await response.json();
      setPreferences(data.preferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preferences");
      // Set default preferences on error
      setPreferences({
        language: "en",
        theme: "auto",
        notifications: {
          email: true,
          sms: true,
          push: false,
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleChange = async (newPreferences: UserPreferences) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Optimistically update UI
    setPreferences(newPreferences);

    try {
      const response = await fetch("/api/profile/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPreferences),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      setSuccess("Preferences saved successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences");
      // Revert on error
      fetchPreferences();
    } finally {
      setSaving(false);
    }
  };

  // Create default preferences if none loaded
  const displayPreferences: UserPreferences = preferences || {
    language: user?.preferences?.language || "en",
    theme: "auto",
    notifications: user?.preferences?.notifications || {
      email: true,
      sms: true,
      push: false,
    },
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="md">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={NextLink} href="/profile" underline="hover" color="inherit">
            Profile
          </Link>
          <Typography color="text.primary">Settings</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Settings
          </Typography>
          <Typography color="text.secondary">
            Manage your notification and display preferences
          </Typography>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Settings Form */}
        <Grid container>
          <Grid size={{ xs: 12 }}>
            <NotificationSettings
              preferences={displayPreferences}
              onChange={handleChange}
              loading={loading}
              saving={saving}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
