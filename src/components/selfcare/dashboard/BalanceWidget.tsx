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
} from "@mui/material";
import { AccountBalance } from "@mui/icons-material";
import { BalanceData } from "@/types/dashboard";

interface BalanceWidgetProps {
  data?: BalanceData;
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

export function BalanceWidget({ data, apiUrl = "/api/dashboard/balance" }: BalanceWidgetProps) {
  const [balance, setBalance] = useState<BalanceData | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to load balance");
      }
      const result = await response.json();
      setBalance(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load balance");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!data) {
      fetchBalance();
    }
  }, [data, fetchBalance]);

  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}
        data-testid="balance-widget-skeleton"
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={100} />
          </Box>
          <Skeleton variant="text" width="60%" height={60} />
          <Skeleton variant="text" width={120} sx={{ mt: 1 }} />
          <Skeleton variant="rectangular" height={36} sx={{ mt: 2, borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}
      >
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="outlined" onClick={fetchBalance}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return null;
  }

  const isPrepaid = balance.accountType === "prepaid";

  return (
    <Card
      elevation={0}
      sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <AccountBalance color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle2" color="text.secondary">
            Current Balance
          </Typography>
        </Box>
        <Typography variant="h3" fontWeight={700} color="primary">
          {formatCurrency(balance.current, balance.currency)}
        </Typography>
        {!isPrepaid && balance.dueDate && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Due {formatDate(balance.dueDate)}
          </Typography>
        )}
        <Button variant="contained" fullWidth sx={{ mt: 2 }}>
          {isPrepaid ? "Top Up" : "Pay Now"}
        </Button>
      </CardContent>
    </Card>
  );
}
