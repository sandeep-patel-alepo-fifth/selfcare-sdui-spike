"use client";

import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import {
  Business,
  People,
  Inventory,
  Analytics,
  Settings,
  Security,
  Notifications,
  Speed,
} from "@mui/icons-material";
import Link from "next/link";

// Admin modules based on requirements
const adminModules = [
  {
    title: "Tenant Management",
    description: "Create, configure, and manage tenants",
    icon: <Business />,
    href: "/admin/tenants",
    status: "coming-soon",
  },
  {
    title: "User Management",
    description: "Manage admin users and roles",
    icon: <People />,
    href: "/admin/users",
    status: "coming-soon",
  },
  {
    title: "Plan Bundles",
    description: "Configure plans, pricing, and services",
    icon: <Inventory />,
    href: "/admin/plans",
    status: "coming-soon",
  },
  {
    title: "Reports & Analytics",
    description: "View usage reports and analytics",
    icon: <Analytics />,
    href: "/admin/reports",
    status: "coming-soon",
  },
  {
    title: "System Settings",
    description: "Global configuration and feature flags",
    icon: <Settings />,
    href: "/admin/settings",
    status: "coming-soon",
  },
  {
    title: "Security",
    description: "Audit logs and security settings",
    icon: <Security />,
    href: "/admin/security",
    status: "coming-soon",
  },
];

// Quick stats
const quickStats = [
  { label: "Active Tenants", value: "12", icon: <Business fontSize="small" /> },
  { label: "Total Users", value: "1,234", icon: <People fontSize="small" /> },
  { label: "Active Plans", value: "8", icon: <Inventory fontSize="small" /> },
  { label: "System Health", value: "99.9%", icon: <Speed fontSize="small" /> },
];

// Recent activity
const recentActivity = [
  { action: "Tenant created", details: "TelcoMax Corp", time: "2 hours ago" },
  { action: "Plan updated", details: "Premium Plus pricing", time: "5 hours ago" },
  { action: "User added", details: "admin@telcomax.com", time: "1 day ago" },
];

export default function AdminPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Admin Portal
          </Typography>
          <Typography color="text.secondary">
            Manage tenants, plans, and system configuration
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {quickStats.map((stat) => (
            <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
              <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ color: "primary.main" }}>{stat.icon}</Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Admin Modules */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Modules
            </Typography>
            <Grid container spacing={2}>
              {adminModules.map((module) => (
                <Grid size={{ xs: 12, sm: 6 }} key={module.title}>
                  <Card
                    sx={{
                      height: "100%",
                      opacity: module.status === "coming-soon" ? 0.7 : 1,
                    }}
                  >
                    <CardActionArea
                      component={Link}
                      href={module.href}
                      disabled={module.status === "coming-soon"}
                      sx={{ height: "100%", p: 2 }}
                    >
                      <CardContent sx={{ p: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                          <Box sx={{ color: "primary.main", mt: 0.5 }}>
                            {module.icon}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {module.title}
                              </Typography>
                              {module.status === "coming-soon" && (
                                <Chip
                                  label="Coming Soon"
                                  size="small"
                                  sx={{ fontSize: "0.65rem", height: 20 }}
                                />
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {module.description}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Recent Activity */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Recent Activity
            </Typography>
            <Paper sx={{ p: 2 }}>
              <List disablePadding>
                {recentActivity.map((activity, index) => (
                  <ListItem
                    key={index}
                    disablePadding
                    sx={{ mb: index < recentActivity.length - 1 ? 2 : 0 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Notifications fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.action}
                      secondary={`${activity.details} • ${activity.time}`}
                      primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                      secondaryTypographyProps={{ variant: "caption" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
