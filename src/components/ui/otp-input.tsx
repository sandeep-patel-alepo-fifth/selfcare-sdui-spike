"use client";

import { forwardRef, useRef, useState, type KeyboardEvent, type ClipboardEvent } from "react";
import { cn } from "@/lib/utils/cn";

export interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

const OTPInput = forwardRef<HTMLDivElement, OTPInputProps>(
  ({ length = 6, value = "", onChange, onComplete, disabled, error, className }, ref) => {
    const [otp, setOtp] = useState<string[]>(value.split("").slice(0, length).concat(Array(length - value.length).fill("")));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const focusInput = (index: number) => {
      if (index >= 0 && index < length) {
        inputRefs.current[index]?.focus();
      }
    };

    const handleChange = (index: number, val: string) => {
      if (!/^\d*$/.test(val)) return;

      const newOtp = [...otp];
      newOtp[index] = val.slice(-1);
      setOtp(newOtp);

      const otpValue = newOtp.join("");
      onChange?.(otpValue);

      if (val && index < length - 1) {
        focusInput(index + 1);
      }

      if (otpValue.length === length && !otpValue.includes("")) {
        onComplete?.(otpValue);
      }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        if (otp[index]) {
          const newOtp = [...otp];
          newOtp[index] = "";
          setOtp(newOtp);
          onChange?.(newOtp.join(""));
        } else if (index > 0) {
          focusInput(index - 1);
        }
      } else if (e.key === "ArrowLeft") {
        focusInput(index - 1);
      } else if (e.key === "ArrowRight") {
        focusInput(index + 1);
      }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      if (pastedData) {
        const newOtp = pastedData.split("").concat(Array(length - pastedData.length).fill(""));
        setOtp(newOtp);
        onChange?.(pastedData);
        focusInput(Math.min(pastedData.length, length - 1));
        if (pastedData.length === length) {
          onComplete?.(pastedData);
        }
      }
    };

    return (
      <div ref={ref} className={cn("flex flex-col gap-2", className)}>
        <div className="flex gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              disabled={disabled}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              className={cn(
                "h-12 w-10 sm:h-14 sm:w-12 text-center text-xl font-semibold rounded-lg border-2 bg-white text-slate-900 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
                error
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-200 hover:border-slate-300"
              )}
            />
          ))}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

OTPInput.displayName = "OTPInput";

export { OTPInput };
