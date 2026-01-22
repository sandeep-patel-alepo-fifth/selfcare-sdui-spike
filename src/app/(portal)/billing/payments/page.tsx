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
} from "@mui/material";
import Link from "next/link";
import {
  PaymentForm,
  PaymentHistory,
  SavedPaymentMethods,
} from "@/components/selfcare/billing";
import {
  Payment,
  PaymentRequest,
  SavedPaymentMethod,
  PaymentHistoryResponse,
  PaymentMethodsResponse,
  PaymentResponse,
} from "@/types/billing";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [savedMethods, setSavedMethods] = useState<SavedPaymentMethod[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoadingPayments(true);
      const response = await fetch("/api/billing/payments");
      const data: PaymentHistoryResponse = await response.json();
      setPayments(data.payments);
    } catch {
      setError("Failed to load payment history");
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoadingMethods(true);
      const response = await fetch("/api/billing/payment-methods");
      const data: PaymentMethodsResponse = await response.json();
      setSavedMethods(data.methods);
    } catch {
      setError("Failed to load saved payment methods");
    } finally {
      setLoadingMethods(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchPaymentMethods();
  }, [fetchPayments, fetchPaymentMethods]);

  const handleSubmitPayment = async (paymentData: PaymentRequest) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      const data: PaymentResponse = await response.json();

      if (data.success) {
        setSuccessMessage("Payment successful!");
        fetchPayments(); // Refresh payment history
      } else {
        setError(data.error || "Payment failed");
      }
    } catch {
      setError("Failed to process payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    try {
      const response = await fetch(`/api/billing/payment-methods?id=${methodId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setSavedMethods((prev) => prev.filter((m) => m.id !== methodId));
        setSuccessMessage("Payment method removed");
      } else {
        setError(data.error || "Failed to remove payment method");
      }
    } catch {
      setError("Failed to remove payment method");
    }
  };

  const handleSetDefaultPaymentMethod = async (methodId: string) => {
    // In a real implementation, this would call an API
    setSavedMethods((prev) =>
      prev.map((m) => ({
        ...m,
        isDefault: m.id === methodId,
      }))
    );
    setSuccessMessage("Default payment method updated");
  };

  const handleAddPaymentMethod = () => {
    // This would open a modal or navigate to add payment method
    // For now, just show a message
    setSuccessMessage("Add payment method feature coming soon");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} href="/dashboard" color="inherit" underline="hover">
            Dashboard
          </MuiLink>
          <MuiLink component={Link} href="/billing" color="inherit" underline="hover">
            Billing
          </MuiLink>
          <Typography color="text.primary">Payments</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Make a Payment
          </Typography>
          <Typography color="text.secondary">
            Pay your bill, manage payment methods, and view payment history
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Left Column - Payment Form */}
          <Grid size={{ xs: 12, md: 6 }}>
            <PaymentForm
              onSubmit={handleSubmitPayment}
              savedMethods={savedMethods}
              submitting={submitting}
              error={error || undefined}
            />
          </Grid>

          {/* Right Column - Saved Methods & History */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <SavedPaymentMethods
                methods={savedMethods}
                loading={loadingMethods}
                onDelete={handleDeletePaymentMethod}
                onSetDefault={handleSetDefaultPaymentMethod}
                onAdd={handleAddPaymentMethod}
              />

              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Payment History
                </Typography>
                <PaymentHistory payments={payments} loading={loadingPayments} />
              </Box>
            </Box>
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
