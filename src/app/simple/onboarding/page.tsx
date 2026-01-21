"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Stepper, Step, StepLabel, Paper } from "@mui/material";
import { toast } from "sonner";
import { JsonForms } from "@jsonforms/react";
import { materialRenderers, materialCells } from "@jsonforms/material-renderers";
import { TenantProvider, getTenant } from "@/lib/sdui-simple/tenant-context";
import { ActionExecutor } from "@/lib/sdui-simple/actions";
import type { ScreenConfig } from "@/lib/sdui-simple/types";

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
      sendOtp: { type: "api", endpoint: "/api/auth/send-otp" },
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
      verifyOtp: { type: "api", endpoint: "/api/auth/verify-otp" },
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
      nextStep: { type: "nextStep" },
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
      register: { type: "api", endpoint: "/api/auth/register" },
    },
  },
];

const STEP_LABELS = ["Phone", "Verify", "Profile", "Plan"];

// =============================================================================
// Page Component
// =============================================================================

export default function SimpleOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tenant = getTenant("telcomax");
  const currentScreen = ONBOARDING_SCREENS[currentStep];

  const handleFormChange = useCallback(({ data }: { data: unknown }) => {
    setFormData((prev) => ({ ...prev, ...(data as Record<string, unknown>) }));
    setErrors({});
  }, []);

  const handleNext = useCallback(async () => {
    setLoading(true);
    setErrors({});

    try {
      // Execute action based on current step
      const actionName = Object.keys(currentScreen.actions || {})[0];

      if (actionName === "sendOtp") {
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: formData.phone }),
        });
        if (!res.ok) {
          setErrors({ phone: "Failed to send code" });
          return;
        }
        toast.success("Code sent! Use 123456 for demo.");
      } else if (actionName === "verifyOtp") {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: formData.phone, otp: formData.otp }),
        });
        if (!res.ok) {
          setErrors({ otp: "Invalid code" });
          return;
        }
        toast.success("Phone verified!");
      } else if (actionName === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            planType: formData.planType || "postpaid",
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "Registration failed");
          return;
        }
        toast.success("Welcome! Account created.");
        router.push("/dashboard");
        return;
      }

      // Go to next step
      if (currentStep < ONBOARDING_SCREENS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [currentStep, currentScreen, formData, router]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  return (
    <TenantProvider tenant={tenant}>
      <ActionExecutor
        tenant={tenant}
        screen={currentScreen}
        state={formData}
        onNavigate={(route) => router.push(route)}
        onNextStep={() => setCurrentStep((p) => Math.min(p + 1, ONBOARDING_SCREENS.length - 1))}
        onPrevStep={() => setCurrentStep((p) => Math.max(p - 1, 0))}
        onToast={(t) => t.type === "success" ? toast.success(t.message) : toast.error(t.message)}
      >
        <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
          <Container maxWidth="sm">
            {/* Stepper */}
            <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
              {STEP_LABELS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Form Card */}
            <Paper elevation={0} sx={{ p: 4, border: "1px solid", borderColor: "grey.200" }}>
              <Box sx={{ mb: 3 }}>
                <Box component="h2" sx={{ fontSize: 24, fontWeight: 600, mb: 1 }}>
                  {currentScreen.title}
                </Box>
                {currentScreen.description && (
                  <Box sx={{ color: "text.secondary" }}>
                    {currentScreen.description}
                  </Box>
                )}
              </Box>

              {/* JSON Forms */}
              {currentScreen.form && (
                <JsonForms
                  schema={currentScreen.form.schema}
                  uischema={currentScreen.form.uiSchema}
                  data={formData}
                  renderers={materialRenderers}
                  cells={materialCells}
                  onChange={handleFormChange}
                />
              )}

              {/* Errors */}
              {Object.entries(errors).map(([field, message]) => (
                <Box key={field} sx={{ color: "error.main", mt: 1, fontSize: 14 }}>
                  {message}
                </Box>
              ))}

              {/* Actions */}
              <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
                <Box
                  component="button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  sx={{
                    px: 3,
                    py: 1.5,
                    bgcolor: "transparent",
                    border: "1px solid",
                    borderColor: "grey.300",
                    borderRadius: 1,
                    cursor: currentStep === 0 ? "not-allowed" : "pointer",
                    opacity: currentStep === 0 ? 0.5 : 1,
                    "&:hover": { bgcolor: currentStep === 0 ? "transparent" : "grey.100" },
                  }}
                >
                  Back
                </Box>
                <Box
                  component="button"
                  onClick={handleNext}
                  disabled={loading}
                  sx={{
                    px: 4,
                    py: 1.5,
                    bgcolor: "primary.main",
                    color: "white",
                    border: "none",
                    borderRadius: 1,
                    fontWeight: 500,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  {loading
                    ? "Loading..."
                    : currentStep === ONBOARDING_SCREENS.length - 1
                    ? "Complete"
                    : "Continue"}
                </Box>
              </Box>
            </Paper>

            {/* Hint */}
            <Box sx={{ mt: 2, textAlign: "center", color: "text.secondary", fontSize: 14 }}>
              Powered by JSON Forms + MUI
            </Box>
          </Container>
        </Box>
      </ActionExecutor>
    </TenantProvider>
  );
}
