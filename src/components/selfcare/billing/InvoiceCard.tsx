"use client";

import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import { Receipt } from "@mui/icons-material";
import { InvoiceSummary, InvoiceStatus } from "@/types/billing";

interface InvoiceCardProps {
  invoice: InvoiceSummary;
  onClick?: (invoice: InvoiceSummary) => void;
  onViewDetails?: (invoiceId: string) => void;
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

export function InvoiceCard({ invoice, onClick, onViewDetails }: InvoiceCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(invoice);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(invoice.id);
    }
  };

  const cardContent = (
    <CardContent>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Receipt color="action" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight={600}>
            {invoice.invoiceNumber}
          </Typography>
        </Box>
        <Chip
          label={getStatusLabel(invoice.status)}
          color={getStatusColor(invoice.status)}
          size="small"
        />
      </Box>

      <Typography variant="h5" fontWeight={700} color="primary" sx={{ mb: 1 }}>
        {formatCurrency(invoice.amount, invoice.currency)}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {formatDate(invoice.date)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Due {formatDate(invoice.dueDate)}
      </Typography>

      {onViewDetails && (
        <Button
          variant="outlined"
          size="small"
          onClick={handleViewDetails}
          sx={{ mt: 2 }}
        >
          View Details
        </Button>
      )}
    </CardContent>
  );

  return (
    <Card
      elevation={0}
      sx={{ border: "1px solid", borderColor: "grey.200" }}
      role="article"
      onClick={onClick ? handleClick : undefined}
      data-testid="invoice-card"
    >
      {onClick ? (
        <CardActionArea component="div">
          {cardContent}
        </CardActionArea>
      ) : (
        cardContent
      )}
    </Card>
  );
}
