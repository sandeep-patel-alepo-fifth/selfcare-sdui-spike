import { z } from "zod";

// =============================================================================
// Family Role Types
// =============================================================================

export const FamilyRoleSchema = z.enum(["parent", "child"]);
export type FamilyRole = z.infer<typeof FamilyRoleSchema>;

// =============================================================================
// Family Member Status Types
// =============================================================================

export const FamilyMemberStatusSchema = z.enum(["active", "suspended", "pending"]);
export type FamilyMemberStatus = z.infer<typeof FamilyMemberStatusSchema>;

// =============================================================================
// Usage Summary Types (for family member cards)
// =============================================================================

export const UsageSummarySchema = z.object({
  data: z.object({
    used: z.number(), // in GB
    total: z.number(), // in GB
    percentage: z.number().min(0).max(100),
  }),
  voice: z.object({
    used: z.number(), // in minutes
    total: z.number(), // in minutes
    percentage: z.number().min(0).max(100),
  }).optional(),
  sms: z.object({
    used: z.number(),
    total: z.number(),
    percentage: z.number().min(0).max(100),
  }).optional(),
});

export type UsageSummary = z.infer<typeof UsageSummarySchema>;

// =============================================================================
// Parental Controls Types
// =============================================================================

export const ParentalControlsSchema = z.object({
  dataLimit: z.number().nullable(), // in GB, null = no limit
  voiceLimit: z.number().nullable(), // in minutes, null = no limit
  smsLimit: z.number().nullable(), // null = no limit
  contentFiltering: z.boolean().default(false),
  purchaseBlocked: z.boolean().default(false),
  internationalBlocked: z.boolean().default(false),
  premiumServicesBlocked: z.boolean().default(false),
});

export type ParentalControls = z.infer<typeof ParentalControlsSchema>;

// =============================================================================
// Family Member Types
// =============================================================================

export const FamilyMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  role: FamilyRoleSchema,
  status: FamilyMemberStatusSchema,
  planName: z.string(),
  avatarUrl: z.string().nullable().optional(),
  usage: UsageSummarySchema.optional(),
  controls: ParentalControlsSchema.optional(), // Only for child accounts
  addedAt: z.string(), // ISO date string
});

export type FamilyMember = z.infer<typeof FamilyMemberSchema>;

// =============================================================================
// Family Hierarchy Types
// =============================================================================

export const FamilyHierarchySchema = z.object({
  parent: FamilyMemberSchema,
  children: z.array(FamilyMemberSchema),
  maxChildren: z.number().default(5),
  createdAt: z.string(), // ISO date string
  updatedAt: z.string(), // ISO date string
});

export type FamilyHierarchy = z.infer<typeof FamilyHierarchySchema>;

// =============================================================================
// API Request Types
// =============================================================================

export const AddChildRequestSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number is required"),
  nickname: z.string().optional(),
  controls: ParentalControlsSchema.optional(),
});

export type AddChildRequest = z.infer<typeof AddChildRequestSchema>;

export const RemoveChildRequestSchema = z.object({
  childId: z.string(),
  reason: z.string().optional(),
});

export type RemoveChildRequest = z.infer<typeof RemoveChildRequestSchema>;

export const UpdateControlsRequestSchema = z.object({
  controls: ParentalControlsSchema,
});

export type UpdateControlsRequest = z.infer<typeof UpdateControlsRequestSchema>;

// =============================================================================
// API Response Types
// =============================================================================

export const FamilyHierarchyResponseSchema = z.object({
  success: z.boolean(),
  hierarchy: FamilyHierarchySchema.optional(),
  error: z.string().optional(),
});

export type FamilyHierarchyResponse = z.infer<typeof FamilyHierarchyResponseSchema>;

export const AddChildResponseSchema = z.object({
  success: z.boolean(),
  child: FamilyMemberSchema.optional(),
  error: z.string().optional(),
});

export type AddChildResponse = z.infer<typeof AddChildResponseSchema>;

export const RemoveChildResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

export type RemoveChildResponse = z.infer<typeof RemoveChildResponseSchema>;

export const UpdateControlsResponseSchema = z.object({
  success: z.boolean(),
  controls: ParentalControlsSchema.optional(),
  error: z.string().optional(),
});

export type UpdateControlsResponse = z.infer<typeof UpdateControlsResponseSchema>;
