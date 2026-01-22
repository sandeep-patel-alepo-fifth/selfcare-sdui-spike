"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Alert,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { ShowChart } from "@mui/icons-material";
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { UsageChartData } from "@/types/dashboard";

interface UsageChartProps {
  data?: UsageChartData;
  apiUrl?: string;
  chartType?: "line" | "bar";
}

function formatDateLabel(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function UsageChart({
  data,
  apiUrl = "/api/dashboard/usage-chart",
  chartType = "line",
}: UsageChartProps) {
  const [chartData, setChartData] = useState<UsageChartData | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">(data?.period || "daily");

  const fetchChartData = useCallback(async (selectedPeriod?: "daily" | "weekly" | "monthly") => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(apiUrl, window.location.origin);
      url.searchParams.set("period", selectedPeriod || period);
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to load usage data");
      }
      const result = await response.json();
      setChartData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load usage data");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, period]);

  useEffect(() => {
    if (!data) {
      fetchChartData();
    }
  }, [data, fetchChartData]);

  const handlePeriodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPeriod: "daily" | "weekly" | "monthly" | null
  ) => {
    if (newPeriod) {
      setPeriod(newPeriod);
      if (!data) {
        fetchChartData(newPeriod);
      }
    }
  };

  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}
        data-testid="usage-chart-skeleton"
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={120} />
          </Box>
          <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 1 }} />
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
          <Button variant="outlined" onClick={() => fetchChartData()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || chartData.dataPoints.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <ShowChart color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Usage Over Time
            </Typography>
          </Box>
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            No usage data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Transform data for Recharts
  const formattedData = chartData.dataPoints.map((point) => ({
    ...point,
    name: formatDateLabel(point.date),
  }));

  const ChartComponent = chartType === "bar" ? BarChart : LineChart;

  return (
    <Card
      elevation={0}
      sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ShowChart color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Usage Over Time
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={handlePeriodChange}
            size="small"
          >
            <ToggleButton value="daily">Daily</ToggleButton>
            <ToggleButton value="weekly">Weekly</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ width: "100%", height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              {chartType === "bar" ? (
                <>
                  <Bar dataKey="data" fill="#6366f1" name="Data (GB)" />
                  <Bar dataKey="voice" fill="#22c55e" name="Voice (min)" />
                  <Bar dataKey="sms" fill="#f59e0b" name="SMS" />
                </>
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey="data"
                    stroke="#6366f1"
                    name="Data (GB)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="voice"
                    stroke="#22c55e"
                    name="Voice (min)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="sms"
                    stroke="#f59e0b"
                    name="SMS"
                    strokeWidth={2}
                  />
                </>
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
