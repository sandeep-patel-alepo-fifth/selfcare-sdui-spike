"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import Link from "next/link";
import { InvoiceList, InvoiceDetails } from "@/components/selfcare/billing";
import { InvoiceSummary } from "@/types/billing";

export default function BillsPage() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const handleInvoiceClick = useCallback((invoice: InvoiceSummary) => {
    setSelectedInvoiceId(invoice.id);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedInvoiceId(null);
  }, []);

  const handleDownload = useCallback((invoiceId: string) => {
    // Mock download - in production this would trigger a real PDF download
    console.log("Downloading invoice:", invoiceId);
    alert(`Downloading invoice ${invoiceId}... (Mock implementation)`);
  }, []);

  const handlePayNow = useCallback((invoiceId: string) => {
    // Mock payment - in production this would navigate to payment flow
    console.log("Pay now for invoice:", invoiceId);
    alert(`Opening payment flow for invoice ${invoiceId}... (Mock implementation)`);
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} href="/dashboard" color="inherit" underline="hover">
            Dashboard
          </MuiLink>
          <MuiLink component={Link} href="/billing" color="inherit" underline="hover">
            Billing
          </MuiLink>
          <Typography color="text.primary">Bills</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Bills & Invoices
          </Typography>
          <Typography color="text.secondary">
            View and download your billing history
          </Typography>
        </Box>

        {/* Invoice List */}
        <InvoiceList onInvoiceClick={handleInvoiceClick} />

        {/* Invoice Details Dialog */}
        <Dialog
          open={!!selectedInvoiceId}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Invoice Details
            <IconButton onClick={handleCloseDetails} size="small">
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedInvoiceId && (
              <InvoiceDetails
                invoiceId={selectedInvoiceId}
                onDownload={handleDownload}
                onPayNow={handlePayNow}
              />
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}
