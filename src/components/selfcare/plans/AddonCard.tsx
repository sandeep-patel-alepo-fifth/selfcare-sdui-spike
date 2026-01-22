"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import {
  DataUsage as DataIcon,
  Phone as VoiceIcon,
  Sms as SmsIcon,
  Flight as RoamingIcon,
  Movie as EntertainmentIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { Addon, AddonType } from "@/types/plans";

interface AddonCardProps {
  addon: Addon;
  onAdd?: (addon: Addon) => void;
  disabled?: boolean;
  isActive?: boolean;
}

function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function getAddonTypeLabel(type: AddonType): string {
  switch (type) {
    case "data":
      return "Data";
    case "voice":
      return "Voice";
    case "sms":
      return "SMS";
    case "roaming":
      return "Roaming";
    case "entertainment":
      return "Entertainment";
    case "security":
      return "Security";
    default:
      return type;
  }
}

function getAddonTypeIcon(type: AddonType) {
  switch (type) {
    case "data":
      return <DataIcon />;
    case "voice":
      return <VoiceIcon />;
    case "sms":
      return <SmsIcon />;
    case "roaming":
      return <RoamingIcon />;
    case "entertainment":
      return <EntertainmentIcon />;
    case "security":
      return <SecurityIcon />;
    default:
      return <DataIcon />;
  }
}

export function AddonCard({
  addon,
  onAdd,
  disabled = false,
  isActive = false,
}: AddonCardProps) {
  const handleAdd = () => {
    if (onAdd && !disabled && !isActive) {
      onAdd(addon);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: isActive ? "success.main" : "grey.200",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      data-testid="addon-card"
    >
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: "primary.50",
                color: "primary.main",
                display: "flex",
              }}
            >
              {getAddonTypeIcon(addon.type)}
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {addon.name}
              </Typography>
              <Chip
                label={getAddonTypeLabel(addon.type)}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {addon.recurring && (
              <Chip label="Recurring" size="small" color="info" variant="outlined" />
            )}
            {isActive && (
              <Chip label="Active" size="small" color="success" />
            )}
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
          {addon.description}
        </Typography>

        {(addon.value || addon.duration) && (
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            {addon.value && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Value
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {addon.value}
                </Typography>
              </Box>
            )}
            {addon.duration && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {addon.duration}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto" }}>
          <Typography variant="h5" fontWeight={700} color="primary">
            {formatCurrency(addon.price, addon.currency)}
          </Typography>

          {!isActive && (
            <Button
              variant="contained"
              size="small"
              onClick={handleAdd}
              disabled={disabled}
            >
              Add
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
