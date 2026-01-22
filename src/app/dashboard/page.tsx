"use client";

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
} from "@mui/material";
import {
  AccountBalance,
  DataUsage,
  Phone,
  Sms,
  Receipt,
  Payment,
  TrendingUp,
} from "@mui/icons-material";

// Mock data - will be replaced with API calls
const mockBalance = {
  current: 45.99,
  dueDate: "Feb 15, 2026",
  accountType: "postpaid",
};

const mockUsage = {
  data: { used: 12.5, total: 20, unit: "GB" },
  voice: { used: 350, total: 500, unit: "min" },
  sms: { used: 45, total: 100, unit: "texts" },
};

const mockActivities = [
  { id: 1, type: "payment", description: "Payment received", amount: "$45.99", date: "Jan 20, 2026" },
  { id: 2, type: "usage", description: "Data usage spike", amount: "2.5 GB", date: "Jan 19, 2026" },
  { id: 3, type: "plan", description: "Plan renewed", amount: "$49.99/mo", date: "Jan 15, 2026" },
];

function BalanceCard() {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <AccountBalance color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle2" color="text.secondary">
            Current Balance
          </Typography>
        </Box>
        <Typography variant="h3" fontWeight={700} color="primary">
          ${mockBalance.current.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Due {mockBalance.dueDate}
        </Typography>
        <Button variant="contained" fullWidth sx={{ mt: 2 }}>
          Pay Now
        </Button>
      </CardContent>
    </Card>
  );
}

function UsageCard() {
  const usageItems = [
    { icon: <DataUsage />, label: "Data", ...mockUsage.data },
    { icon: <Phone />, label: "Voice", ...mockUsage.voice },
    { icon: <Sms />, label: "SMS", ...mockUsage.sms },
  ];

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <TrendingUp color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle2" color="text.secondary">
            Usage This Month
          </Typography>
        </Box>
        {usageItems.map((item) => {
          const percentage = (item.used / item.total) * 100;
          return (
            <Box key={item.label} sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {item.icon}
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {item.label}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {item.used} / {item.total} {item.unit}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{ height: 8, borderRadius: 4 }}
                color={percentage > 80 ? "warning" : "primary"}
              />
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ActivityCard() {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Recent Activity
        </Typography>
        <List disablePadding>
          {mockActivities.map((activity) => (
            <ListItem key={activity.id} disablePadding sx={{ mb: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                {activity.type === "payment" ? (
                  <Payment color="success" />
                ) : activity.type === "usage" ? (
                  <DataUsage color="info" />
                ) : (
                  <Receipt color="primary" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={activity.description}
                secondary={activity.date}
                primaryTypographyProps={{ variant: "body2" }}
                secondaryTypographyProps={{ variant: "caption" }}
              />
              <Typography variant="body2" fontWeight={500}>
                {activity.amount}
              </Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

function QuickActionsCard() {
  const actions = [
    { label: "Pay Bill", icon: <Payment /> },
    { label: "Buy Data", icon: <DataUsage /> },
    { label: "View Bills", icon: <Receipt /> },
  ];

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outlined"
              startIcon={action.icon}
              sx={{ flex: 1 }}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
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
          {/* Balance Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <BalanceCard />
          </Grid>

          {/* Usage Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <UsageCard />
          </Grid>

          {/* Activity Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <ActivityCard />
          </Grid>

          {/* Quick Actions */}
          <Grid size={{ xs: 12 }}>
            <QuickActionsCard />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
