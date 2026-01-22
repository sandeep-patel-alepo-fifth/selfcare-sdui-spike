"use client";

import { useState, useEffect, use } from "react";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Alert,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlanDetails } from "@/components/selfcare/plans";
import { Plan } from "@/types/plans";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PlanDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPlanId] = useState<string>("plan-002"); // Mock current plan

  useEffect(() => {
    async function fetchPlan() {
      try {
        const response = await fetch(`/api/plans/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Plan not found");
          } else {
            setError("Failed to load plan details");
          }
          return;
        }
        const data: Plan = await response.json();
        setPlan(data);
      } catch (err) {
        setError("Failed to load plan details");
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [id]);

  const handleBack = () => {
    router.push("/plans");
  };

  const handleSelectPlan = (selectedPlan: Plan) => {
    // Navigate to switch flow with the selected plan
    router.push(`/plans/switch?newPlanId=${selectedPlan.id}`);
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
          <Typography color="text.primary">
            {loading ? "Loading..." : plan?.name || "Not Found"}
          </Typography>
        </Breadcrumbs>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : plan ? (
          <PlanDetails
            plan={plan}
            onBack={handleBack}
            onSelect={handleSelectPlan}
            isCurrentPlan={plan.id === currentPlanId}
          />
        ) : null}
      </Container>
    </Box>
  );
}
