"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  ArrowForward as ArrowIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { Plan, PlanSwitchRequest, PlanSwitchResponse } from "@/types/plans";

interface PlanSwitchFlowProps {
  currentPlan: Plan;
  newPlan: Plan;
  onSwitch: (request: PlanSwitchRequest) => Promise<PlanSwitchResponse>;
  onCancel: () => void;
  onComplete?: () => void;
}

const steps = ["Select Plan", "Confirm", "Result"];

function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function PlanSwitchFlow({
  currentPlan,
  newPlan,
  onSwitch,
  onCancel,
  onComplete,
}: PlanSwitchFlowProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [effectiveDate, setEffectiveDate] = useState<"immediate" | "next_billing_cycle">(
    "next_billing_cycle"
  );
  const [keepAddons, setKeepAddons] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlanSwitchResponse | null>(null);

  const priceDifference = newPlan.price - currentPlan.price;

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleConfirmSwitch = async () => {
    setLoading(true);
    try {
      const request: PlanSwitchRequest = {
        currentPlanId: currentPlan.id,
        newPlanId: newPlan.id,
        effectiveDate,
        keepAddons,
      };
      const response = await onSwitch(request);
      setResult(response);
      setActiveStep(2);
    } catch (error) {
      setResult({
        success: false,
        error: "An unexpected error occurred. Please try again.",
      });
      setActiveStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const renderStep1 = () => (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Compare Your Plans
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        {/* Current Plan */}
        <Card variant="outlined" sx={{ flex: 1, p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Current Plan
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            {currentPlan.name}
          </Typography>
          <Typography variant="h5" color="primary" fontWeight={700}>
            {formatCurrency(currentPlan.price, currentPlan.currency)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            /month
          </Typography>
        </Card>

        <ArrowIcon color="primary" fontSize="large" />

        {/* New Plan */}
        <Card
          variant="outlined"
          sx={{ flex: 1, p: 2, borderColor: "primary.main", borderWidth: 2 }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            New Plan
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            {newPlan.name}
          </Typography>
          <Typography variant="h5" color="primary" fontWeight={700}>
            {formatCurrency(newPlan.price, newPlan.currency)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            /month
          </Typography>
        </Card>
      </Box>

      {/* Price Difference */}
      <Alert
        severity={priceDifference > 0 ? "info" : "success"}
        sx={{ mb: 3 }}
      >
        {priceDifference > 0 ? (
          <>
            Your monthly bill will increase by{" "}
            <strong>+{formatCurrency(priceDifference, newPlan.currency)}</strong>
          </>
        ) : priceDifference < 0 ? (
          <>
            Your monthly bill will decrease by{" "}
            <strong>{formatCurrency(Math.abs(priceDifference), newPlan.currency)}</strong>
          </>
        ) : (
          <>No change in your monthly bill</>
        )}
      </Alert>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleNext}>
          Continue
        </Button>
      </Box>
    </Box>
  );

  const renderStep2 = () => (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Confirm Your Switch
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        You are switching from <strong>{currentPlan.name}</strong> to{" "}
        <strong>{newPlan.name}</strong>
      </Alert>

      <FormControl component="fieldset" sx={{ mb: 3, width: "100%" }}>
        <FormLabel component="legend">When should the switch take effect?</FormLabel>
        <RadioGroup
          value={effectiveDate}
          onChange={(e) =>
            setEffectiveDate(e.target.value as "immediate" | "next_billing_cycle")
          }
        >
          <FormControlLabel
            value="immediate"
            control={<Radio />}
            label="Immediate - Switch now (may result in prorated charges)"
          />
          <FormControlLabel
            value="next_billing_cycle"
            control={<Radio />}
            label="Next Billing Cycle - Switch on your next billing date"
          />
        </RadioGroup>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Summary
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            New Plan:
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {newPlan.name}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            New Monthly Cost:
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {formatCurrency(newPlan.price, newPlan.currency)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            Effective:
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {effectiveDate === "immediate" ? "Immediately" : "Next Billing Cycle"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button onClick={handleBack}>Back</Button>
        <Button
          variant="contained"
          onClick={handleConfirmSwitch}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Confirm Switch"}
        </Button>
      </Box>
    </Box>
  );

  const renderStep3 = () => (
    <Box sx={{ textAlign: "center" }}>
      {result?.success ? (
        <>
          <SuccessIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Success!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {result.message || "Your plan has been switched successfully."}
          </Typography>
          {result.effectiveDate && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Your new plan will be effective from{" "}
              {new Date(result.effectiveDate).toLocaleDateString()}
            </Alert>
          )}
        </>
      ) : (
        <>
          <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Switch Failed
          </Typography>
          <Typography variant="body1" color="error" sx={{ mb: 3 }}>
            {result?.error || "Unable to switch plan. Please try again."}
          </Typography>
        </>
      )}

      <Button variant="contained" onClick={handleDone}>
        Done
      </Button>
    </Box>
  );

  if (loading && activeStep === 1) {
    return (
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Processing your request...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
      <CardContent>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                {label}
                {index === activeStep && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    Step {index + 1} of {steps.length}
                  </Typography>
                )}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        {activeStep === 0 && renderStep1()}
        {activeStep === 1 && renderStep2()}
        {activeStep === 2 && renderStep3()}
      </CardContent>
    </Card>
  );
}
