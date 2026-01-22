"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Stack,
} from "@mui/material";
import {
  DataUsage as DataIcon,
  Phone as VoiceIcon,
  Sms as SmsIcon,
} from "@mui/icons-material";
import { PlanSummary, PlanType } from "@/types/plans";

interface PlanCardProps {
  plan: PlanSummary;
  onSelect?: (plan: PlanSummary) => void;
  disabled?: boolean;
  isCurrentPlan?: boolean;
}

function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatBillingCycle(cycle: string): string {
  switch (cycle) {
    case "daily":
      return "/day";
    case "weekly":
      return "/week";
    case "monthly":
      return "/month";
    case "yearly":
      return "/year";
    default:
      return `/${cycle}`;
  }
}

function getPlanTypeLabel(type: PlanType): string {
  switch (type) {
    case "prepaid":
      return "Prepaid";
    case "postpaid":
      return "Postpaid";
    case "hybrid":
      return "Hybrid";
    default:
      return type;
  }
}

export function PlanCard({
  plan,
  onSelect,
  disabled = false,
  isCurrentPlan = false,
}: PlanCardProps) {
  const handleSelect = () => {
    if (onSelect && !disabled && !isCurrentPlan) {
      onSelect(plan);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: plan.popular ? "primary.main" : "grey.200",
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      data-testid="plan-card"
    >
      {plan.popular && (
        <Chip
          label="Popular"
          color="primary"
          size="small"
          sx={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      )}

      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {plan.name}
            </Typography>
            <Chip
              label={getPlanTypeLabel(plan.type)}
              size="small"
              variant="outlined"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {plan.description}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} color="primary" component="span">
            {formatCurrency(plan.price, plan.currency)}
          </Typography>
          <Typography variant="body2" color="text.secondary" component="span">
            {formatBillingCycle(plan.billingCycle)}
          </Typography>
        </Box>

        <Stack spacing={1.5} sx={{ mb: 3, flex: 1 }}>
          {plan.data && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <DataIcon fontSize="small" color="action" />
              <Typography variant="body2">{plan.data}</Typography>
            </Box>
          )}
          {plan.voice && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <VoiceIcon fontSize="small" color="action" />
              <Typography variant="body2">{plan.voice}</Typography>
            </Box>
          )}
          {plan.sms && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SmsIcon fontSize="small" color="action" />
              <Typography variant="body2">{plan.sms}</Typography>
            </Box>
          )}
        </Stack>

        {isCurrentPlan ? (
          <Chip label="Current Plan" color="success" sx={{ alignSelf: "center" }} />
        ) : (
          <Button
            variant="contained"
            fullWidth
            onClick={handleSelect}
            disabled={disabled}
          >
            Select
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
