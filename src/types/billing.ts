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

// =============================================================================
// Payment Types
// =============================================================================

export const PaymentStatusSchema = z.enum(["completed", "pending", "failed", "refunded"]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PaymentMethodTypeSchema = z.enum(["card", "bank", "cashapp", "mobile_money"]);
export type PaymentMethodType = z.infer<typeof PaymentMethodTypeSchema>;

export const PaymentSchema = z.object({
  id: z.string(),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  method: PaymentMethodTypeSchema,
  status: PaymentStatusSchema,
  date: z.string(), // ISO date string
  reference: z.string(),
  description: z.string().optional(),
});

export type Payment = z.infer<typeof PaymentSchema>;

// =============================================================================
// Payment Method Types (Saved payment methods)
// =============================================================================

export const SavedPaymentMethodSchema = z.object({
  id: z.string(),
  type: PaymentMethodTypeSchema,
  last4: z.string().length(4),
  label: z.string(), // e.g., "Visa ending in 4242" or "Bank of America"
  expiryMonth: z.number().min(1).max(12).optional(), // Only for cards
  expiryYear: z.number().optional(), // Only for cards
  isDefault: z.boolean().default(false),
});

export type SavedPaymentMethod = z.infer<typeof SavedPaymentMethodSchema>;

// =============================================================================
// Payment Request Types (for form submission)
// =============================================================================

export const PaymentRequestSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  paymentMethodId: z.string().optional(), // Use saved payment method
  paymentMethodType: PaymentMethodTypeSchema,
  // Card details (required when not using saved method and type is card)
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(), // MM/YY format
  cardCvv: z.string().optional(),
  cardName: z.string().optional(),
  // Save for future use
  savePaymentMethod: z.boolean().default(false),
});

export type PaymentRequest = z.infer<typeof PaymentRequestSchema>;

// =============================================================================
// Payment API Response Types
// =============================================================================

export const PaymentResponseSchema = z.object({
  success: z.boolean(),
  payment: PaymentSchema.optional(),
  error: z.string().optional(),
});

export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;

export const PaymentHistoryResponseSchema = z.object({
  payments: z.array(PaymentSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
});

export type PaymentHistoryResponse = z.infer<typeof PaymentHistoryResponseSchema>;

export const PaymentMethodsResponseSchema = z.object({
  methods: z.array(SavedPaymentMethodSchema),
});

export type PaymentMethodsResponse = z.infer<typeof PaymentMethodsResponseSchema>;

// =============================================================================
// Autopay Configuration Types
// =============================================================================

export const AutopayScheduleTypeSchema = z.enum(["day_of_month", "due_date", "threshold"]);
export type AutopayScheduleType = z.infer<typeof AutopayScheduleTypeSchema>;

export const AutopayConfigSchema = z.object({
  enabled: z.boolean(),
  paymentMethodId: z.string().nullable(),
  scheduleType: AutopayScheduleTypeSchema,
  dayOfMonth: z.number().min(1).max(28).nullable(), // 1-28 to avoid month-end issues
  thresholdAmount: z.number().positive().nullable(), // Trigger when balance exceeds this
  maxPaymentAmount: z.number().positive().nullable(), // Cap per autopay transaction
  paymentMethodLabel: z.string().nullable(), // Display name like "Visa ending in 4242"
  paymentMethodType: PaymentMethodTypeSchema.nullable(),
  lastPaymentDate: z.string().nullable(), // ISO date string
  lastPaymentAmount: z.number().nullable(),
  nextScheduledDate: z.string().nullable(), // ISO date string
  createdAt: z.string(), // ISO date string
  updatedAt: z.string(), // ISO date string
});

export type AutopayConfig = z.infer<typeof AutopayConfigSchema>;

// =============================================================================
// Autopay Request Types
// =============================================================================

export const AutopayEnrollRequestSchema = z.object({
  paymentMethodId: z.string(),
  scheduleType: AutopayScheduleTypeSchema,
  dayOfMonth: z.number().min(1).max(28).optional(),
  thresholdAmount: z.number().positive().optional(),
  maxPaymentAmount: z.number().positive().optional(),
});

export type AutopayEnrollRequest = z.infer<typeof AutopayEnrollRequestSchema>;

export const AutopayUpdateRequestSchema = z.object({
  paymentMethodId: z.string().optional(),
  scheduleType: AutopayScheduleTypeSchema.optional(),
  dayOfMonth: z.number().min(1).max(28).optional(),
  thresholdAmount: z.number().positive().optional(),
  maxPaymentAmount: z.number().positive().optional(),
});

export type AutopayUpdateRequest = z.infer<typeof AutopayUpdateRequestSchema>;

// =============================================================================
// Autopay API Response Types
// =============================================================================

export const AutopayResponseSchema = z.object({
  success: z.boolean(),
  autopay: AutopayConfigSchema.optional(),
  error: z.string().optional(),
});

export type AutopayResponse = z.infer<typeof AutopayResponseSchema>;
