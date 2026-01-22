"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { JsonForms } from "@jsonforms/react";
import { materialRenderers, materialCells } from "@jsonforms/material-renderers";
import { toast } from "sonner";
import { useAuth } from "@/lib/core/auth-context";
import { useTenant } from "@/lib/core/tenant-context";

// JSON Schema for login form
const loginSchema = {
  type: "object",
  required: ["phone"],
  properties: {
    phone: {
      type: "string",
      title: "Phone Number",
      minLength: 10,
    },
  },
};

const loginUiSchema = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Control",
      scope: "#/properties/phone",
      options: {
        placeholder: "+1 (555) 000-0000",
      },
    },
  ],
};

export default function LoginPage() {
  const router = useRouter();
  const { tenant } = useTenant();
  const { login, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState<{ phone?: string }>({});

  const handleSubmit = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      const result = await login({
        phone: formData.phone,
        tenantId: tenant.id,
      });

      if (result.requiresOtp) {
        toast.success("Verification code sent! Use 123456 for demo.");
        router.push("/verify-otp");
      }
    } catch {
      // Error is already set in auth context
    }
  };

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
          {tenant.branding.logo ? (
            <Box
              component="img"
              src={tenant.branding.logo}
              alt={tenant.name}
              sx={{ height: 48, mb: 2 }}
            />
          ) : (
            <Typography
              variant="h4"
              fontWeight={700}
              color="primary"
              sx={{ mb: 1 }}
            >
              {tenant.name}
            </Typography>
          )}
          <Typography color="text.secondary">
            Sign in to your account
          </Typography>
        </Box>

        {/* Login Form */}
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
            Welcome back
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Enter your phone number to continue
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
              schema={loginSchema}
              uischema={loginUiSchema}
              data={formData}
              renderers={materialRenderers}
              cells={materialCells}
              onChange={({ data }) => setFormData(data as { phone?: string })}
            />
          </Box>

          {/* Submit Button */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={isLoading || !formData.phone}
            sx={{ mb: 2 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Continue"
            )}
          </Button>

          {/* Register Link */}
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/onboarding"
              style={{ color: tenant.branding.primaryColor, fontWeight: 500 }}
            >
              Sign up
            </Link>
          </Typography>
        </Paper>

        {/* Footer */}
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          textAlign="center"
          sx={{ mt: 3 }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Typography>
      </Container>
    </Box>
  );
}
