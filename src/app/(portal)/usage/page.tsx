"use client";

import { Box, Typography, Container } from "@mui/material";
import { UsageOverview } from "@/components/selfcare/usage/UsageOverview";

export default function UsagePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          Usage
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor your data, voice, and SMS usage
        </Typography>
      </Box>

      <UsageOverview />
    </Container>
  );
}
