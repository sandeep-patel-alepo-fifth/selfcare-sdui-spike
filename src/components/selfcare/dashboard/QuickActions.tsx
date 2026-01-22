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
import {
  Payment,
  DataUsage,
  TrendingUp,
  Receipt,
  Support,
  AccountCircle,
  ShoppingCart,
  Settings,
} from "@mui/icons-material";
import { QuickAction } from "@/types/dashboard";

interface QuickActionsProps {
  actions?: QuickAction[];
  apiUrl?: string;
  onAction?: (action: QuickAction) => void;
}

function getIconComponent(iconName: string) {
  switch (iconName) {
    case "payment":
      return <Payment />;
    case "data_usage":
      return <DataUsage />;
    case "trending_up":
      return <TrendingUp />;
    case "receipt":
      return <Receipt />;
    case "support":
      return <Support />;
    case "account_circle":
      return <AccountCircle />;
    case "shopping_cart":
      return <ShoppingCart />;
    case "settings":
      return <Settings />;
    default:
      return null;
  }
}

export function QuickActions({
  actions: actionsFromProps,
  apiUrl = "/api/dashboard/quick-actions",
  onAction,
}: QuickActionsProps) {
  const [actions, setActions] = useState<QuickAction[] | null>(actionsFromProps || null);
  const [loading, setLoading] = useState(!actionsFromProps);
  const [error, setError] = useState<string | null>(null);

  const fetchActions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to load actions");
      }
      const result = await response.json();
      setActions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load actions");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!actionsFromProps) {
      fetchActions();
    }
  }, [actionsFromProps, fetchActions]);

  const handleClick = (action: QuickAction) => {
    if (action.href) {
      window.location.href = action.href;
    } else if (onAction) {
      onAction(action);
    }
  };

  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "grey.200" }}
        data-testid="quick-actions-skeleton"
      >
        <CardContent>
          <Skeleton variant="text" width={100} sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", gap: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width="100%"
                height={40}
                sx={{ borderRadius: 1, flex: 1 }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="outlined" onClick={fetchActions}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
          data-testid="quick-actions-container"
        >
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.primary ? "contained" : "outlined"}
              startIcon={getIconComponent(action.icon)}
              disabled={action.disabled}
              onClick={() => handleClick(action)}
              sx={{ flex: { sm: 1 } }}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
