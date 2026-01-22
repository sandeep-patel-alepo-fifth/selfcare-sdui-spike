import { z } from "zod";

// =============================================================================
// Profile Schema
// =============================================================================

export const ProfileSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().min(1, "Phone number is required"),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;

// =============================================================================
// Profile Update Schema
// =============================================================================

export const ProfileUpdateSchema = ProfileSchema.omit({
  id: true,
  phone: true, // Phone cannot be changed directly
  createdAt: true,
  updatedAt: true,
});

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

// =============================================================================
// User Preferences Schema
// =============================================================================

export const NotificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  sms: z.boolean().default(true),
  push: z.boolean().default(false),
});

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

export const UserPreferencesSchema = z.object({
  language: z.string().default("en"),
  theme: z.enum(["light", "dark", "auto"]).default("auto"),
  notifications: NotificationPreferencesSchema,
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

// =============================================================================
// Password Change Schema
// =============================================================================

export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(8, "Password must be at least 8 characters"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

export type PasswordChange = z.infer<typeof PasswordChangeSchema>;

// =============================================================================
// MFA Settings Schema
// =============================================================================

export const MfaSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  method: z.enum(["sms", "email", "totp"]).default("sms"),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export type MfaSettings = z.infer<typeof MfaSettingsSchema>;

// =============================================================================
// Session Schema
// =============================================================================

export const SessionSchema = z.object({
  id: z.string(),
  device: z.string(),
  browser: z.string(),
  location: z.string().optional(),
  ipAddress: z.string(),
  lastActive: z.string(),
  current: z.boolean().default(false),
});

export type Session = z.infer<typeof SessionSchema>;

// =============================================================================
// API Response Types
// =============================================================================

export interface ProfileApiResponse {
  profile: Profile;
  preferences: UserPreferences;
}

export interface SessionsApiResponse {
  sessions: Session[];
}

export interface PasswordChangeResponse {
  success: boolean;
  message: string;
}

export interface MfaToggleResponse {
  success: boolean;
  enabled: boolean;
  message: string;
}
