"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  DataUsage as DataIcon,
  Phone as VoiceIcon,
  Sms as SmsIcon,
  ArrowBack as BackIcon,
} from "@mui/icons-material";
import { Plan, PlanType, PlanCategory } from "@/types/plans";

interface PlanDetailsProps {
  plan: Plan;
  onSelect?: (plan: Plan) => void;
  onBack?: () => void;
  isCurrentPlan?: boolean;
  loading?: boolean;
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

function getCategoryLabel(category?: PlanCategory): string {
  if (!category) return "";
  switch (category) {
    case "basic":
      return "Basic";
    case "standard":
      return "Standard";
    case "premium":
      return "Premium";
    case "unlimited":
      return "Unlimited";
    default:
      return category;
  }
}

export function PlanDetails({
  plan,
  onSelect,
  onBack,
  isCurrentPlan = false,
  loading = false,
}: PlanDetailsProps) {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(plan);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
      <CardContent>
        {/* Back button */}
        {onBack && (
          <Button
            startIcon={<BackIcon />}
            onClick={onBack}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
        )}

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
            <Typography variant="h4" fontWeight={700}>
              {plan.name}
            </Typography>
            {plan.popular && (
              <Chip label="Popular" color="primary" size="small" />
            )}
            {isCurrentPlan && (
              <Chip label="Current Plan" color="success" size="small" />
            )}
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {plan.description}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}>
            <Typography variant="h3" fontWeight={700} color="primary">
              {formatCurrency(plan.price, plan.currency)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {formatBillingCycle(plan.billingCycle)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label={getPlanTypeLabel(plan.type)}
              variant="outlined"
              size="small"
            />
            {plan.category && (
              <Chip
                label={getCategoryLabel(plan.category)}
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Allowances */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Allowances
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card
              variant="outlined"
              sx={{ textAlign: "center", p: 2 }}
              data-testid="data-allowance"
            >
              <DataIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Data
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {plan.data || "-"}
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card
              variant="outlined"
              sx={{ textAlign: "center", p: 2 }}
              data-testid="voice-allowance"
            >
              <VoiceIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Voice
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {plan.voice || "-"}
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card
              variant="outlined"
              sx={{ textAlign: "center", p: 2 }}
              data-testid="sms-allowance"
            >
              <SmsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                SMS
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {plan.sms || "-"}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Features */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Features
        </Typography>
        <List dense>
          {plan.features.map((feature, index) => (
            <ListItem key={index} disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {feature.included ? (
                  <CheckIcon color="success" data-testid="check-icon" />
                ) : (
                  <CloseIcon color="error" data-testid="close-icon" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2">{feature.name}</Typography>
                    {feature.limit && (
                      <Chip label={feature.limit} size="small" variant="outlined" />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        {/* Actions */}
        {onSelect && !isCurrentPlan && (
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleSelect}
            >
              Select This Plan
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
