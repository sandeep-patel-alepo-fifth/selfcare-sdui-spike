"use client";

import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import {
  CreditCard,
  AccountBalance,
  PhoneAndroid,
  AttachMoney,
} from "@mui/icons-material";
import { PaymentMethodType } from "@/types/billing";

interface PaymentMethodOption {
  value: PaymentMethodType;
  label: string;
  icon: React.ReactNode;
}

const paymentMethodOptions: PaymentMethodOption[] = [
  { value: "card", label: "Credit/Debit Card", icon: <CreditCard /> },
  { value: "bank", label: "Bank Transfer", icon: <AccountBalance /> },
  { value: "cashapp", label: "CashApp", icon: <AttachMoney /> },
  { value: "mobile_money", label: "Mobile Money", icon: <PhoneAndroid /> },
];

interface PaymentMethodSelectorProps {
  value: PaymentMethodType;
  onChange: (method: PaymentMethodType) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value as PaymentMethodType);
  };

  return (
    <FormControl component="fieldset" disabled={disabled}>
      <FormLabel component="legend">Payment Method</FormLabel>
      <RadioGroup
        value={value}
        onChange={handleChange}
        aria-label="payment method"
      >
        {paymentMethodOptions.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
            disabled={disabled}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
