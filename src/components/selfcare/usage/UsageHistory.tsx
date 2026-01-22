"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Skeleton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
} from "@mui/material";
import { UsageRecord, UsageType, UsageHistoryResponse } from "@/types/usage";

interface UsageHistoryProps {
  records?: UsageRecord[];
  apiUrl?: string;
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

function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTypeLabel(type: UsageType): string {
  switch (type) {
    case "data":
      return "Data";
    case "voice":
      return "Voice";
    case "sms":
      return "SMS";
    case "roaming":
      return "Roaming";
    default:
      return type;
  }
}

function getTypeColor(type: UsageType): "primary" | "success" | "info" | "warning" {
  switch (type) {
    case "data":
      return "primary";
    case "voice":
      return "success";
    case "sms":
      return "info";
    case "roaming":
      return "warning";
    default:
      return "primary";
  }
}

export function UsageHistory({
  records: initialRecords,
  apiUrl = "/api/usage/history",
}: UsageHistoryProps) {
  const [records, setRecords] = useState<UsageRecord[]>(initialRecords || []);
  const [loading, setLoading] = useState(!initialRecords);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchHistoryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}?page=${page}&limit=10`);
      if (!response.ok) {
        throw new Error("Failed to load usage history");
      }
      const result: UsageHistoryResponse = await response.json();
      setRecords(result.records);
      setHasMore(result.hasMore);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load usage history");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, page]);

  useEffect(() => {
    if (!initialRecords) {
      fetchHistoryData();
    }
  }, [initialRecords, fetchHistoryData]);

  if (loading) {
    return (
      <Box data-testid="usage-history-skeleton">
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={50} /></TableCell>
                <TableCell><Skeleton width={70} /></TableCell>
                <TableCell><Skeleton width={50} /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width={100} /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
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
        <Button variant="outlined" onClick={fetchHistoryData}>
          Retry
        </Button>
      </Box>
    );
  }

  if (records.length === 0) {
    return (
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
        <CardContent>
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            No usage records found
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell align="right">Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} hover>
                <TableCell>
                  <Typography variant="body2">{formatDate(record.date)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(record.date)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getTypeLabel(record.type)}
                    color={getTypeColor(record.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{record.description || "-"}</TableCell>
                <TableCell>{record.amount} {record.unit}</TableCell>
                <TableCell align="right">
                  <Typography fontWeight={600}>
                    {formatCurrency(record.cost, record.currency)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {hasMore && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
}
