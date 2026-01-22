"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Skeleton,
  Grid,
  Divider,
  Alert,
} from "@mui/material";
import { Security, Lock, VerifiedUser } from "@mui/icons-material";
import { MfaSettings, PasswordChangeSchema } from "@/types/profile";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SecuritySettingsProps {
  mfaSettings: MfaSettings;
  onPasswordChange: (data: PasswordFormData) => Promise<void> | void;
  onMfaToggle: (enabled: boolean) => Promise<void> | void;
  loading?: boolean;
}

export function SecuritySettings({
  mfaSettings,
  onPasswordChange,
  onMfaToggle,
  loading = false,
}: SecuritySettingsProps) {
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isFormFilled =
    passwordForm.currentPassword.length > 0 &&
    passwordForm.newPassword.length > 0 &&
    passwordForm.confirmPassword.length > 0;

  const handlePasswordFieldChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validatePasswordForm = (): boolean => {
    const result = PasswordChangeSchema.safeParse(passwordForm);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join(".");
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handlePasswordSubmit = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setSaving(true);
    try {
      await onPasswordChange(passwordForm);
      // Clear form on success
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMfaToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await onMfaToggle(event.target.checked);
  };

  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "grey.200" }}
        data-testid="security-settings-skeleton"
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={200} />
          </Box>
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={56}
              sx={{ mb: 2, borderRadius: 1 }}
            />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Security color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Security Settings</Typography>
        </Box>

        {/* Change Password Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Lock color="action" sx={{ mr: 1 }} />
            <Typography variant="subtitle1">Change Password</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  handlePasswordFieldChange("currentPassword", e.target.value)
                }
                error={!!errors.currentPassword}
                helperText={errors.currentPassword}
                disabled={saving}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="password"
                label="New Password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  handlePasswordFieldChange("newPassword", e.target.value)
                }
                error={!!errors.newPassword}
                helperText={errors.newPassword}
                disabled={saving}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="password"
                label="Confirm Password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  handlePasswordFieldChange("confirmPassword", e.target.value)
                }
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                disabled={saving}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button
                variant="contained"
                onClick={handlePasswordSubmit}
                disabled={!isFormFilled || saving}
              >
                {saving ? "Changing..." : "Change Password"}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* MFA Section */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <VerifiedUser color="action" sx={{ mr: 1 }} />
            <Typography variant="subtitle1">Two-Factor Authentication</Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add an extra layer of security to your account by enabling two-factor
            authentication.
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={mfaSettings.enabled}
                onChange={handleMfaToggle}
              />
            }
            label="Enable MFA"
          />

          {mfaSettings.enabled && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Two-factor authentication is enabled. Your account is more secure.
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
