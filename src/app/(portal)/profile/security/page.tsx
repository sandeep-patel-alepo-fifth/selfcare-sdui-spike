"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Alert,
  Grid,
  Breadcrumbs,
  Link,
} from "@mui/material";
import NextLink from "next/link";
import { SecuritySettings, SessionList } from "@/components/selfcare/profile";
import { MfaSettings, Session } from "@/types/profile";
import { useAuth } from "@/lib/core/auth-context";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SecurityPage() {
  const { user } = useAuth();
  const [mfaSettings, setMfaSettings] = useState<MfaSettings | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSecurityData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mfaResponse, sessionsResponse] = await Promise.all([
        fetch("/api/profile/mfa"),
        fetch("/api/profile/sessions"),
      ]);

      if (mfaResponse.ok) {
        const mfaData = await mfaResponse.json();
        setMfaSettings(mfaData.mfa);
      } else {
        // Set defaults if API fails
        setMfaSettings({
          enabled: user?.mfaEnabled || false,
          method: "sms",
          phone: user?.phone,
          email: user?.email || undefined,
        });
      }

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.sessions);
      } else {
        // Set current session as fallback
        setSessions([
          {
            id: "current",
            device: "Current Device",
            browser: "Current Browser",
            location: "Unknown",
            ipAddress: "127.0.0.1",
            lastActive: new Date().toISOString(),
            current: true,
          },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load security data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  const handlePasswordChange = async (data: PasswordFormData) => {
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to change password");
      }

      setSuccess("Password changed successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
      throw err;
    }
  };

  const handleMfaToggle = async (enabled: boolean) => {
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/profile/mfa", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) {
        throw new Error("Failed to update MFA settings");
      }

      setMfaSettings((prev) => (prev ? { ...prev, enabled } : null));
      setSuccess(
        enabled
          ? "Two-factor authentication enabled"
          : "Two-factor authentication disabled"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update MFA settings");
    }
  };

  const handleSessionLogout = async (sessionId: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/profile/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to logout session");
      }

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setSuccess("Session logged out successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to logout session");
    }
  };

  // Default MFA settings if none loaded
  const displayMfaSettings: MfaSettings = mfaSettings || {
    enabled: false,
    method: "sms",
    phone: user?.phone,
    email: user?.email || undefined,
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="md">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={NextLink} href="/profile" underline="hover" color="inherit">
            Profile
          </Link>
          <Typography color="text.primary">Security</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Security
          </Typography>
          <Typography color="text.secondary">
            Manage your password, two-factor authentication, and active sessions
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

        {/* Security Settings */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <SecuritySettings
              mfaSettings={displayMfaSettings}
              onPasswordChange={handlePasswordChange}
              onMfaToggle={handleMfaToggle}
              loading={loading}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SessionList
              sessions={sessions}
              onLogout={handleSessionLogout}
              loading={loading}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
