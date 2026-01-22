"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { toast } from "sonner";
import { JsonForms } from "@jsonforms/react";
import { materialRenderers, materialCells } from "@jsonforms/material-renderers";
import { TenantProvider, getTenant } from "@/lib/sdui/tenant-context";
import type { ScreenConfig } from "@/lib/sdui/types";

// =============================================================================
// Screen Definitions using JSON Schema (Standard!)
// =============================================================================

const ONBOARDING_SCREENS: ScreenConfig[] = [
  {
    id: "phone",
    type: "form",
    title: "Enter Your Phone Number",
    description: "We'll send you a verification code",
    form: {
      schema: {
        type: "object",
        required: ["phone"],
        properties: {
          phone: {
            type: "string",
            title: "Phone Number",
            minLength: 10,
          },
        },
      },
      uiSchema: {
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
      },
    },
    actions: {
      submit: { type: "api", endpoint: "/api/auth/send-otp" },
    },
  },
  {
    id: "otp",
    type: "form",
    title: "Verify Your Phone",
    description: "Enter the 6-digit code we sent you",
    form: {
      schema: {
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
      },
      uiSchema: {
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
      },
    },
    actions: {
      submit: { type: "api", endpoint: "/api/auth/verify-otp" },
    },
  },
  {
    id: "profile",
    type: "form",
    title: "Complete Your Profile",
    description: "Tell us a bit about yourself",
    form: {
      schema: {
        type: "object",
        required: ["firstName", "lastName", "email"],
        properties: {
          firstName: { type: "string", title: "First Name" },
          lastName: { type: "string", title: "Last Name" },
          email: { type: "string", title: "Email", format: "email" },
        },
      },
      uiSchema: {
        type: "VerticalLayout",
        elements: [
          {
            type: "HorizontalLayout",
            elements: [
              { type: "Control", scope: "#/properties/firstName" },
              { type: "Control", scope: "#/properties/lastName" },
            ],
          },
          { type: "Control", scope: "#/properties/email" },
        ],
      },
    },
    actions: {
      submit: { type: "nextStep" },
    },
  },
  {
    id: "plan",
    type: "form",
    title: "Choose Your Plan",
    description: "Select the plan that works for you",
    form: {
      schema: {
        type: "object",
        required: ["plan"],
        properties: {
          planType: {
            type: "string",
            title: "Plan Type",
            enum: ["postpaid", "prepaid"],
            default: "postpaid",
          },
          plan: {
            type: "string",
            title: "Select Plan",
            oneOf: [
              { const: "basic", title: "Basic - $29.99/mo" },
              { const: "premium", title: "Premium Plus - $49.99/mo" },
              { const: "unlimited", title: "Unlimited - $79.99/mo" },
            ],
          },
        },
      },
      uiSchema: {
        type: "VerticalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/planType",
            options: { format: "radio" },
          },
          {
            type: "Control",
            scope: "#/properties/plan",
            options: { format: "radio" },
          },
        ],
      },
    },
    actions: {
      submit: { type: "api", endpoint: "/api/auth/register" },
    },
  },
];

const STEP_LABELS = ["Phone", "Verify", "Profile", "Plan"];

// =============================================================================
// Form Screen Component - Uses local state for form data
// =============================================================================

