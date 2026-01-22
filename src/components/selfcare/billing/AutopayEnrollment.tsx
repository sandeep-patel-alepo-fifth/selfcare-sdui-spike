"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  SavedPaymentMethod,
  AutopayEnrollRequest,
  AutopayScheduleType,
} from "@/types/billing";

interface AutopayEnrollmentProps {
  paymentMethods: SavedPaymentMethod[];
  onEnroll: (data: AutopayEnrollRequest) => void;
  onCancel?: () => void;
  submitting?: boolean;
  error?: string;
}

interface FormErrors {
  paymentMethodId?: string;
  dayOfMonth?: string;
  thresholdAmount?: string;
}

export function AutopayEnrollment({
  paymentMethods,
  onEnroll,
  onCancel,
  submitting = false,
  error,
}: AutopayEnrollmentProps) {
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [scheduleType, setScheduleType] = useState<AutopayScheduleType>("due_date");
  const [dayOfMonth, setDayOfMonth] = useState<string>("");
  const [thresholdAmount, setThresholdAmount] = useState<string>("");
  const [maxPaymentAmount, setMaxPaymentAmount] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!paymentMethodId) {
      errors.paymentMethodId = "Payment method is required";
    }

    if (scheduleType === "day_of_month") {
      if (!dayOfMonth) {
        errors.dayOfMonth = "Day of month is required";
      } else {
        const day = parseInt(dayOfMonth, 10);
        if (isNaN(day) || day < 1 || day > 28) {
          errors.dayOfMonth = "Day must be between 1 and 28";
        }
      }
    }

    if (scheduleType === "threshold") {
      if (!thresholdAmount) {
        errors.thresholdAmount = "Threshold amount is required";
      } else {
        const amount = parseFloat(thresholdAmount);
        if (isNaN(amount) || amount <= 0) {
          errors.thresholdAmount = "Threshold must be a positive number";
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const enrollData: AutopayEnrollRequest = {
      paymentMethodId,
      scheduleType,
    };

    if (scheduleType === "day_of_month" && dayOfMonth) {
      enrollData.dayOfMonth = parseInt(dayOfMonth, 10);
    }

    if (scheduleType === "threshold" && thresholdAmount) {
      enrollData.thresholdAmount = parseFloat(thresholdAmount);
    }

    if (maxPaymentAmount) {
      const maxAmount = parseFloat(maxPaymentAmount);
      if (!isNaN(maxAmount) && maxAmount > 0) {
        enrollData.maxPaymentAmount = maxAmount;
      }
    }

    onEnroll(enrollData);
  };

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Enroll in Autopay
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Set up automatic payments to never miss a due date.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Payment Method Selection */}
          <FormControl
            fullWidth
            sx={{ mb: 3 }}
            error={!!formErrors.paymentMethodId}
          >
            <InputLabel id="payment-method-label">Payment Method</InputLabel>
            <Select
              labelId="payment-method-label"
              id="payment-method"
              value={paymentMethodId}
              label="Payment Method"
              onChange={(e) => {
                setPaymentMethodId(e.target.value);
                setFormErrors((prev) => ({ ...prev, paymentMethodId: undefined }));
              }}
              disabled={submitting}
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method.id} value={method.id}>
                  {method.label}
                </MenuItem>
              ))}
            </Select>
            {formErrors.paymentMethodId && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {formErrors.paymentMethodId}
              </Typography>
            )}
          </FormControl>

          {/* Schedule Type Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="schedule-type-label">Schedule Type</InputLabel>
            <Select
              labelId="schedule-type-label"
              id="schedule-type"
              value={scheduleType}
              label="Schedule Type"
              onChange={(e) => {
                setScheduleType(e.target.value as AutopayScheduleType);
                setFormErrors({});
              }}
              disabled={submitting}
            >
              <MenuItem value="due_date">On Due Date</MenuItem>
              <MenuItem value="day_of_month">Specific Day of Month</MenuItem>
              <MenuItem value="threshold">Balance Threshold</MenuItem>
            </Select>
          </FormControl>

          {/* Day of Month (conditional) */}
          {scheduleType === "day_of_month" && (
            <TextField
              fullWidth
              label="Day of Month"
              type="number"
              value={dayOfMonth}
              onChange={(e) => {
                setDayOfMonth(e.target.value);
                setFormErrors((prev) => ({ ...prev, dayOfMonth: undefined }));
              }}
              error={!!formErrors.dayOfMonth}
              helperText={formErrors.dayOfMonth || "Choose 1-28 to avoid month-end issues"}
              slotProps={{
                htmlInput: { min: 1, max: 28 },
              }}
              sx={{ mb: 3 }}
              disabled={submitting}
            />
          )}

          {/* Threshold Amount (conditional) */}
          {scheduleType === "threshold" && (
            <TextField
              fullWidth
              label="Threshold Amount"
              type="number"
              value={thresholdAmount}
              onChange={(e) => {
                setThresholdAmount(e.target.value);
                setFormErrors((prev) => ({ ...prev, thresholdAmount: undefined }));
              }}
              error={!!formErrors.thresholdAmount}
              helperText={formErrors.thresholdAmount || "Pay when balance exceeds this amount"}
              slotProps={{
                htmlInput: { min: 0, step: 0.01 },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 3 }}
              disabled={submitting}
            />
          )}

          {/* Max Payment Amount (optional) */}
          <TextField
            fullWidth
            label="Maximum Payment (Optional)"
            type="number"
            value={maxPaymentAmount}
            onChange={(e) => setMaxPaymentAmount(e.target.value)}
            helperText="Cap each autopay transaction at this amount"
            slotProps={{
              htmlInput: { min: 0, step: 0.01 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              },
            }}
            sx={{ mb: 3 }}
            disabled={submitting}
          />

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ flex: 1 }}
            >
              {submitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Enrolling...
                </>
              ) : (
                "Enroll in Autopay"
              )}
            </Button>
            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
