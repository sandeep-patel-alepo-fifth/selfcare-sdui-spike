"use client";

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Plan, PlanFeature } from "@/types/plans";

interface PlanComparisonProps {
  plans: Plan[];
  onSelectPlan?: (plan: Plan) => void;
  currentPlanId?: string;
}

function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

// Get all unique feature names across all plans
function getUniqueFeatures(plans: Plan[]): string[] {
  const featureSet = new Set<string>();
  plans.forEach((plan) => {
    plan.features.forEach((feature) => {
      featureSet.add(feature.name);
    });
  });
  return Array.from(featureSet);
}

// Get feature details for a specific plan
function getPlanFeature(plan: Plan, featureName: string): PlanFeature | undefined {
  return plan.features.find((f) => f.name === featureName);
}

export function PlanComparison({
  plans,
  onSelectPlan,
  currentPlanId,
}: PlanComparisonProps) {
  // Limit to 3 plans maximum
  const displayPlans = plans.slice(0, 3);
  const featureNames = getUniqueFeatures(displayPlans);

  const handleSelectPlan = (plan: Plan) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
    }
  };

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
      <Table>
        <TableHead>
          {/* Plan names row */}
          <TableRow>
            <TableCell sx={{ bgcolor: "grey.50", width: "180px" }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Feature
              </Typography>
            </TableCell>
            {displayPlans.map((plan) => (
              <TableCell
                key={plan.id}
                align="center"
                sx={{
                  bgcolor: plan.popular ? "primary.50" : "grey.50",
                  borderLeft: "1px solid",
                  borderColor: "grey.200",
                  position: "relative",
                }}
              >
                {plan.popular && (
                  <Chip
                    label="Popular"
                    color="primary"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                    }}
                  />
                )}
                <Typography variant="h6" fontWeight={600} sx={{ mt: plan.popular ? 2 : 0 }}>
                  {plan.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {plan.description}
                </Typography>
                <Typography variant="h5" fontWeight={700} color="primary">
                  {formatCurrency(plan.price, plan.currency)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  /month
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {/* Data row */}
          <TableRow>
            <TableCell>
              <Typography variant="body2" fontWeight={500}>
                Data
              </Typography>
            </TableCell>
            {displayPlans.map((plan) => (
              <TableCell
                key={plan.id}
                align="center"
                sx={{ borderLeft: "1px solid", borderColor: "grey.200" }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {plan.data || "-"}
                </Typography>
              </TableCell>
            ))}
          </TableRow>

          {/* Voice row */}
          <TableRow>
            <TableCell>
              <Typography variant="body2" fontWeight={500}>
                Voice
              </Typography>
            </TableCell>
            {displayPlans.map((plan) => (
              <TableCell
                key={plan.id}
                align="center"
                sx={{ borderLeft: "1px solid", borderColor: "grey.200" }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {plan.voice || "-"}
                </Typography>
              </TableCell>
            ))}
          </TableRow>

          {/* SMS row */}
          <TableRow>
            <TableCell>
              <Typography variant="body2" fontWeight={500}>
                SMS
              </Typography>
            </TableCell>
            {displayPlans.map((plan) => (
              <TableCell
                key={plan.id}
                align="center"
                sx={{ borderLeft: "1px solid", borderColor: "grey.200" }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {plan.sms || "-"}
                </Typography>
              </TableCell>
            ))}
          </TableRow>

          {/* Feature rows */}
          {featureNames.map((featureName) => (
            <TableRow key={featureName}>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {featureName}
                </Typography>
              </TableCell>
              {displayPlans.map((plan) => {
                const feature = getPlanFeature(plan, featureName);
                return (
                  <TableCell
                    key={plan.id}
                    align="center"
                    sx={{ borderLeft: "1px solid", borderColor: "grey.200" }}
                  >
                    {feature?.included ? (
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                        <CheckIcon
                          color="success"
                          fontSize="small"
                          data-testid="check-icon"
                        />
                        {feature.limit && (
                          <Typography variant="body2" color="text.secondary">
                            {feature.limit}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <CloseIcon
                        color="error"
                        fontSize="small"
                        data-testid="close-icon"
                      />
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}

          {/* Action row */}
          <TableRow>
            <TableCell sx={{ bgcolor: "grey.50" }}>
              <Typography variant="body2" fontWeight={500}>
                &nbsp;
              </Typography>
            </TableCell>
            {displayPlans.map((plan) => {
              const isCurrentPlan = plan.id === currentPlanId;
              return (
                <TableCell
                  key={plan.id}
                  align="center"
                  sx={{ bgcolor: "grey.50", borderLeft: "1px solid", borderColor: "grey.200" }}
                >
                  {isCurrentPlan ? (
                    <Chip label="Current Plan" color="success" />
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isCurrentPlan}
                    >
                      Select
                    </Button>
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
