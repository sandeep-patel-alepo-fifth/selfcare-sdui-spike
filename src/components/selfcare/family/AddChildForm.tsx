"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider,
  Stack,
} from "@mui/material";
import {
  Phone,
  Person,
  FilterList,
  Block,
  DataUsage,
} from "@mui/icons-material";
import { AddChildRequest, ParentalControls } from "@/types/family";

interface AddChildFormProps {
  onSubmit: (data: AddChildRequest) => void;
  onCancel?: () => void;
  submitting?: boolean;
  error?: string;
}

export function AddChildForm({
  onSubmit,
  onCancel,
  submitting = false,
  error,
}: AddChildFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nickname, setNickname] = useState("");
  const [dataLimit, setDataLimit] = useState<string>("");
  const [contentFiltering, setContentFiltering] = useState(false);
  const [purchaseBlocked, setPurchaseBlocked] = useState(false);
  const [internationalBlocked, setInternationalBlocked] = useState(false);
  const [premiumServicesBlocked, setPremiumServicesBlocked] = useState(false);

  const [phoneError, setPhoneError] = useState<string | null>(null);

  const validatePhone = (value: string): boolean => {
    if (!value.trim()) {
      setPhoneError("Phone number is required");
      return false;
    }
    // Simple validation: at least 10 digits
    const digits = value.replace(/\D/g, "");
    if (digits.length < 10) {
      setPhoneError("Please enter a valid phone number");
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(phoneNumber)) {
      return;
    }

    const hasControls = contentFiltering || purchaseBlocked ||
      internationalBlocked || premiumServicesBlocked || dataLimit;

    const controls: ParentalControls | undefined = hasControls
      ? {
          dataLimit: dataLimit ? parseFloat(dataLimit) : null,
          voiceLimit: null,
          smsLimit: null,
          contentFiltering,
          purchaseBlocked,
          internationalBlocked,
          premiumServicesBlocked,
        }
      : undefined;

    const data: AddChildRequest = {
      phoneNumber,
      nickname: nickname || undefined,
      controls,
    };

    onSubmit(data);
  };

  return (
    <Card
      elevation={0}
      sx={{ border: "1px solid", borderColor: "grey.200" }}
      role="form"
    >
      <CardContent>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          Add Child Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Child Information
            </Typography>

            <TextField
              label="Phone Number"
              fullWidth
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (phoneError) {
                  validatePhone(e.target.value);
                }
              }}
              error={!!phoneError}
              helperText={phoneError}
              disabled={submitting}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="Enter child's phone number"
            />

            <TextField
              label="Nickname (optional)"
              fullWidth
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={submitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="Give this account a nickname"
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Parental Controls */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Parental Controls (Optional)
            </Typography>

            <TextField
              label="Data Limit (GB)"
              type="number"
              value={dataLimit}
              onChange={(e) => setDataLimit(e.target.value)}
              disabled={submitting}
              sx={{ mb: 2 }}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DataUsage color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="Leave empty for no limit"
              inputProps={{ min: 0, step: 0.5 }}
            />

            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={contentFiltering}
                    onChange={(e) => setContentFiltering(e.target.checked)}
                    disabled={submitting}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <FilterList fontSize="small" sx={{ mr: 1 }} />
                    Content Filtering
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={purchaseBlocked}
                    onChange={(e) => setPurchaseBlocked(e.target.checked)}
                    disabled={submitting}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Block fontSize="small" sx={{ mr: 1 }} />
                    Block Purchases
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={internationalBlocked}
                    onChange={(e) => setInternationalBlocked(e.target.checked)}
                    disabled={submitting}
                  />
                }
                label="Block International Calls/SMS"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={premiumServicesBlocked}
                    onChange={(e) => setPremiumServicesBlocked(e.target.checked)}
                    disabled={submitting}
                  />
                }
                label="Block Premium Services"
              />
            </Stack>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
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
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={
                submitting ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {submitting ? "Adding..." : "Add Child"}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
