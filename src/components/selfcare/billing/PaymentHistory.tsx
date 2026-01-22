"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  CreditCard,
  AccountBalance,
  PhoneAndroid,
  AttachMoney,
} from "@mui/icons-material";
import { Payment, PaymentStatus, PaymentMethodType } from "@/types/billing";

interface PaymentHistoryProps {
  payments: Payment[];
  loading?: boolean;
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

function getStatusColor(status: PaymentStatus): "success" | "warning" | "error" | "default" {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "error";
    case "refunded":
      return "default";
    default:
      return "default";
  }
}

function getStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    case "refunded":
      return "Refunded";
    default:
      return status;
  }
}

function getMethodLabel(method: PaymentMethodType): string {
  switch (method) {
    case "card":
      return "Card";
    case "bank":
      return "Bank";
    case "cashapp":
      return "CashApp";
    case "mobile_money":
      return "Mobile Money";
    default:
      return method;
  }
}

function getMethodIcon(method: PaymentMethodType): React.ReactNode {
  switch (method) {
    case "card":
      return <CreditCard fontSize="small" />;
    case "bank":
      return <AccountBalance fontSize="small" />;
    case "cashapp":
      return <AttachMoney fontSize="small" />;
    case "mobile_money":
      return <PhoneAndroid fontSize="small" />;
    default:
      return null;
  }
}

export function PaymentHistory({ payments, loading = false }: PaymentHistoryProps) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (payments.length === 0) {
    return (
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
        <CardContent>
          <Typography color="text.secondary" align="center">
            No payments found
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
      <List disablePadding>
        {payments.map((payment, index) => (
          <Box key={payment.id}>
            {index > 0 && <Divider />}
            <ListItem
              sx={{
                py: 2,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                gap: 1,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {formatCurrency(payment.amount, payment.currency)}
                  </Typography>
                  <Chip
                    label={getStatusLabel(payment.status)}
                    color={getStatusColor(payment.status)}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {getMethodIcon(payment.method)}
                  <Typography variant="body2" color="text.secondary">
                    {getMethodLabel(payment.method)}
                  </Typography>
                </Box>
                {payment.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {payment.description}
                  </Typography>
                )}
              </Box>
              <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                <Typography variant="body2" fontWeight={500}>
                  {payment.reference}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(payment.date)}
                </Typography>
              </Box>
            </ListItem>
          </Box>
        ))}
      </List>
    </Card>
  );
}
