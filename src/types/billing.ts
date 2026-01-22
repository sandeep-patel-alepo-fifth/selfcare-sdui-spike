import { z } from "zod";

// =============================================================================
// Invoice Status Types
// =============================================================================

export const InvoiceStatusSchema = z.enum(["paid", "pending", "overdue", "processing"]);
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

// =============================================================================
// Line Item Types
// =============================================================================

export const LineItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number().min(0),
  unitPrice: z.number(),
  total: z.number(),
  category: z.string().optional(), // e.g., "Data", "Voice", "SMS", "Fees"
});

export type LineItem = z.infer<typeof LineItemSchema>;

// =============================================================================
// Invoice Types
// =============================================================================

export const InvoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  date: z.string(), // ISO date string
  dueDate: z.string(), // ISO date string
  amount: z.number(),
  currency: z.string().default("USD"),
  status: InvoiceStatusSchema,
  lineItems: z.array(LineItemSchema),
  billingPeriod: z.object({
    start: z.string(), // ISO date string
    end: z.string(), // ISO date string
  }),
  paidDate: z.string().nullable().optional(), // ISO date string when paid
  downloadUrl: z.string().optional(), // URL to download PDF
});

export type Invoice = z.infer<typeof InvoiceSchema>;

// =============================================================================
// Invoice Summary (for list views)
// =============================================================================

export const InvoiceSummarySchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  date: z.string(),
  dueDate: z.string(),
  amount: z.number(),
  currency: z.string().default("USD"),
  status: InvoiceStatusSchema,
});

export type InvoiceSummary = z.infer<typeof InvoiceSummarySchema>;

// =============================================================================
// Autopay Settings Types
// =============================================================================

export const AutopaySettingsSchema = z.object({
  enabled: z.boolean(),
  paymentMethodId: z.string().nullable(),
  lastFourDigits: z.string().nullable(), // Last 4 digits of card/account
  paymentType: z.enum(["card", "bank", "wallet"]).nullable(),
});

export type AutopaySettings = z.infer<typeof AutopaySettingsSchema>;

// =============================================================================
// Billing Account Types
// =============================================================================

export const BillingAccountSchema = z.object({
  balance: z.number(),
  currency: z.string().default("USD"),
  dueDate: z.string().nullable(), // ISO date string, null if no pending balance
  accountType: z.enum(["prepaid", "postpaid"]),
  autopay: AutopaySettingsSchema,
  lastPaymentDate: z.string().nullable(),
  lastPaymentAmount: z.number().nullable(),
});

export type BillingAccount = z.infer<typeof BillingAccountSchema>;

// =============================================================================
// API Request/Response Types
// =============================================================================

export const InvoiceFiltersSchema = z.object({
  status: InvoiceStatusSchema.optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type InvoiceFilters = z.infer<typeof InvoiceFiltersSchema>;

export const InvoiceListResponseSchema = z.object({
  invoices: z.array(InvoiceSummarySchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
});

export type InvoiceListResponse = z.infer<typeof InvoiceListResponseSchema>;
