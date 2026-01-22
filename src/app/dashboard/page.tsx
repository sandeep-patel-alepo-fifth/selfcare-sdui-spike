"use client";

import { Box, Container, Typography, Grid } from "@mui/material";
import {
  BalanceWidget,
  ServicesSummary,
  UsageChart,
  ActivityFeed,
  QuickActions,
} from "@/components/selfcare/dashboard";
import { QuickAction } from "@/types/dashboard";

export default function DashboardPage() {
  const handleQuickAction = (action: QuickAction) => {
    // Handle quick actions that don't have href
    switch (action.action) {
      case "pay_bill":
        console.log("Opening payment modal...");
        break;
      case "buy_data":
        console.log("Opening data purchase modal...");
        break;
      default:
        console.log("Action clicked:", action.label);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome back, John
          </Typography>
          <Typography color="text.secondary">
            Here&apos;s an overview of your account
          </Typography>
        </Box>

        {/* Main Grid */}
        <Grid container spacing={3}>
          {/* Balance Widget */}
          <Grid size={{ xs: 12, md: 4 }}>
            <BalanceWidget />
          </Grid>

          {/* Services Summary */}
          <Grid size={{ xs: 12, md: 4 }}>
            <ServicesSummary />
          </Grid>

          {/* Activity Feed */}
          <Grid size={{ xs: 12, md: 4 }}>
            <ActivityFeed />
          </Grid>

          {/* Usage Chart - Full Width */}
          <Grid size={{ xs: 12 }}>
            <UsageChart />
          </Grid>

          {/* Quick Actions */}
          <Grid size={{ xs: 12 }}>
            <QuickActions onAction={handleQuickAction} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
