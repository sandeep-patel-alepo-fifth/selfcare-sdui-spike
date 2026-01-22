import { z } from "zod";

// =============================================================================
// Balance Types
// =============================================================================

export const AccountTypeSchema = z.enum(["prepaid", "postpaid"]);
export type AccountType = z.infer<typeof AccountTypeSchema>;

export const BalanceDataSchema = z.object({
  current: z.number(),
  currency: z.string().default("USD"),
  accountType: AccountTypeSchema,
  dueDate: z.string().nullable(), // ISO date string, null for prepaid
  creditLimit: z.number().optional(), // For postpaid accounts
  lastPaymentDate: z.string().nullable(),
  lastPaymentAmount: z.number().nullable(),
});

export type BalanceData = z.infer<typeof BalanceDataSchema>;

// =============================================================================
// Services & Usage Types
// =============================================================================

export const ServiceTypeSchema = z.enum(["data", "voice", "sms", "roaming"]);
export type ServiceType = z.infer<typeof ServiceTypeSchema>;

export const ServiceUsageSchema = z.object({
  type: ServiceTypeSchema,
  label: z.string(),
  used: z.number(),
  total: z.number(),
  unit: z.string(),
  unlimited: z.boolean().default(false),
});

export type ServiceUsage = z.infer<typeof ServiceUsageSchema>;

export const ServicesSummaryDataSchema = z.object({
  planName: z.string(),
  renewalDate: z.string(),
  services: z.array(ServiceUsageSchema),
});

export type ServicesSummaryData = z.infer<typeof ServicesSummaryDataSchema>;

// =============================================================================
// Usage Chart Types
// =============================================================================

export const UsageDataPointSchema = z.object({
  date: z.string(),
  data: z.number().optional(),
  voice: z.number().optional(),
  sms: z.number().optional(),
});

export type UsageDataPoint = z.infer<typeof UsageDataPointSchema>;

export const UsageChartDataSchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]),
  dataPoints: z.array(UsageDataPointSchema),
});

export type UsageChartData = z.infer<typeof UsageChartDataSchema>;

// =============================================================================
// Activity Types
// =============================================================================

export const ActivityTypeSchema = z.enum([
  "payment",
  "usage",
  "plan",
  "topup",
  "support",
  "account",
]);
export type ActivityType = z.infer<typeof ActivityTypeSchema>;

export const ActivityItemSchema = z.object({
  id: z.string(),
  type: ActivityTypeSchema,
  title: z.string(),
  description: z.string().optional(),
  amount: z.string().optional(), // Formatted string like "$45.99" or "2.5 GB"
  timestamp: z.string(), // ISO date string
});

export type ActivityItem = z.infer<typeof ActivityItemSchema>;

export const ActivityFeedDataSchema = z.object({
  activities: z.array(ActivityItemSchema),
  hasMore: z.boolean().default(false),
});

export type ActivityFeedData = z.infer<typeof ActivityFeedDataSchema>;

// =============================================================================
// Quick Actions Types
// =============================================================================

export const QuickActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string(),
  href: z.string().optional(),
  action: z.string().optional(), // Action identifier for click handlers
  disabled: z.boolean().default(false),
  primary: z.boolean().default(false),
});

export type QuickAction = z.infer<typeof QuickActionSchema>;

// =============================================================================
// Dashboard API Response Types
// =============================================================================

export const DashboardDataSchema = z.object({
  balance: BalanceDataSchema,
  services: ServicesSummaryDataSchema,
  usageChart: UsageChartDataSchema,
  activity: ActivityFeedDataSchema,
  quickActions: z.array(QuickActionSchema),
});

export type DashboardData = z.infer<typeof DashboardDataSchema>;
