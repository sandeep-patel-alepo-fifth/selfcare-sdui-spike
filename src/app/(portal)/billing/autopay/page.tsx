"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import {
  AutopayStatus,
  AutopayEnrollment,
  AutopaySettings,
  SavedPaymentMethods,
} from "@/components/selfcare/billing";
import {
  AutopayConfig,
  AutopayEnrollRequest,
  AutopayUpdateRequest,
  AutopayResponse,
  SavedPaymentMethod,
  PaymentMethodsResponse,
} from "@/types/billing";

export default function AutopayPage() {
  const [autopayConfig, setAutopayConfig] = useState<AutopayConfig | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const fetchAutopayConfig = useCallback(async () => {
    try {
      const response = await fetch("/api/billing/autopay");
      const data: AutopayResponse = await response.json();
      if (data.success && data.autopay) {
        setAutopayConfig(data.autopay);
      } else {
        throw new Error(data.error || "Failed to load autopay settings");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load autopay settings");
    }
  }, []);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const response = await fetch("/api/billing/payment-methods");
      const data: PaymentMethodsResponse = await response.json();
      setPaymentMethods(data.methods);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payment methods");
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAutopayConfig(), fetchPaymentMethods()]);
      setLoading(false);
    };
    loadData();
  }, [fetchAutopayConfig, fetchPaymentMethods]);

  const handleEnroll = async (data: AutopayEnrollRequest) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/autopay/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result: AutopayResponse = await response.json();

      if (result.success && result.autopay) {
        setAutopayConfig(result.autopay);
        setSuccessMessage("Successfully enrolled in autopay!");
      } else {
        setError(result.error || "Failed to enroll in autopay");
      }
    } catch {
      setError("Failed to enroll in autopay");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data: AutopayUpdateRequest) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/autopay", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result: AutopayResponse = await response.json();

      if (result.success && result.autopay) {
        setAutopayConfig(result.autopay);
        setShowSettings(false);
        setSuccessMessage("Autopay settings updated successfully!");
      } else {
        setError(result.error || "Failed to update autopay settings");
      }
    } catch {
      setError("Failed to update autopay settings");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisable = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/autopay", {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setAutopayConfig((prev) =>
          prev
            ? {
                ...prev,
                enabled: false,
                paymentMethodId: null,
                paymentMethodLabel: null,
                paymentMethodType: null,
                nextScheduledDate: null,
              }
            : null
        );
        setShowSettings(false);
        setSuccessMessage("Autopay has been disabled");
      } else {
        setError(result.error || "Failed to disable autopay");
      }
    } catch {
      setError("Failed to disable autopay");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "grey.50",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const isEnabled = autopayConfig?.enabled ?? false;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink
            component={Link}
            href="/dashboard"
            color="inherit"
            underline="hover"
          >
            Dashboard
          </MuiLink>
          <MuiLink
            component={Link}
            href="/billing"
            color="inherit"
            underline="hover"
          >
            Billing
          </MuiLink>
          <Typography color="text.primary">Autopay</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Autopay
          </Typography>
          <Typography color="text.secondary">
            Set up automatic payments to ensure your bills are paid on time
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Main Column */}
          <Grid size={{ xs: 12, md: 8 }}>
            {isEnabled && !showSettings ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <AutopayStatus
                  config={autopayConfig}
                  onManage={() => setShowSettings(true)}
                />
              </Box>
            ) : isEnabled && showSettings ? (
              <AutopaySettings
                config={autopayConfig!}
                paymentMethods={paymentMethods}
                onUpdate={handleUpdate}
                onDisable={handleDisable}
                onCancel={() => setShowSettings(false)}
                submitting={submitting}
                error={error || undefined}
              />
            ) : (
              <AutopayEnrollment
                paymentMethods={paymentMethods}
                onEnroll={handleEnroll}
                submitting={submitting}
                error={error || undefined}
              />
            )}
          </Grid>

          {/* Side Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <SavedPaymentMethods
              methods={paymentMethods}
              loading={loading}
            />
          </Grid>
        </Grid>

        {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(null)}
          message={successMessage}
        />
      </Container>
    </Box>
  );
}
