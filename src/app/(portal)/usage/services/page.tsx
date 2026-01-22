"use client";

import { Box, Typography, Container } from "@mui/material";
import { ServicesList } from "@/components/selfcare/usage/ServicesList";

export default function ServicesPage() {
  const handleRenewService = (serviceId: string) => {
    // In a real app, this would open a renewal flow
    console.log("Renewing service:", serviceId);
    // Could navigate to a renewal page or open a dialog
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          Active Services
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your plans, add-ons, and features
        </Typography>
      </Box>

      <ServicesList onRenew={handleRenewService} />
    </Container>
  );
}
