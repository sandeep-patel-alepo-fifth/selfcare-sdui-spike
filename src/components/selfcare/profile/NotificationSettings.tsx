"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Grid,
  Divider,
} from "@mui/material";
import {
  Notifications,
  Email,
  Sms,
  PhoneAndroid,
  Language,
  Palette,
} from "@mui/icons-material";
import { UserPreferences } from "@/types/profile";

interface NotificationSettingsProps {
  preferences: UserPreferences;
  onChange: (preferences: UserPreferences) => void;
  loading?: boolean;
  saving?: boolean;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
];

const THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "Auto (System)" },
];

export function NotificationSettings({
  preferences,
  onChange,
  loading = false,
  saving = false,
}: NotificationSettingsProps) {
  const handleNotificationChange = (
    type: "email" | "sms" | "push",
    checked: boolean
  ) => {
    onChange({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [type]: checked,
      },
    });
  };

  const handleLanguageChange = (language: string) => {
    onChange({
      ...preferences,
      language,
    });
  };

  const handleThemeChange = (theme: "light" | "dark" | "auto") => {
    onChange({
      ...preferences,
      theme,
    });
  };

  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "grey.200" }}
        data-testid="notification-settings-skeleton"
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={200} />
          </Box>
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={48}
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
          <Notifications color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Notification Preferences</Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Notification Toggles */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Notification Channels
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.notifications.email}
                    onChange={(e) =>
                      handleNotificationChange("email", e.target.checked)
                    }
                    disabled={saving}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Email fontSize="small" color="action" />
                    <span>Email Notifications</span>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.notifications.sms}
                    onChange={(e) =>
                      handleNotificationChange("sms", e.target.checked)
                    }
                    disabled={saving}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Sms fontSize="small" color="action" />
                    <span>SMS Notifications</span>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.notifications.push}
                    onChange={(e) =>
                      handleNotificationChange("push", e.target.checked)
                    }
                    disabled={saving}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PhoneAndroid fontSize="small" color="action" />
                    <span>Push Notifications</span>
                  </Box>
                }
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          {/* Language Selection */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={saving}>
              <InputLabel id="language-select-label">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Language fontSize="small" />
                  <span>Language</span>
                </Box>
              </InputLabel>
              <Select
                labelId="language-select-label"
                id="language-select"
                value={preferences.language}
                label="Language"
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Theme Selection */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={saving}>
              <InputLabel id="theme-select-label">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Palette fontSize="small" />
                  <span>Theme</span>
                </Box>
              </InputLabel>
              <Select
                labelId="theme-select-label"
                id="theme-select"
                value={preferences.theme}
                label="Theme"
                onChange={(e) =>
                  handleThemeChange(e.target.value as "light" | "dark" | "auto")
                }
              >
                {THEMES.map((theme) => (
                  <MenuItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
