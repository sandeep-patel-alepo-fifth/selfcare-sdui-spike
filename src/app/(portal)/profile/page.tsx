"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Container, Typography, Alert, Grid } from "@mui/material";
import { ProfileForm } from "@/components/selfcare/profile";
import { Profile, ProfileUpdate } from "@/types/profile";
import { useAuth } from "@/lib/core/auth-context";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        throw new Error("Failed to load profile");
      }
      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (data: ProfileUpdate) => {
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const result = await response.json();
      setProfile(result.profile);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
      throw err;
    }
  };

  // Create initial profile from auth user if API hasn't loaded yet
  const displayProfile: Profile | null = profile || (user ? {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email || null,
    phone: user.phone,
    address: undefined,
    avatarUrl: null,
  } : null);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            My Profile
          </Typography>
          <Typography color="text.secondary">
            Manage your personal information
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

        {/* Profile Form */}
        <Grid container>
          <Grid size={{ xs: 12 }}>
            {displayProfile && (
              <ProfileForm
                profile={displayProfile}
                onSave={handleSave}
                loading={loading}
              />
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
