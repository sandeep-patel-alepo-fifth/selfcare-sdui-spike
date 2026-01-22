"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PlanComparison,
  PlanSwitchFlow,
} from "@/components/selfcare/plans";
import { Plan, PlanListResponse, PlanSwitchRequest, PlanSwitchResponse } from "@/types/plans";

function PlanSwitchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newPlanIdFromUrl = searchParams.get("newPlanId");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [currentPlanId] = useState<string>("plan-002"); // Mock current plan
  const [showSwitchFlow, setShowSwitchFlow] = useState(false);

  useEffect(() => {
    async function fetchPlans() {
      try {
        // Fetch all plans with full details
        const response = await fetch("/api/plans");
        const data: PlanListResponse = await response.json();

        // Fetch full details for each plan
        const fullPlans = await Promise.all(
          data.plans.map(async (planSummary) => {
            const detailResponse = await fetch(`/api/plans/${planSummary.id}`);
            return detailResponse.json() as Promise<Plan>;
          })
        );

        setPlans(fullPlans);

        // If a plan was pre-selected from URL, set it
        if (newPlanIdFromUrl) {
          const preSelectedPlan = fullPlans.find((p) => p.id === newPlanIdFromUrl);
          if (preSelectedPlan && preSelectedPlan.id !== currentPlanId) {
            setSelectedPlan(preSelectedPlan);
            setShowSwitchFlow(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, [newPlanIdFromUrl, currentPlanId]);

  const currentPlan = plans.find((p) => p.id === currentPlanId);

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === currentPlanId) return;
    setSelectedPlan(plan);
    setShowSwitchFlow(true);
  };

  const handleSwitch = async (request: PlanSwitchRequest): Promise<PlanSwitchResponse> => {
    const response = await fetch("/api/plans/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return response.json();
  };

  const handleCancel = () => {
    setShowSwitchFlow(false);
    setSelectedPlan(null);
  };

  const handleComplete = () => {
    router.push("/plans");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} href="/dashboard" color="inherit" underline="hover">
            Dashboard
          </MuiLink>
          <MuiLink component={Link} href="/plans" color="inherit" underline="hover">
            Plans
          </MuiLink>
          <Typography color="text.primary">Switch Plan</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {showSwitchFlow ? "Switch Your Plan" : "Compare & Switch Plans"}
          </Typography>
          <Typography color="text.secondary">
            {showSwitchFlow
              ? "Review and confirm your plan change"
              : "Compare plans side-by-side and choose the best one for you"}
          </Typography>
        </Box>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : !currentPlan ? (
          <Alert severity="error">
            Could not find your current plan. Please contact support.
          </Alert>
        ) : showSwitchFlow && selectedPlan ? (
          <Grid container justifyContent="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <PlanSwitchFlow
                currentPlan={currentPlan}
                newPlan={selectedPlan}
                onSwitch={handleSwitch}
                onCancel={handleCancel}
                onComplete={handleComplete}
              />
            </Grid>
          </Grid>
        ) : (
          <>
            {/* Current Plan Info */}
            <Alert severity="info" sx={{ mb: 3 }}>
              Your current plan: <strong>{currentPlan.name}</strong> - $
              {currentPlan.price}/month
            </Alert>

            {/* Plan Comparison */}
            <PlanComparison
              plans={plans.slice(0, 3)}
              onSelectPlan={handleSelectPlan}
              currentPlanId={currentPlanId}
            />

            {plans.length > 3 && (
              <Box sx={{ mt: 3, textAlign: "center" }}>
                <MuiLink component={Link} href="/plans" color="primary" underline="hover">
                  View all {plans.length} plans
                </MuiLink>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

export default function PlanSwitchPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      }
    >
      <PlanSwitchContent />
    </Suspense>
  );
}
