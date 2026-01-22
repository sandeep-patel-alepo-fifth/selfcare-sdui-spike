"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Skeleton,
  Alert,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { Service, ServiceType, ServicesResponse } from "@/types/usage";
import { ServiceCard } from "./ServiceCard";

interface ServicesListProps {
  services?: Service[];
  filterType?: ServiceType;
  onRenew?: (serviceId: string) => void;
  apiUrl?: string;
}

export function ServicesList({
  services: initialServices,
  filterType,
  onRenew,
  apiUrl = "/api/usage/services",
}: ServicesListProps) {
  const [services, setServices] = useState<Service[]>(initialServices || []);
  const [loading, setLoading] = useState(!initialServices);
  const [error, setError] = useState<string | null>(null);

  const fetchServicesData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to load services");
      }
      const result: ServicesResponse = await response.json();
      setServices(result.services);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!initialServices) {
      fetchServicesData();
    }
  }, [initialServices, fetchServicesData]);

  const filteredServices = useMemo(() => {
    if (!filterType) return services;
    return services.filter((service) => service.type === filterType);
  }, [services, filterType]);

  if (loading) {
    return (
      <Box data-testid="services-list-skeleton">
        <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
                <CardContent>
                  <Skeleton variant="text" width={120} height={24} />
                  <Skeleton variant="text" width={80} height={20} sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="100%" sx={{ mt: 2 }} />
                  <Skeleton variant="rectangular" height={8} sx={{ mt: 2, borderRadius: 4 }} />
                  <Skeleton variant="rectangular" height={36} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={fetchServicesData}>
          Retry
        </Button>
      </Box>
    );
  }

  if (filteredServices.length === 0) {
    return (
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
        <CardContent>
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            No active services found
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filteredServices.length} services
      </Typography>
      <Grid container spacing={3}>
        {filteredServices.map((service) => (
          <Grid key={service.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <ServiceCard service={service} onRenew={onRenew} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
