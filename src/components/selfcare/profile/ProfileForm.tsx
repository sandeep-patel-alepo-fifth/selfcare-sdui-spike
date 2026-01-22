"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Skeleton,
  Grid,
  Alert,
} from "@mui/material";
import { Person } from "@mui/icons-material";
import { Profile, ProfileUpdate, ProfileUpdateSchema } from "@/types/profile";

interface ProfileFormProps {
  profile: Profile;
  onSave: (data: ProfileUpdate) => Promise<void> | void;
  loading?: boolean;
}

export function ProfileForm({ profile, onSave, loading = false }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileUpdate>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    address: profile.address,
    avatarUrl: profile.avatarUrl,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.replace("address.", "");
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    // Prepare data for validation - convert empty strings to null for optional fields
    const dataToValidate = {
      ...formData,
      email: formData.email?.trim() === "" ? null : formData.email,
    };

    const result = ProfileUpdateSchema.safeParse(dataToValidate);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "grey.200" }}
        data-testid="profile-form-skeleton"
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Skeleton variant="circular" width={80} height={80} sx={{ mr: 2 }} />
            <Box>
              <Skeleton variant="text" width={150} height={32} />
              <Skeleton variant="text" width={100} />
            </Box>
          </Box>
          <Grid container spacing={2}>
            {[...Array(6)].map((_, i) => (
              <Grid size={{ xs: 12, md: 6 }} key={i}>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rectangular" height={42} sx={{ mt: 3, borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {/* Profile Avatar */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <Avatar
              data-testid="profile-avatar"
              src={profile.avatarUrl || undefined}
              sx={{ width: 80, height: 80, mr: 2, bgcolor: "primary.main" }}
            >
              {!profile.avatarUrl && <Person sx={{ fontSize: 40 }} />}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.phone}
              </Typography>
            </Box>
          </Box>

          {/* Form Fields */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                value={profile.phone}
                disabled
                helperText="Contact support to change your phone number"
              />
            </Grid>

            {/* Address Fields */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                Address
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Street"
                value={formData.address?.street || ""}
                onChange={(e) => handleChange("address.street", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="City"
                value={formData.address?.city || ""}
                onChange={(e) => handleChange("address.city", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="State"
                value={formData.address?.state || ""}
                onChange={(e) => handleChange("address.state", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.address?.postalCode || ""}
                onChange={(e) => handleChange("address.postalCode", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Country"
                value={formData.address?.country || ""}
                onChange={(e) => handleChange("address.country", e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Error Message */}
          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Please fix the errors above before saving.
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
