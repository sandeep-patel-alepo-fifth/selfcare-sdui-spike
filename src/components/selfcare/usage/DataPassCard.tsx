"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
import { DataPass, DataPassStatus } from "@/types/usage";

interface DataPassCardProps {
  dataPass: DataPass;
  onPurchase?: (dataPassId: string) => void;
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

function getStatusLabel(status: DataPassStatus): string {
  switch (status) {
    case "available":
      return "Available";
    case "active":
      return "Active";
    case "expired":
      return "Expired";
    case "depleted":
      return "Depleted";
    default:
      return status;
  }
}

function getStatusColor(status: DataPassStatus): "success" | "primary" | "error" | "warning" {
  switch (status) {
    case "available":
      return "primary";
    case "active":
      return "success";
    case "expired":
      return "error";
    case "depleted":
      return "warning";
    default:
      return "primary";
  }
}

function calculatePercentage(used: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

export function DataPassCard({ dataPass, onPurchase }: DataPassCardProps) {
  const isActive = dataPass.status === "active";
  const isAvailable = dataPass.status === "available";
  const hasUsageData = isActive && dataPass.dataUsed !== undefined;
  const percentage = hasUsageData ? calculatePercentage(dataPass.dataUsed!, dataPass.dataAmount) : 0;
  const remainingData = hasUsageData ? dataPass.dataAmount - dataPass.dataUsed! : dataPass.dataAmount;

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}>
      <CardContent>
        {/* Header with name and status */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {dataPass.name}
          </Typography>
          <Chip
            label={getStatusLabel(dataPass.status)}
            color={getStatusColor(dataPass.status)}
            size="small"
          />
        </Box>

        {/* Description */}
        {dataPass.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {dataPass.description}
          </Typography>
        )}

        {/* Data Amount and Validity */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={700} color="primary">
            {dataPass.dataAmount} GB
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Valid for {dataPass.validity} days
          </Typography>
        </Box>

        {/* Usage Progress (for active passes) */}
        {hasUsageData && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              color={percentage >= 90 ? "error" : percentage >= 75 ? "warning" : "primary"}
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {remainingData} GB remaining
            </Typography>
          </Box>
        )}

        {/* Expiry Date (for active passes) */}
        {isActive && dataPass.expiryDate && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            Expires {formatDate(dataPass.expiryDate)}
          </Typography>
        )}

        {/* Price and Purchase Action */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {formatCurrency(dataPass.price, dataPass.currency)}
          </Typography>
          {isAvailable && onPurchase && (
            <Button
              variant="contained"
              size="small"
              startIcon={<ShoppingCart />}
              onClick={() => onPurchase(dataPass.id)}
            >
              Buy Now
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
