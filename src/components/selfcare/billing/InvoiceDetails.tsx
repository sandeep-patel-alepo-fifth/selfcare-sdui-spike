"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Skeleton,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from "@mui/material";
import { Download, Payment } from "@mui/icons-material";
import { Invoice, InvoiceStatus } from "@/types/billing";

interface InvoiceDetailsProps {
  invoiceId?: string;
  data?: Invoice;
  apiUrl?: string;
  onDownload?: (invoiceId: string) => void;
  onPayNow?: (invoiceId: string) => void;
}

function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusColor(status: InvoiceStatus): "success" | "warning" | "error" | "info" {
  switch (status) {
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "overdue":
      return "error";
    case "processing":
      return "info";
    default:
      return "info";
  }
}

function getStatusLabel(status: InvoiceStatus): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "pending":
      return "Pending";
    case "overdue":
      return "Overdue";
    case "processing":
      return "Processing";
    default:
      return status;
  }
}

export function InvoiceDetails({
  invoiceId,
  data,
  apiUrl = "/api/billing/invoices",
  onDownload,
  onPayNow,
}: InvoiceDetailsProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(data || null);
  const [loading, setLoading] = useState(!data && !!invoiceId);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/${invoiceId}`);
      if (!response.ok) {
        throw new Error("Failed to load invoice");
      }
      const result = await response.json();
      setInvoice(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, invoiceId]);

  useEffect(() => {
    if (!data && invoiceId) {
      fetchInvoice();
    }
  }, [data, invoiceId, fetchInvoice]);

  const handleDownload = () => {
    if (invoice && onDownload) {
      onDownload(invoice.id);
    }
  };

  const handlePayNow = () => {
    if (invoice && onPayNow) {
      onPayNow(invoice.id);
    }
  };

  if (loading) {
    return (
      <Box data-testid="invoice-details-skeleton">
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
              <Box>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="text" width={150} />
              </Box>
              <Skeleton variant="rectangular" width={80} height={24} />
            </Box>
            <Skeleton variant="text" width={300} />
            <Skeleton variant="text" width={250} />
          </CardContent>
        </Card>
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
          <CardContent>
            <Skeleton variant="text" width={150} height={30} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {[1, 2, 3, 4].map((i) => (
                      <TableCell key={i}><Skeleton width={80} /></TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      {[1, 2, 3, 4].map((j) => (
                        <TableCell key={j}><Skeleton width={60} /></TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={fetchInvoice}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!invoice) {
    return null;
  }

  const showPayButton = invoice.status === "pending" || invoice.status === "overdue";

  return (
    <Box>
      {/* Invoice Header */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {invoice.invoiceNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Invoice Date: {formatDate(invoice.date)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Due Date: {formatDate(invoice.dueDate)}
              </Typography>
            </Box>
            <Chip
              label={getStatusLabel(invoice.status)}
              color={getStatusColor(invoice.status)}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Billing Period
              </Typography>
              <Typography>
                {formatDate(invoice.billingPeriod.start)} - {formatDate(invoice.billingPeriod.end)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary">
                {formatCurrency(invoice.amount, invoice.currency)}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            {invoice.downloadUrl && (
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownload}
              >
                Download PDF
              </Button>
            )}
            {showPayButton && (
              <Button
                variant="contained"
                startIcon={<Payment />}
                onClick={handlePayNow}
              >
                Pay Now
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Invoice Details
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Qty</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography>{item.description}</Typography>
                      {item.category && (
                        <Typography variant="caption" color="text.secondary">
                          {item.category}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(item.unitPrice, invoice.currency)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>
                        {formatCurrency(item.total, invoice.currency)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    <Typography fontWeight={700}>Total</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight={700} color="primary">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
