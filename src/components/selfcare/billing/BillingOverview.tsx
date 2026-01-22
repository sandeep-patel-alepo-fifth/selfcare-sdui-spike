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
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Link as MuiLink,
} from "@mui/material";
import {
  AccountBalance,
  CreditCard,
  Receipt,
  Settings,
} from "@mui/icons-material";
import Link from "next/link";
import { BillingAccount, InvoiceSummary, InvoiceStatus } from "@/types/billing";

interface BillingOverviewProps {
  account?: BillingAccount;
  recentInvoices?: InvoiceSummary[];
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

export function BillingOverview({
  account: initialAccount,
  recentInvoices: initialInvoices,
  apiUrl = "/api/billing/balance",
}: BillingOverviewProps) {
  const [account, setAccount] = useState<BillingAccount | null>(initialAccount || null);
  const [recentInvoices, setRecentInvoices] = useState<InvoiceSummary[]>(initialInvoices || []);
  const [loading, setLoading] = useState(!initialAccount);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to load billing information");
      }
      const result = await response.json();
      setAccount(result.account);
      setRecentInvoices(result.recentInvoices || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load billing information");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!initialAccount) {
      fetchBillingData();
    }
  }, [initialAccount, fetchBillingData]);

  if (loading) {
    return (
      <Box data-testid="billing-overview-skeleton">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}>
              <CardContent>
                <Skeleton variant="text" width={120} height={24} />
                <Skeleton variant="text" width={150} height={48} sx={{ my: 2 }} />
                <Skeleton variant="text" width={100} />
                <Skeleton variant="rectangular" height={40} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}>
              <CardContent>
                <Skeleton variant="text" width={100} height={24} />
                <Skeleton variant="text" width={180} sx={{ mt: 2 }} />
                <Skeleton variant="text" width={150} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
              <CardContent>
                <Skeleton variant="text" width={150} height={24} />
                {[1, 2].map((i) => (
                  <Box key={i} sx={{ display: "flex", justifyContent: "space-between", py: 2 }}>
                    <Skeleton variant="text" width={120} />
                    <Skeleton variant="text" width={80} />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
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
        <Button variant="outlined" onClick={fetchBillingData}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!account) {
    return null;
  }

  const isPrepaid = account.accountType === "prepaid";

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Balance Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AccountBalance color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Current Balance
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} color="primary" sx={{ mb: 1 }}>
                {formatCurrency(account.balance, account.currency)}
              </Typography>
              {!isPrepaid && account.dueDate && (
                <Typography variant="body2" color="text.secondary">
                  Due {formatDate(account.dueDate)}
                </Typography>
              )}
              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                <Button variant="contained" fullWidth>
                  {isPrepaid ? "Top Up" : "Pay Now"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Autopay Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CreditCard color="action" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Autopay
                </Typography>
              </Box>
              {account.autopay.enabled ? (
                <>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Chip label="Enabled" color="success" size="small" />
                  </Box>
                  <Typography variant="body2">
                    {account.autopay.paymentType === "card" && "Card ending in "}
                    {account.autopay.paymentType === "bank" && "Bank account ending in "}
                    {account.autopay.paymentType === "wallet" && "Digital wallet ending in "}
                    <strong>{account.autopay.lastFourDigits}</strong>
                  </Typography>
                </>
              ) : (
                <Typography color="text.secondary">
                  Autopay is not enabled
                </Typography>
              )}
              <Box sx={{ mt: 3 }}>
                <MuiLink
                  component={Link}
                  href="/billing/autopay"
                  sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
                >
                  <Settings fontSize="small" />
                  Manage Autopay
                </MuiLink>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Invoices Card */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Receipt color="action" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Recent Invoices
                  </Typography>
                </Box>
                <MuiLink component={Link} href="/billing/bills">
                  View All Bills
                </MuiLink>
              </Box>
              {recentInvoices.length > 0 ? (
                <List disablePadding>
                  {recentInvoices.map((invoice, index) => (
                    <Box key={invoice.id}>
                      {index > 0 && <Divider />}
                      <ListItem
                        disablePadding
                        sx={{ py: 1.5 }}
                        secondaryAction={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Typography fontWeight={600}>
                              {formatCurrency(invoice.amount, invoice.currency)}
                            </Typography>
                            <Chip
                              label={getStatusLabel(invoice.status)}
                              color={getStatusColor(invoice.status)}
                              size="small"
                            />
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={invoice.invoiceNumber}
                          secondary={formatDate(invoice.date)}
                        />
                      </ListItem>
                    </Box>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  No recent invoices
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
