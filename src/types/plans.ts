import { z } from "zod";

// =============================================================================
// Plan Type Enums
// =============================================================================

export const PlanTypeSchema = z.enum(["prepaid", "postpaid", "hybrid"]);
export type PlanType = z.infer<typeof PlanTypeSchema>;

export const PlanCategorySchema = z.enum(["basic", "standard", "premium", "unlimited"]);
export type PlanCategory = z.infer<typeof PlanCategorySchema>;

// =============================================================================
// Plan Feature Types
// =============================================================================

export const PlanFeatureSchema = z.object({
  name: z.string(),
  included: z.boolean(),
  limit: z.string().nullable().optional(), // e.g., "10GB", "Unlimited", "500 mins"
});

export type PlanFeature = z.infer<typeof PlanFeatureSchema>;

// =============================================================================
// Plan Types
// =============================================================================

export const PlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  currency: z.string().default("USD"),
  billingCycle: z.enum(["daily", "weekly", "monthly", "yearly"]).default("monthly"),
  type: PlanTypeSchema,
  category: PlanCategorySchema.optional(),
  data: z.string().nullable(), // e.g., "10GB", "Unlimited"
  voice: z.string().nullable(), // e.g., "500 mins", "Unlimited"
  sms: z.string().nullable(), // e.g., "100 SMS", "Unlimited"
  features: z.array(PlanFeatureSchema),
  popular: z.boolean().default(false), // Highlight as popular/recommended
  tenantIds: z.array(z.string()).optional(), // For tenant-specific visibility
});

export type Plan = z.infer<typeof PlanSchema>;

// =============================================================================
// Plan Summary (for list views)
// =============================================================================

export const PlanSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  currency: z.string().default("USD"),
  billingCycle: z.enum(["daily", "weekly", "monthly", "yearly"]).default("monthly"),
  type: PlanTypeSchema,
  category: PlanCategorySchema.optional(),
  data: z.string().nullable(),
  voice: z.string().nullable(),
  sms: z.string().nullable(),
  popular: z.boolean().default(false),
});

export type PlanSummary = z.infer<typeof PlanSummarySchema>;

// =============================================================================
// Addon Types
// =============================================================================

export const AddonTypeSchema = z.enum(["data", "voice", "sms", "roaming", "entertainment", "security"]);
export type AddonType = z.infer<typeof AddonTypeSchema>;

export const AddonSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  currency: z.string().default("USD"),
  type: AddonTypeSchema,
  value: z.string().nullable(), // e.g., "5GB", "100 mins" for the addon amount
  duration: z.string().nullable(), // e.g., "7 days", "30 days", "one-time"
  recurring: z.boolean().default(false),
  tenantIds: z.array(z.string()).optional(), // For tenant-specific visibility
});

export type Addon = z.infer<typeof AddonSchema>;

// =============================================================================
// Plan Switch Request Types
// =============================================================================

export const PlanSwitchRequestSchema = z.object({
  currentPlanId: z.string(),
  newPlanId: z.string(),
  effectiveDate: z.enum(["immediate", "next_billing_cycle"]).default("next_billing_cycle"),
  keepAddons: z.boolean().default(false),
});

export type PlanSwitchRequest = z.infer<typeof PlanSwitchRequestSchema>;

export const PlanSwitchResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  switchId: z.string().optional(), // Transaction/reference ID
  effectiveDate: z.string().optional(), // ISO date when switch takes effect
  proratedAmount: z.number().optional(), // Amount credited/charged for prorating
  error: z.string().optional(),
});

export type PlanSwitchResponse = z.infer<typeof PlanSwitchResponseSchema>;

// =============================================================================
// Addon Subscription Request Types
// =============================================================================

export const AddonSubscribeRequestSchema = z.object({
  addonId: z.string(),
  autoRenew: z.boolean().default(false),
});

export type AddonSubscribeRequest = z.infer<typeof AddonSubscribeRequestSchema>;

export const AddonSubscribeResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  subscriptionId: z.string().optional(),
  expiryDate: z.string().optional(), // ISO date when addon expires
  error: z.string().optional(),
});

export type AddonSubscribeResponse = z.infer<typeof AddonSubscribeResponseSchema>;

// =============================================================================
// API Response Types
// =============================================================================

export const PlanListResponseSchema = z.object({
  plans: z.array(PlanSummarySchema),
  total: z.number(),
});

export type PlanListResponse = z.infer<typeof PlanListResponseSchema>;

export const AddonListResponseSchema = z.object({
  addons: z.array(AddonSchema),
  total: z.number(),
});

export type AddonListResponse = z.infer<typeof AddonListResponseSchema>;

// =============================================================================
// Current Plan Types (for user's current subscription)
// =============================================================================

export const CurrentPlanSchema = z.object({
  plan: PlanSchema,
  startDate: z.string(), // ISO date
  endDate: z.string().nullable(), // ISO date, null for ongoing
  status: z.enum(["active", "suspended", "pending_switch", "cancelled"]),
  activeAddons: z.array(z.object({
    addon: AddonSchema,
    subscribedDate: z.string(),
    expiryDate: z.string().nullable(),
    autoRenew: z.boolean(),
  })),
  usage: z.object({
    dataUsed: z.string().nullable(),
    dataRemaining: z.string().nullable(),
    voiceUsed: z.string().nullable(),
    voiceRemaining: z.string().nullable(),
    smsUsed: z.string().nullable(),
    smsRemaining: z.string().nullable(),
  }).optional(),
});

export type CurrentPlan = z.infer<typeof CurrentPlanSchema>;
