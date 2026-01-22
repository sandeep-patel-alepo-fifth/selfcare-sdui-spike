"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Skeleton,
  Alert,
  Grid,
  LinearProgress,
  Link as MuiLink,
} from "@mui/material";
import {
  DataUsage,
  Phone,
  Message,
  TrendingUp,
} from "@mui/icons-material";
import Link from "next/link";
import { UsageSummary, UsageSummaryItem, UsageType } from "@/types/usage";

interface UsageOverviewProps {
  summary?: UsageSummary;
  apiUrl?: string;
}

function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getUsageIcon(type: UsageType) {
  switch (type) {
    case "data":
      return <DataUsage color="primary" />;
    case "voice":
      return <Phone color="success" />;
    case "sms":
      return <Message color="info" />;
    case "roaming":
      return <TrendingUp color="warning" />;
    default:
      return <DataUsage />;
  }
}

function getUsageLabel(type: UsageType): string {
  switch (type) {
    case "data":
      return "Data";
    case "voice":
      return "Voice";
    case "sms":
      return "SMS";
    case "roaming":
      return "Roaming";
    default:
      return type;
  }
}

function getProgressColor(percentage: number): "primary" | "warning" | "error" {
  if (percentage >= 90) return "error";
  if (percentage >= 75) return "warning";
  return "primary";
}

function UsageCard({ item }: { item: UsageSummaryItem }) {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {getUsageIcon(item.type)}
          <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 1 }}>
            {getUsageLabel(item.type)}
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          {item.used}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          of {item.total} {item.unit}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={item.percentage}
          color={getProgressColor(item.percentage)}
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          {item.percentage}% used
        </Typography>
        {item.cost !== undefined && (
          <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
            {formatCurrency(item.cost, item.currency)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export function UsageOverview({
  summary: initialSummary,
  apiUrl = "/api/usage/summary",
}: UsageOverviewProps) {
  const [summary, setSummary] = useState<UsageSummary | null>(initialSummary || null);
  const [loading, setLoading] = useState(!initialSummary);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to load usage information");
      }
      const result = await response.json();
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load usage information");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!initialSummary) {
      fetchUsageData();
    }
  }, [initialSummary, fetchUsageData]);

  if (loading) {
    return (
      <Box data-testid="usage-overview-skeleton">
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
                <CardContent>
                  <Skeleton variant="text" width={80} height={24} />
                  <Skeleton variant="text" width={60} height={48} sx={{ my: 1 }} />
                  <Skeleton variant="text" width={100} />
                  <Skeleton variant="rectangular" height={8} sx={{ mt: 2, borderRadius: 4 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={fetchUsageData}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <Box>
      {/* Billing Period Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Billing period: {formatDate(summary.billingPeriod.start)} - {formatDate(summary.billingPeriod.end)}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Total: {formatCurrency(summary.totalCost, summary.currency)}
          </Typography>
          <MuiLink component={Link} href="/usage/history">
            View History
          </MuiLink>
        </Box>
      </Box>

      {/* Usage Cards */}
      <Grid container spacing={3}>
        {summary.items.map((item) => (
          <Grid key={item.type} size={{ xs: 12, sm: 6, md: 4 }}>
            <UsageCard item={item} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
