import { z } from "zod";

// =============================================================================
// User Schema
// =============================================================================

export const UserSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  firstName: z.string(),
  lastName: z.string(),
  accountType: z.enum(["prepaid", "postpaid"]).default("postpaid"),
  status: z.enum(["active", "suspended", "pending"]).default("active"),
  roles: z.array(z.string()).default(["user"]),
  mfaEnabled: z.boolean().default(false),
  preferences: z.object({
    language: z.string().default("en"),
    notifications: z.object({
      email: z.boolean().default(true),
      sms: z.boolean().default(true),
      push: z.boolean().default(false),
    }),
  }).optional(),
  createdAt: z.string().optional(),
  lastLoginAt: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

// =============================================================================
// Auth State
// =============================================================================

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  phone: string;
  password?: string;
  tenantId: string;
}

export interface OtpVerification {
  phone: string;
  otp: string;
  sessionId?: string;
}

export interface RegistrationData {
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  plan: string;
  planType: "prepaid" | "postpaid";
  tenantId: string;
}

// =============================================================================
// Auth Config (per tenant)
// =============================================================================

export interface AuthConfig {
  // MFA options
  mfa: {
    required: boolean;
    methods: {
      sms: boolean;
      email: boolean;
      totp: boolean;
    };
    defaultMethod: "sms" | "email" | "totp";
  };

  // Password policy
  passwordPolicy: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSpecial: boolean;
    historyCount: number;
    maxAttempts: number;
    lockoutDuration: number; // minutes
  };

  // Session
  session: {
    accessTokenTTL: number; // minutes
    refreshTokenTTL: number; // days
    maxConcurrentSessions: number;
    idleTimeout: number; // minutes
  };
}

export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  mfa: {
    required: true,
    methods: {
      sms: true,
      email: true,
      totp: false,
    },
    defaultMethod: "sms",
  },
  passwordPolicy: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: false,
    historyCount: 3,
    maxAttempts: 5,
    lockoutDuration: 30,
  },
  session: {
    accessTokenTTL: 30,
    refreshTokenTTL: 7,
    maxConcurrentSessions: 3,
    idleTimeout: 15,
  },
};
