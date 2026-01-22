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
import { Autorenew } from "@mui/icons-material";
import { Service, ServiceStatus, ServiceType } from "@/types/usage";

interface ServiceCardProps {
  service: Service;
  onRenew?: (serviceId: string) => void;
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

function getStatusLabel(status: ServiceStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "suspended":
      return "Suspended";
    case "pending":
      return "Pending";
    case "expired":
      return "Expired";
    default:
      return status;
  }
}

function getStatusColor(status: ServiceStatus): "success" | "warning" | "error" | "info" {
  switch (status) {
    case "active":
      return "success";
    case "suspended":
      return "warning";
    case "expired":
      return "error";
    case "pending":
      return "info";
    default:
      return "info";
  }
}

function getTypeLabel(type: ServiceType): string {
  switch (type) {
    case "plan":
      return "Plan";
    case "addon":
      return "Add-on";
    case "bundle":
      return "Bundle";
    case "feature":
      return "Feature";
    default:
      return type;
  }
}

function calculatePercentage(usage: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((usage / total) * 100));
}

export function ServiceCard({ service, onRenew }: ServiceCardProps) {
  const hasUsageData = service.usage !== undefined && service.total !== undefined;
  const percentage = hasUsageData ? calculatePercentage(service.usage!, service.total!) : 0;
  const canRenew = service.status === "active" || service.status === "pending";

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}>
      <CardContent>
        {/* Header with name and status */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {service.name}
            </Typography>
            <Chip
              label={getTypeLabel(service.type)}
              size="small"
              variant="outlined"
              sx={{ mt: 0.5 }}
            />
          </Box>
          <Chip
            label={getStatusLabel(service.status)}
            color={getStatusColor(service.status)}
            size="small"
          />
        </Box>

        {/* Description */}
        {service.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {service.description}
          </Typography>
        )}

        {/* Usage Progress */}
        {hasUsageData && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2">
                {service.usage}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                of {service.total} {service.unit}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={percentage}
              color={percentage >= 90 ? "error" : percentage >= 75 ? "warning" : "primary"}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              {percentage}% used
            </Typography>
          </Box>
        )}

        {/* Price and Renewal */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
          <Box>
            {service.price !== undefined && (
              <Typography variant="h6" fontWeight={600} color="primary">
                {formatCurrency(service.price, service.currency)}
              </Typography>
            )}
            {service.renewDate && (
              <Typography variant="caption" color="text.secondary">
                Renews {formatDate(service.renewDate)}
              </Typography>
            )}
          </Box>
          {onRenew && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Autorenew />}
              onClick={() => onRenew(service.id)}
              disabled={!canRenew}
            >
              Renew
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
