"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Radio,
  Divider,
} from "@mui/material";
import { CreditCard } from "@mui/icons-material";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { PaymentMethodType, PaymentRequest, SavedPaymentMethod } from "@/types/billing";

interface PaymentFormProps {
  onSubmit: (data: PaymentRequest) => void;
  savedMethods?: SavedPaymentMethod[];
  submitting?: boolean;
  error?: string;
}

export function PaymentForm({
  onSubmit,
  savedMethods = [],
  submitting = false,
  error,
}: PaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [paymentMethodType, setPaymentMethodType] = useState<PaymentMethodType>("card");
  const [selectedSavedMethodId, setSelectedSavedMethodId] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const showCardFields = paymentMethodType === "card" && !selectedSavedMethodId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError("Amount is required");
      return;
    }

    const paymentData: PaymentRequest = {
      amount: parsedAmount,
      currency: "USD",
      paymentMethodType,
      savePaymentMethod,
    };

    if (selectedSavedMethodId) {
      paymentData.paymentMethodId = selectedSavedMethodId;
    } else if (paymentMethodType === "card") {
      paymentData.cardNumber = cardNumber;
      paymentData.cardExpiry = cardExpiry;
      paymentData.cardCvv = cardCvv;
      paymentData.cardName = cardName;
    }

    onSubmit(paymentData);
  };

  const handleSelectSavedMethod = (methodId: string) => {
    setSelectedSavedMethodId(methodId);
    const method = savedMethods.find(m => m.id === methodId);
    if (method) {
      setPaymentMethodType(method.type);
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethodType) => {
    setPaymentMethodType(method);
    setSelectedSavedMethodId(null);
  };

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200" }}>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Make a Payment
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {validationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {validationError}
            </Alert>
          )}

          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            required
            disabled={submitting}
            inputProps={{ min: 0, step: "0.01" }}
            sx={{ mb: 3 }}
          />

          {savedMethods.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Saved Payment Methods
              </Typography>
              <List sx={{ mb: 2, border: "1px solid", borderColor: "grey.200", borderRadius: 1 }}>
                {savedMethods.map((method) => (
                  <ListItem key={method.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleSelectSavedMethod(method.id)}
                      selected={selectedSavedMethodId === method.id}
                      disabled={submitting}
                    >
                      <ListItemIcon>
                        <Radio
                          checked={selectedSavedMethodId === method.id}
                          tabIndex={-1}
                        />
                      </ListItemIcon>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CreditCard />
                      </ListItemIcon>
                      <ListItemText
                        primary={method.label}
                        secondary={`**** ${method.last4}`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Or use a new payment method
              </Typography>
            </>
          )}

          <Box sx={{ mb: 3 }}>
            <PaymentMethodSelector
              value={paymentMethodType}
              onChange={handlePaymentMethodChange}
              disabled={submitting}
            />
          </Box>

          {showCardFields && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
              <TextField
                label="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                fullWidth
                disabled={submitting}
                inputProps={{ maxLength: 16 }}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Expiry (MM/YY)"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  disabled={submitting}
                  inputProps={{ maxLength: 5 }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="CVV"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  disabled={submitting}
                  inputProps={{ maxLength: 4 }}
                  sx={{ flex: 1 }}
                />
              </Box>
              <TextField
                label="Name on Card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                fullWidth
                disabled={submitting}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={savePaymentMethod}
                    onChange={(e) => setSavePaymentMethod(e.target.checked)}
                    disabled={submitting}
                  />
                }
                label="Save this payment method for future use"
              />
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={submitting}
          >
            {submitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Processing...
              </>
            ) : (
              `Pay ${amount ? `$${parseFloat(amount).toFixed(2)}` : ""}`
            )}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
