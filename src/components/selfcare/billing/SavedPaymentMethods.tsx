"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  Divider,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  CreditCard,
  AccountBalance,
  PhoneAndroid,
  AttachMoney,
  Delete,
  Add,
} from "@mui/icons-material";
import { SavedPaymentMethod, PaymentMethodType } from "@/types/billing";

interface SavedPaymentMethodsProps {
  methods: SavedPaymentMethod[];
  loading?: boolean;
  onDelete?: (methodId: string) => void;
  onSetDefault?: (methodId: string) => void;
  onAdd?: () => void;
}

function getMethodIcon(type: PaymentMethodType): React.ReactNode {
  switch (type) {
    case "card":
      return <CreditCard />;
    case "bank":
      return <AccountBalance />;
    case "cashapp":
      return <AttachMoney />;
    case "mobile_money":
      return <PhoneAndroid />;
    default:
      return <CreditCard />;
  }
}

function formatExpiry(month?: number, year?: number): string | null {
  if (!month || !year) return null;
  return `${month.toString().padStart(2, "0")}/${year}`;
}

export function SavedPaymentMethods({
  methods,
  loading = false,
  onDelete,
  onSetDefault,
  onAdd,
}: SavedPaymentMethodsProps) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Saved Payment Methods</Typography>
          {onAdd && (
            <Button
              startIcon={<Add />}
              variant="outlined"
              size="small"
              onClick={onAdd}
              aria-label="Add payment method"
            >
              Add Payment Method
            </Button>
          )}
        </Box>

        {methods.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
            No saved payment methods
          </Typography>
        ) : (
          <List disablePadding>
            {methods.map((method, index) => (
              <Box key={method.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    py: 2,
                    px: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box sx={{ color: "action.active" }}>
                    {getMethodIcon(method.type)}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2">
                        {method.label}
                      </Typography>
                      {method.isDefault && (
                        <Chip label="Default" size="small" color="primary" />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      **** {method.last4}
                      {method.expiryMonth && method.expiryYear && (
                        <> | Expires {formatExpiry(method.expiryMonth, method.expiryYear)}</>
                      )}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {!method.isDefault && onSetDefault && (
                      <Button
                        size="small"
                        onClick={() => onSetDefault(method.id)}
                        aria-label="Set as default"
                      >
                        Set as default
                      </Button>
                    )}
                    {onDelete && (
                      <IconButton
                        size="small"
                        onClick={() => onDelete(method.id)}
                        aria-label="Delete"
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
