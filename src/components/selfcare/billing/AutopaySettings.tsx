"use client";

import { useState, useEffect } from "react";
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
  Divider,
} from "@mui/material";
import {
  SavedPaymentMethod,
  AutopayConfig,
  AutopayUpdateRequest,
  AutopayScheduleType,
} from "@/types/billing";

interface AutopaySettingsProps {
  config: AutopayConfig;
  paymentMethods: SavedPaymentMethod[];
  onUpdate: (data: AutopayUpdateRequest) => void;
  onDisable: () => void;
  onCancel?: () => void;
  submitting?: boolean;
  error?: string;
}

export function AutopaySettings({
  config,
  paymentMethods,
  onUpdate,
  onDisable,
  onCancel,
  submitting = false,
  error,
}: AutopaySettingsProps) {
  const [paymentMethodId, setPaymentMethodId] = useState<string>(
    config.paymentMethodId || ""
  );
  const [scheduleType, setScheduleType] = useState<AutopayScheduleType>(
    config.scheduleType
  );
  const [dayOfMonth, setDayOfMonth] = useState<string>(
    config.dayOfMonth?.toString() || ""
  );
  const [thresholdAmount, setThresholdAmount] = useState<string>(
    config.thresholdAmount?.toString() || ""
  );
  const [maxPaymentAmount, setMaxPaymentAmount] = useState<string>(
    config.maxPaymentAmount?.toString() || ""
  );

  // Reset form when config changes
  useEffect(() => {
    setPaymentMethodId(config.paymentMethodId || "");
    setScheduleType(config.scheduleType);
    setDayOfMonth(config.dayOfMonth?.toString() || "");
    setThresholdAmount(config.thresholdAmount?.toString() || "");
    setMaxPaymentAmount(config.maxPaymentAmount?.toString() || "");
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: AutopayUpdateRequest = {};

    if (paymentMethodId !== config.paymentMethodId) {
      updateData.paymentMethodId = paymentMethodId;
    }

    if (scheduleType !== config.scheduleType) {
      updateData.scheduleType = scheduleType;
    }

    if (scheduleType === "day_of_month" && dayOfMonth) {
      const day = parseInt(dayOfMonth, 10);
      if (day !== config.dayOfMonth) {
        updateData.dayOfMonth = day;
      }
    }

    if (scheduleType === "threshold" && thresholdAmount) {
      const threshold = parseFloat(thresholdAmount);
      if (threshold !== config.thresholdAmount) {
        updateData.thresholdAmount = threshold;
      }
    }

    if (maxPaymentAmount) {
      const maxAmount = parseFloat(maxPaymentAmount);
      if (maxAmount !== config.maxPaymentAmount) {
        updateData.maxPaymentAmount = maxAmount;
      }
    } else if (config.maxPaymentAmount) {
      // User cleared the max amount
      updateData.maxPaymentAmount = undefined;
    }

    onUpdate(updateData);
  };

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Autopay Settings
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage your automatic payment settings.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Payment Method Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="settings-payment-method-label">
              Payment Method
            </InputLabel>
            <Select
              labelId="settings-payment-method-label"
              id="settings-payment-method"
              value={paymentMethodId}
              label="Payment Method"
              onChange={(e) => setPaymentMethodId(e.target.value)}
              disabled={submitting}
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method.id} value={method.id}>
                  {method.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Schedule Type Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="settings-schedule-type-label">
              Schedule Type
            </InputLabel>
            <Select
              labelId="settings-schedule-type-label"
              id="settings-schedule-type"
              value={scheduleType}
              label="Schedule Type"
              onChange={(e) => {
                setScheduleType(e.target.value as AutopayScheduleType);
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
              onChange={(e) => setDayOfMonth(e.target.value)}
              helperText="Choose 1-28 to avoid month-end issues"
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
              onChange={(e) => setThresholdAmount(e.target.value)}
              helperText="Pay when balance exceeds this amount"
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

          <Divider sx={{ my: 3 }} />

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ flex: 1, minWidth: "140px" }}
            >
              {submitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : (
                "Save Changes"
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
            <Button
              variant="outlined"
              color="error"
              onClick={onDisable}
              disabled={submitting}
            >
              Disable Autopay
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
