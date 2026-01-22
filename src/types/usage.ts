import { z } from "zod";

// =============================================================================
// Usage Type Enum
// =============================================================================

export const UsageTypeSchema = z.enum(["data", "voice", "sms", "roaming"]);
export type UsageType = z.infer<typeof UsageTypeSchema>;

// =============================================================================
// Usage Record Types
// =============================================================================

export const UsageRecordSchema = z.object({
  id: z.string(),
  date: z.string(), // ISO date string
  type: UsageTypeSchema,
  amount: z.number(),
  unit: z.string(), // e.g., "GB", "minutes", "messages"
  cost: z.number(),
  currency: z.string().default("USD"),
  description: z.string().optional(),
});

export type UsageRecord = z.infer<typeof UsageRecordSchema>;

// =============================================================================
// Usage Summary Types
// =============================================================================

export const UsageSummaryItemSchema = z.object({
  type: UsageTypeSchema,
  used: z.number(),
  total: z.number(),
  unit: z.string(),
  percentage: z.number().min(0).max(100),
  cost: z.number().optional(),
  currency: z.string().default("USD"),
});

export type UsageSummaryItem = z.infer<typeof UsageSummaryItemSchema>;

export const UsageSummarySchema = z.object({
  billingPeriod: z.object({
    start: z.string(),
    end: z.string(),
  }),
  items: z.array(UsageSummaryItemSchema),
  totalCost: z.number(),
  currency: z.string().default("USD"),
});

export type UsageSummary = z.infer<typeof UsageSummarySchema>;

// =============================================================================
// Service Types
// =============================================================================

export const ServiceStatusSchema = z.enum(["active", "suspended", "pending", "expired"]);
export type ServiceStatus = z.infer<typeof ServiceStatusSchema>;

export const ServiceTypeSchema = z.enum(["plan", "addon", "bundle", "feature"]);
export type ServiceType = z.infer<typeof ServiceTypeSchema>;

export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ServiceTypeSchema,
  description: z.string().optional(),
  usage: z.number().optional(), // Current usage amount
  total: z.number().optional(), // Total allowed
  unit: z.string().optional(), // Unit for usage (GB, minutes, etc.)
  status: ServiceStatusSchema,
  renewDate: z.string().nullable(), // ISO date string
  price: z.number().optional(),
  currency: z.string().default("USD"),
});

export type Service = z.infer<typeof ServiceSchema>;

// =============================================================================
// Data Pass Types
// =============================================================================

export const DataPassStatusSchema = z.enum(["available", "active", "expired", "depleted"]);
export type DataPassStatus = z.infer<typeof DataPassStatusSchema>;

export const DataPassSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  dataAmount: z.number(), // Amount in GB
  dataUsed: z.number().optional(), // Used amount (for active passes)
  price: z.number(),
  currency: z.string().default("USD"),
  validity: z.number(), // Validity in days
  status: DataPassStatusSchema,
  expiryDate: z.string().nullable(), // ISO date string (for active passes)
  purchaseDate: z.string().nullable(), // ISO date string
});

export type DataPass = z.infer<typeof DataPassSchema>;

// =============================================================================
// API Request/Response Types
// =============================================================================

export const UsageFiltersSchema = z.object({
  type: UsageTypeSchema.optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type UsageFilters = z.infer<typeof UsageFiltersSchema>;

export const UsageHistoryResponseSchema = z.object({
  records: z.array(UsageRecordSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
});

export type UsageHistoryResponse = z.infer<typeof UsageHistoryResponseSchema>;

export const ServicesResponseSchema = z.object({
  services: z.array(ServiceSchema),
});

export type ServicesResponse = z.infer<typeof ServicesResponseSchema>;

export const DataPassesResponseSchema = z.object({
  available: z.array(DataPassSchema), // Available for purchase
  active: z.array(DataPassSchema), // Currently active
});

export type DataPassesResponse = z.infer<typeof DataPassesResponseSchema>;

export const DataPassPurchaseRequestSchema = z.object({
  dataPassId: z.string(),
  paymentMethodId: z.string().optional(),
});

export type DataPassPurchaseRequest = z.infer<typeof DataPassPurchaseRequestSchema>;

export const DataPassPurchaseResponseSchema = z.object({
  success: z.boolean(),
  dataPass: DataPassSchema.optional(),
  error: z.string().optional(),
});

export type DataPassPurchaseResponse = z.infer<typeof DataPassPurchaseResponseSchema>;
