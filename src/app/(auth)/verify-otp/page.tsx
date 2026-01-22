"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Link as MuiLink,
} from "@mui/material";
import { JsonForms } from "@jsonforms/react";
import { materialRenderers, materialCells } from "@jsonforms/material-renderers";
import { toast } from "sonner";
import { useAuth, getPendingAuthPhone } from "@/lib/core/auth-context";
import { useTenant } from "@/lib/core/tenant-context";

// JSON Schema for OTP form
const otpSchema = {
  type: "object",
  required: ["otp"],
  properties: {
    otp: {
      type: "string",
      title: "Verification Code",
      minLength: 6,
      maxLength: 6,
    },
  },
};

const otpUiSchema = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Control",
      scope: "#/properties/otp",
      options: {
        placeholder: "123456",
      },
    },
  ],
};

export default function VerifyOtpPage() {
  const router = useRouter();
  const { tenant } = useTenant();
  const { verifyOtp, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState<{ otp?: string }>({});
  const [phone, setPhone] = useState<string | null>(null);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);

  // Get phone from pending auth
  useEffect(() => {
    const pendingPhone = getPendingAuthPhone();
    if (!pendingPhone) {
      // No pending auth, redirect to login
      router.replace("/login");
      return;
    }
    setPhone(pendingPhone);
  }, [router]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleSubmit = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    if (!phone) {
      toast.error("Session expired. Please start over.");
      router.replace("/login");
      return;
    }

    try {
      await verifyOtp({
        phone,
        otp: formData.otp,
      });
      toast.success("Phone verified!");
      // Navigation handled by auth context
    } catch {
      // Error is already set in auth context
    }
  };

  const handleResend = async () => {
    if (!phone) return;

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-ID": tenant.id,
        },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        throw new Error("Failed to resend code");
      }

      toast.success("New code sent! Use 123456 for demo.");
      setResendDisabled(true);
      setCountdown(30);
    } catch {
      toast.error("Failed to resend code");
    }
  };

  const maskedPhone = phone
    ? `***-***-${phone.slice(-4)}`
    : "your phone";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.50",
        display: "flex",
        alignItems: "center",
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        {/* Logo/Brand */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            color="primary"
            sx={{ mb: 1 }}
          >
            {tenant.name}
          </Typography>
          <Typography color="text.secondary">
            Verify your phone number
          </Typography>
        </Box>

        {/* OTP Form */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Enter verification code
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            We sent a 6-digit code to {maskedPhone}
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              onClose={clearError}
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>
          )}

          {/* JSON Forms */}
          <Box sx={{ mb: 3 }}>
            <JsonForms
              schema={otpSchema}
              uischema={otpUiSchema}
              data={formData}
              renderers={materialRenderers}
              cells={materialCells}
              onChange={({ data }) => setFormData(data as { otp?: string })}
            />
          </Box>

          {/* Submit Button */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={isLoading || !formData.otp || formData.otp.length !== 6}
            sx={{ mb: 2 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Verify"
            )}
          </Button>

          {/* Resend Link */}
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
          >
            Didn&apos;t receive the code?{" "}
            {resendDisabled ? (
              <span>Resend in {countdown}s</span>
            ) : (
              <MuiLink
                component="button"
                onClick={handleResend}
                sx={{ fontWeight: 500 }}
              >
                Resend code
              </MuiLink>
            )}
          </Typography>
        </Paper>

        {/* Back to Login */}
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mt: 3 }}
        >
          <MuiLink
            href="/login"
            sx={{ color: tenant.branding.primaryColor }}
          >
            Back to login
          </MuiLink>
        </Typography>
      </Container>
    </Box>
  );
}
