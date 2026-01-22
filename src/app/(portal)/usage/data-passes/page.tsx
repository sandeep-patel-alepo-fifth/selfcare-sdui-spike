"use client";

import { Box, Typography, Container } from "@mui/material";
import { DataPassPurchase } from "@/components/selfcare/usage/DataPassPurchase";

export default function DataPassesPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          Data Passes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Purchase additional data for your account
        </Typography>
      </Box>

      <DataPassPurchase />
    </Container>
  );
}
