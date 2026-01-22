"use client";

import { Box, Container, Typography, Breadcrumbs, Link as MuiLink } from "@mui/material";
import Link from "next/link";
import { BillingOverview } from "@/components/selfcare/billing";

export default function BillingPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} href="/dashboard" color="inherit" underline="hover">
            Dashboard
          </MuiLink>
          <Typography color="text.primary">Billing</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Billing
          </Typography>
          <Typography color="text.secondary">
            Manage your billing, view invoices, and set up payment methods
          </Typography>
        </Box>

        {/* Billing Overview */}
        <BillingOverview />
      </Container>
    </Box>
  );
}
