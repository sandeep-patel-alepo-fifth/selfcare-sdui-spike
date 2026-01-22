"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Skeleton,
  Alert,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { InvoiceSummary, InvoiceStatus, InvoiceListResponse } from "@/types/billing";

interface InvoiceListProps {
  data?: InvoiceSummary[];
  apiUrl?: string;
  onInvoiceClick?: (invoice: InvoiceSummary) => void;
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

export function InvoiceList({ data, apiUrl = "/api/billing/invoices", onInvoiceClick }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>(data || []);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchInvoices = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(apiUrl, window.location.origin);
      if (status) {
        url.searchParams.set("status", status);
      }
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to load invoices");
      }
      const result: InvoiceListResponse = await response.json();
      setInvoices(result.invoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!data) {
      fetchInvoices(statusFilter || undefined);
    }
  }, [data, fetchInvoices, statusFilter]);

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    const newStatus = event.target.value;
    setStatusFilter(newStatus);
    if (!data) {
      fetchInvoices(newStatus || undefined);
    }
  };

  const handleRowClick = (invoice: InvoiceSummary) => {
    if (onInvoiceClick) {
      onInvoiceClick(invoice);
    }
  };

  if (loading) {
    return (
      <Box data-testid="invoice-list-skeleton">
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Skeleton variant="rectangular" width={150} height={56} />
        </Box>
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Skeleton width={100} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={60} /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width={120} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={70} /></TableCell>
                  <TableCell><Skeleton width={60} height={24} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => fetchInvoices()}>
          Retry
        </Button>
      </Box>
    );
  }

  if (invoices.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="text.secondary">No invoices found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={statusFilter}
            label="Status"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Invoice Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                hover
                onClick={() => handleRowClick(invoice)}
                sx={{ cursor: onInvoiceClick ? "pointer" : "default" }}
              >
                <TableCell>
                  <Typography fontWeight={600}>{invoice.invoiceNumber}</Typography>
                </TableCell>
                <TableCell>{formatDate(invoice.date)}</TableCell>
                <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell align="right">
                  <Typography fontWeight={600}>
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(invoice.status)}
                    color={getStatusColor(invoice.status)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
