"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlanCard } from "@/components/selfcare/plans";
import { PlanSummary, PlanType, PlanListResponse } from "@/types/plans";

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [planType, setPlanType] = useState<PlanType | "all">("all");
  const [currentPlanId] = useState<string | null>("plan-002"); // Mock current plan

  useEffect(() => {
    async function fetchPlans() {
      try {
        const params = new URLSearchParams();
        if (planType !== "all") {
          params.set("type", planType);
        }
        const response = await fetch(`/api/plans?${params.toString()}`);
        const data: PlanListResponse = await response.json();
        setPlans(data.plans);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, [planType]);

  const handlePlanTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: PlanType | "all" | null
  ) => {
    if (newType !== null) {
      setPlanType(newType);
    }
  };

  const handleSelectPlan = (plan: PlanSummary) => {
    router.push(`/plans/${plan.id}`);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} href="/dashboard" color="inherit" underline="hover">
            Dashboard
          </MuiLink>
          <Typography color="text.primary">Plans</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Browse Plans
          </Typography>
          <Typography color="text.secondary">
            Find the perfect plan that suits your needs
          </Typography>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 4 }}>
          <ToggleButtonGroup
            value={planType}
            exclusive
            onChange={handlePlanTypeChange}
            aria-label="plan type filter"
          >
            <ToggleButton value="all">All Plans</ToggleButton>
            <ToggleButton value="postpaid">Postpaid</ToggleButton>
            <ToggleButton value="prepaid">Prepaid</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Plans Grid */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : plans.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="body1" color="text.secondary">
              No plans available at this time.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {plans.map((plan) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={plan.id}>
                <PlanCard
                  plan={plan}
                  onSelect={handleSelectPlan}
                  isCurrentPlan={plan.id === currentPlanId}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Link to Compare */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <MuiLink
            component={Link}
            href="/plans/switch"
            color="primary"
            underline="hover"
          >
            Compare plans and switch
          </MuiLink>
        </Box>
      </Container>
    </Box>
  );
}
