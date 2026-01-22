"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Schedule,
  CreditCard,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { AutopayConfig } from "@/types/billing";

interface AutopayStatusProps {
  config: AutopayConfig | null;
  loading?: boolean;
  onManage?: () => void;
  onEnable?: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

export function AutopayStatus({
  config,
  loading = false,
  onManage,
  onEnable,
}: AutopayStatusProps) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isEnabled = config?.enabled ?? false;

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Schedule color="primary" />
            <Typography variant="h6">Autopay</Typography>
          </Box>
          <Chip
            icon={isEnabled ? <CheckCircle /> : <Cancel />}
            label={isEnabled ? "Enabled" : "Disabled"}
            color={isEnabled ? "success" : "default"}
            size="small"
          />
        </Box>

        {isEnabled && config ? (
          <>
            {/* Payment Method */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
              >
                Payment Method
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CreditCard fontSize="small" color="action" />
                <Typography variant="body1">
                  {config.paymentMethodLabel}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Schedule */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
              >
                Schedule
              </Typography>
              {config.scheduleType === "day_of_month" && config.dayOfMonth && (
                <Typography variant="body1">
                  Pays on the {getOrdinalSuffix(config.dayOfMonth)} of each month
                </Typography>
              )}
              {config.scheduleType === "due_date" && (
                <Typography variant="body1">
                  Pays on due date of each invoice
                </Typography>
              )}
              {config.scheduleType === "threshold" && config.thresholdAmount && (
                <Typography variant="body1">
                  Pays when balance exceeds {formatCurrency(config.thresholdAmount)}
                </Typography>
              )}
            </Box>

            {/* Next Scheduled */}
            {config.nextScheduledDate && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                >
                  Next Scheduled Payment
                </Typography>
                <Typography variant="body1">
                  {formatDate(config.nextScheduledDate)}
                </Typography>
              </Box>
            )}

            {/* Max Payment */}
            {config.maxPaymentAmount && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                >
                  Maximum Payment
                </Typography>
                <Typography variant="body1">
                  {formatCurrency(config.maxPaymentAmount)}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Last Payment */}
            {config.lastPaymentDate && config.lastPaymentAmount && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                >
                  Last Autopay Payment
                </Typography>
                <Typography variant="body1">
                  {formatCurrency(config.lastPaymentAmount)} on{" "}
                  {formatDate(config.lastPaymentDate)}
                </Typography>
              </Box>
            )}

            {/* Manage Button */}
            {onManage && (
              <Button
                variant="outlined"
                onClick={onManage}
                fullWidth
                sx={{ mt: 2 }}
              >
                Manage Autopay
              </Button>
            )}
          </>
        ) : (
          /* Disabled State */
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Autopay is not enabled. Set up automatic payments to never miss a
              due date.
            </Typography>
            {onEnable && (
              <Button variant="contained" onClick={onEnable}>
                Enable Autopay
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
