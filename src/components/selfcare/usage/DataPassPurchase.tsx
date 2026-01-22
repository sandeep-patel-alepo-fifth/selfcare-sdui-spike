"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Skeleton,
  Alert,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from "@mui/material";
import { DataPass, DataPassesResponse } from "@/types/usage";
import { DataPassCard } from "./DataPassCard";

interface DataPassPurchaseProps {
  available?: DataPass[];
  active?: DataPass[];
  apiUrl?: string;
  purchaseApiUrl?: string;
}

function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function DataPassPurchase({
  available: initialAvailable,
  active: initialActive,
  apiUrl = "/api/usage/data-passes",
  purchaseApiUrl = "/api/usage/data-passes/purchase",
}: DataPassPurchaseProps) {
  const [available, setAvailable] = useState<DataPass[]>(initialAvailable || []);
  const [active, setActive] = useState<DataPass[]>(initialActive || []);
  const [loading, setLoading] = useState(!initialAvailable);
  const [error, setError] = useState<string | null>(null);
  const [selectedPass, setSelectedPass] = useState<DataPass | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchDataPasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to load data passes");
      }
      const result: DataPassesResponse = await response.json();
      setAvailable(result.available);
      setActive(result.active);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data passes");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!initialAvailable) {
      fetchDataPasses();
    }
  }, [initialAvailable, fetchDataPasses]);

  const handlePurchaseClick = (dataPassId: string) => {
    const pass = available.find((p) => p.id === dataPassId);
    if (pass) {
      setSelectedPass(pass);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPass) return;

    setPurchasing(true);
    try {
      const response = await fetch(purchaseApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataPassId: selectedPass.id }),
      });

      if (!response.ok) {
        throw new Error("Purchase failed");
      }

      setShowSuccess(true);
      setSelectedPass(null);
      // Refresh the list
      fetchDataPasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setPurchasing(false);
    }
  };

  const handleCancelPurchase = () => {
    setSelectedPass(null);
  };

  if (loading) {
    return (
      <Box data-testid="data-pass-purchase-skeleton">
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
                <CardContent>
                  <Skeleton variant="text" width={120} height={24} />
                  <Skeleton variant="text" width={80} height={20} sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="100%" sx={{ mt: 2 }} />
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
        <Button variant="outlined" onClick={fetchDataPasses}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Active Data Passes */}
      {active.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Your Active Data Passes
          </Typography>
          <Grid container spacing={3}>
            {active.map((dataPass) => (
              <Grid key={dataPass.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <DataPassCard dataPass={dataPass} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Available Data Passes */}
      <Box>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Available Data Passes
        </Typography>
        {available.length === 0 ? (
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
            <CardContent>
              <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                No data passes available for purchase
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {available.map((dataPass) => (
              <Grid key={dataPass.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <DataPassCard dataPass={dataPass} onPurchase={handlePurchaseClick} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={!!selectedPass} onClose={handleCancelPurchase}>
        <DialogTitle>Confirm Purchase</DialogTitle>
        <DialogContent>
          {selectedPass && (
            <DialogContentText>
              Are you sure you want to purchase{" "}
              <strong>{selectedPass.name}</strong> ({selectedPass.dataAmount} GB) for{" "}
              <strong>{formatCurrency(selectedPass.price, selectedPass.currency)}</strong>?
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelPurchase} disabled={purchasing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmPurchase}
            disabled={purchasing}
          >
            {purchasing ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        message="Purchase successful! Your data pass is now active."
      />
    </Box>
  );
}
