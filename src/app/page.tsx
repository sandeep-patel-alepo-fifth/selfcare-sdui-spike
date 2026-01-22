"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  Dashboard,
  PersonAdd,
  Login,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useTenant } from "@/lib/core/tenant-context";
import { useAuth } from "@/lib/core/auth-context";

export default function HomePage() {
  const router = useRouter();
  const { tenant } = useTenant();
  const { isAuthenticated, user } = useAuth();

  const cards = [
    {
      title: "Dashboard",
      description: "View your account overview, usage, and recent activity",
      icon: <Dashboard sx={{ fontSize: 48 }} />,
      action: () => router.push("/dashboard"),
      buttonText: "View Dashboard",
      show: true,
    },
    {
      title: "Sign In",
      description: "Already have an account? Sign in to manage your services",
      icon: <Login sx={{ fontSize: 48 }} />,
      action: () => router.push("/login"),
      buttonText: "Sign In",
      show: !isAuthenticated,
    },
    {
      title: "Get Started",
      description: "New customer? Create an account and choose your plan",
      icon: <PersonAdd sx={{ fontSize: 48 }} />,
      action: () => router.push("/onboarding"),
      buttonText: "Sign Up",
      show: !isAuthenticated,
    },
    {
      title: "Admin Portal",
      description: "Manage tenants, plans, and system configuration",
      icon: <AdminPanelSettings sx={{ fontSize: 48 }} />,
      action: () => router.push("/admin"),
      buttonText: "Open Admin",
      show: true,
      variant: "outlined" as const,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${tenant.branding.primaryColor} 0%, ${tenant.branding.secondaryColor || "#8b5cf6"} 100%)`,
        display: "flex",
        alignItems: "center",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: "center", color: "white", mb: 8 }}>
          <Typography variant="h2" fontWeight={700} gutterBottom>
            {tenant.name}
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9 }}>
            Enterprise Self-Service Portal
          </Typography>
          {isAuthenticated && user && (
            <Typography variant="body1" sx={{ mt: 2, opacity: 0.8 }}>
              Welcome back, {user.firstName}!
            </Typography>
          )}
        </Box>

        {/* Cards */}
        <Grid container spacing={3} justifyContent="center">
          {cards
            .filter((card) => card.show)
            .map((card) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 8,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                    <Box sx={{ color: "primary.main", mb: 2 }}>{card.icon}</Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant={card.variant || "contained"}
                      fullWidth
                      onClick={card.action}
                    >
                      {card.buttonText}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>

        {/* Footer */}
        <Box sx={{ textAlign: "center", color: "white", mt: 8, opacity: 0.8 }}>
          <Typography variant="body2">
            Powered by Alepo SelfcareNOW Platform
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Multi-tenant enterprise selfcare with Server-Driven UI
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
