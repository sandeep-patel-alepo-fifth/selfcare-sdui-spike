"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Alert,
  Button,
} from "@mui/material";
import {
  Payment,
  DataUsage,
  Receipt,
  AddCard,
  Support,
  AccountCircle,
} from "@mui/icons-material";
import { ActivityFeedData, ActivityType } from "@/types/dashboard";

interface ActivityFeedProps {
  data?: ActivityFeedData;
  apiUrl?: string;
}

function formatTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case "payment":
      return <Payment color="success" data-testid="PaymentIcon" />;
    case "usage":
      return <DataUsage color="info" data-testid="DataUsageIcon" />;
    case "plan":
      return <Receipt color="primary" data-testid="ReceiptIcon" />;
    case "topup":
      return <AddCard color="success" data-testid="AddCardIcon" />;
    case "support":
      return <Support color="warning" data-testid="SupportIcon" />;
    case "account":
      return <AccountCircle color="primary" data-testid="AccountCircleIcon" />;
    default:
      return <Receipt color="primary" data-testid="ReceiptIcon" />;
  }
}

export function ActivityFeed({ data, apiUrl = "/api/dashboard/activity" }: ActivityFeedProps) {
  const [activityData, setActivityData] = useState<ActivityFeedData | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to load activity");
      }
      const result = await response.json();
      setActivityData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!data) {
      fetchActivity();
    }
  }, [data, fetchActivity]);

  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}
        data-testid="activity-feed-skeleton"
      >
        <CardContent>
          <Skeleton variant="text" width={120} sx={{ mb: 2 }} />
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
              <Skeleton variant="text" width={60} />
            </Box>
          ))}
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
          <Button variant="outlined" onClick={fetchActivity}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const activities = activityData?.activities || [];

  return (
    <Card
      elevation={0}
      sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}
    >
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Recent Activity
        </Typography>

        {activities.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
            No recent activity
          </Typography>
        ) : (
          <List disablePadding>
            {activities.map((activity) => (
              <ListItem key={activity.id} disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getActivityIcon(activity.type)}
                </ListItemIcon>
                <ListItemText
                  primary={activity.title}
                  secondary={formatTimestamp(activity.timestamp)}
                  primaryTypographyProps={{ variant: "body2" }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
                {activity.amount && (
                  <Typography variant="body2" fontWeight={500}>
                    {activity.amount}
                  </Typography>
                )}
              </ListItem>
            ))}
          </List>
        )}

        {activityData?.hasMore && (
          <Button variant="text" fullWidth sx={{ mt: 1 }}>
            View All
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
