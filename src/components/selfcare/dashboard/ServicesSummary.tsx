"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Skeleton,
  Alert,
  Button,
  Chip,
} from "@mui/material";
import { DataUsage, Phone, Sms, Public, TrendingUp } from "@mui/icons-material";
import { ServicesSummaryData, ServiceType } from "@/types/dashboard";

interface ServicesSummaryProps {
  data?: ServicesSummaryData;
  apiUrl?: string;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getServiceIcon(type: ServiceType) {
  switch (type) {
    case "data":
      return <DataUsage />;
    case "voice":
      return <Phone />;
    case "sms":
      return <Sms />;
    case "roaming":
      return <Public />;
    default:
      return <DataUsage />;
  }
}

export function ServicesSummary({ data, apiUrl = "/api/dashboard/services" }: ServicesSummaryProps) {
  const [services, setServices] = useState<ServicesSummaryData | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to load services");
      }
      const result = await response.json();
      setServices(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!data) {
      fetchServices();
    }
  }, [data, fetchServices]);

  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}
        data-testid="services-summary-skeleton"
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={120} />
          </Box>
          <Skeleton variant="text" width="40%" sx={{ mb: 2 }} />
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4 }} />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}
      >
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="outlined" onClick={fetchServices}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!services) {
    return null;
  }

  return (
    <Card
      elevation={0}
      sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TrendingUp color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Usage This Month
            </Typography>
          </Box>
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {services.planName}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
          Renews {formatDate(services.renewalDate)}
        </Typography>

        {services.services.map((service) => {
          const percentage = service.unlimited ? 100 : (service.used / service.total) * 100;
          const isHighUsage = !service.unlimited && percentage > 80;

          return (
            <Box key={service.type} sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {getServiceIcon(service.type)}
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {service.label}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" color="text.secondary" component="span">
                    {service.unlimited
                      ? `${service.used} ${service.unit} used`
                      : `${service.used} / ${service.total} ${service.unit}`}
                  </Typography>
                  {service.unlimited && (
                    <Chip label="Unlimited" size="small" color="primary" sx={{ height: 20 }} />
                  )}
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(percentage, 100)}
                sx={{ height: 8, borderRadius: 4 }}
                color={isHighUsage ? "warning" : "primary"}
              />
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
}