interface FormScreenProps {
  screen: ScreenConfig;
  initialData: Record<string, unknown>;
  onSuccess: (data: Record<string, unknown>) => void;
  onBack: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

function FormScreen({
  screen,
  initialData,
  onSuccess,
  onBack,
  canGoBack,
  isLastStep,
}: FormScreenProps) {
  // Use local state for form data to avoid re-render issues
  const [localData, setLocalData] = useState<Record<string, unknown>>(initialData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Keep a ref to the latest data for async operations
  const dataRef = useRef(localData);
  useEffect(() => {
    dataRef.current = localData;
  }, [localData]);

  const handleFormChange = ({ data }: { data: unknown }) => {
    const newData = data as Record<string, unknown>;
    setLocalData(newData);
    setErrors({});
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    const currentData = dataRef.current;

    try {
      // Get the action config
      const actionName = Object.keys(screen.actions || {})[0];
      if (!actionName) {
        onSuccess(currentData);
        return;
      }

      const actionConfig = screen.actions![actionName];

      // Handle different action types
      if (actionConfig.type === "nextStep") {
        onSuccess(currentData);
        return;
      }

      if (actionConfig.endpoint?.includes("send-otp")) {
        const phone = currentData.phone as string;
        if (!phone || phone.length < 10) {
          setErrors({ phone: "Please enter a valid phone number" });
          return;
        }

        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });

        if (!res.ok) {
          setErrors({ phone: "Failed to send verification code" });
          return;
        }

        toast.success("Code sent! Use 123456 for demo.");
        onSuccess(currentData);
        return;
      }

      if (actionConfig.endpoint?.includes("verify-otp")) {
        const otp = currentData.otp as string;
        if (!otp || otp.length !== 6) {
          setErrors({ otp: "Please enter the 6-digit code" });
          return;
        }

        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: currentData.phone, otp }),
        });

        if (!res.ok) {
          setErrors({ otp: "Invalid verification code" });
          return;
        }

        toast.success("Phone verified!");
        onSuccess(currentData);
        return;
      }

      if (actionConfig.endpoint?.includes("register")) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentData),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "Registration failed");
          return;
        }

        toast.success("Welcome! Account created.");
        onSuccess(currentData);
        return;
      }

      // Default: just proceed
      onSuccess(currentData);
    } catch {
      setErrors({ _form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 4 },
        border: "1px solid",
        borderColor: "grey.200",
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {screen.title}
        </Typography>
        {screen.description && (
          <Typography color="text.secondary">{screen.description}</Typography>
        )}
      </Box>

      {/* JSON Forms */}
      {screen.form && (
        <Box sx={{ mb: 3 }}>
          <JsonForms
            schema={screen.form.schema}
            uischema={screen.form.uiSchema}
            data={localData}
            renderers={materialRenderers}
            cells={materialCells}
            onChange={handleFormChange}
          />
        </Box>
      )}

      {/* Errors */}
      {Object.entries(errors).map(([field, message]) => (
        <Alert key={field} severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>
      ))}

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          disabled={!canGoBack}
          sx={{ minWidth: 100 }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : isLastStep ? (
            "Complete"
          ) : (
            "Continue"
          )}
        </Button>
      </Box>
    </Paper>
  );
}

// =============================================================================
// Page Component
// =============================================================================

export default function SimpleOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [collectedData, setCollectedData] = useState<Record<string, unknown>>({});

  const tenant = getTenant("telcomax");
  const currentScreen = ONBOARDING_SCREENS[currentStep];
  const isLastStep = currentStep === ONBOARDING_SCREENS.length - 1;

  // Called when a step completes successfully
  const handleStepSuccess = (stepData: Record<string, unknown>) => {
    // Merge step data with collected data
    const newCollectedData = { ...collectedData, ...stepData };
    setCollectedData(newCollectedData);

    if (isLastStep) {
      // Final step completed - navigate to dashboard
      router.push("/dashboard");
    } else {
      // Move to next step
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <TenantProvider tenant={tenant}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "grey.50",
          py: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 0 },
        }}
      >
        <Container maxWidth="sm">
          {/* Stepper */}
          <Stepper activeStep={currentStep} sx={{ mb: 4 }} alternativeLabel>
            {STEP_LABELS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Form Screen - key ensures fresh instance per step */}
          <FormScreen
            key={currentScreen.id}
            screen={currentScreen}
            initialData={collectedData}
            onSuccess={handleStepSuccess}
            onBack={handleBack}
            canGoBack={currentStep > 0}
            isLastStep={isLastStep}
          />

          {/* Footer */}
          <Typography
            variant="caption"
            display="block"
            textAlign="center"
            color="text.secondary"
            sx={{ mt: 3 }}
          >
            Powered by JSON Forms + MUI
          </Typography>
        </Container>
      </Box>
    </TenantProvider>
  );
}
