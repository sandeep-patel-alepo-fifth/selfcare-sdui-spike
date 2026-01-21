// In-memory OTP store for demo purposes
// In production, use Redis or a database

interface OTPData {
  otp: string;
  expiresAt: number;
  attempts: number;
}

class OTPStore {
  private store = new Map<string, OTPData>();

  set(phone: string, otp: string, expiryMinutes: number = 5): void {
    const cleanPhone = phone.replace(/\D/g, "");
    this.store.set(cleanPhone, {
      otp,
      expiresAt: Date.now() + expiryMinutes * 60 * 1000,
      attempts: 0,
    });
  }

  verify(phone: string, otp: string): { valid: boolean; error?: string } {
    const cleanPhone = phone.replace(/\D/g, "");
    const data = this.store.get(cleanPhone);

    if (!data) {
      return { valid: false, error: "No verification code found. Please request a new one." };
    }

    if (Date.now() > data.expiresAt) {
      this.store.delete(cleanPhone);
      return { valid: false, error: "Verification code expired. Please request a new one." };
    }

    if (data.attempts >= 3) {
      this.store.delete(cleanPhone);
      return { valid: false, error: "Too many attempts. Please request a new code." };
    }

    // For demo: accept "123456" or the actual generated OTP
    if (otp === data.otp || otp === "123456") {
      this.store.delete(cleanPhone);
      return { valid: true };
    }

    // Increment attempts
    data.attempts++;
    this.store.set(cleanPhone, data);

    return { valid: false, error: "Invalid verification code. Please try again." };
  }

  delete(phone: string): void {
    const cleanPhone = phone.replace(/\D/g, "");
    this.store.delete(cleanPhone);
  }
}

// Singleton instance
export const otpStore = new OTPStore();
