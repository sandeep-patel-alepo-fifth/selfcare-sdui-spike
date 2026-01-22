import { z } from "zod";

// =============================================================================
// Tenant Configuration Schema (Enterprise)
// =============================================================================

export const TenantBrandingSchema = z.object({
  logo: z.string().optional(),
  logoLight: z.string().optional(),        // For dark theme
  favicon: z.string().optional(),
  primaryColor: z.string().default("#6366f1"),
  secondaryColor: z.string().optional(),
  theme: z.enum(["light", "dark", "auto"]).default("light"),
});

export const TenantLocalizationSchema = z.object({
  dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).default("MM/DD/YYYY"),
  timeFormat: z.enum(["12h", "24h"]).default("12h"),
  timezone: z.string().default("America/New_York"),
  currency: z.string().default("USD"),
  locale: z.string().default("en-US"),
  rtl: z.boolean().default(false),
});

export const TenantFeaturesSchema = z.object({
  // Core features
  dashboard: z.boolean().default(true),
  billing: z.boolean().default(true),
  usage: z.boolean().default(true),
  profile: z.boolean().default(true),

  // Advanced features
  familyAccounts: z.boolean().default(false),
  autopay: z.boolean().default(true),
  expressPay: z.boolean().default(false),
  chatbot: z.boolean().default(false),
  creditTransfer: z.boolean().default(false),
  referralProgram: z.boolean().default(false),
  voucherRedemption: z.boolean().default(false),
  dataPassPurchase: z.boolean().default(true),
  planSwitching: z.boolean().default(true),
  supportTickets: z.boolean().default(true),
});

export const TenantIntegrationsSchema = z.object({
  crm: z.object({
    baseUrl: z.string(),
    clientId: z.string(),
  }).optional(),
  billing: z.object({
    baseUrl: z.string(),
  }).optional(),
  payment: z.object({
    stripe: z.object({
      publishableKey: z.string(),
    }).optional(),
    cashApp: z.object({
      enabled: z.boolean(),
      merchantId: z.string().optional(),
    }).optional(),
  }).optional(),
});

export const TenantContactSchema = z.object({
  supportEmail: z.string().email(),
  supportPhone: z.string().optional(),
  businessHours: z.string().optional(),
  address: z.string().optional(),
});

export const TenantConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string().optional(),
  status: z.enum(["active", "suspended", "pending"]).default("active"),

  branding: TenantBrandingSchema,
  localization: TenantLocalizationSchema,
  features: TenantFeaturesSchema,
  integrations: TenantIntegrationsSchema.optional(),
  contact: TenantContactSchema.optional(),
});

export type TenantConfig = z.infer<typeof TenantConfigSchema>;
export type TenantBranding = z.infer<typeof TenantBrandingSchema>;
export type TenantLocalization = z.infer<typeof TenantLocalizationSchema>;
export type TenantFeatures = z.infer<typeof TenantFeaturesSchema>;
export type TenantIntegrations = z.infer<typeof TenantIntegrationsSchema>;
export type TenantContact = z.infer<typeof TenantContactSchema>;

// =============================================================================
// Feature Flag Helpers
// =============================================================================

export type FeatureKey = keyof TenantFeatures;

export function isFeatureEnabled(tenant: TenantConfig, feature: FeatureKey): boolean {
  return tenant.features[feature] === true;
}

// =============================================================================
// Default Tenant Configurations
// =============================================================================

export const DEFAULT_TENANT: TenantConfig = {
  id: "default",
  name: "Selfcare Portal",
  status: "active",
  branding: {
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    theme: "light",
  },
  localization: {
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    timezone: "America/New_York",
    currency: "USD",
    locale: "en-US",
    rtl: false,
  },
  features: {
    dashboard: true,
    billing: true,
    usage: true,
    profile: true,
    familyAccounts: false,
    autopay: true,
    expressPay: false,
    chatbot: false,
    creditTransfer: false,
    referralProgram: false,
    voucherRedemption: false,
    dataPassPurchase: true,
    planSwitching: true,
    supportTickets: true,
  },
};

// Demo tenants for development
export const DEMO_TENANTS: Record<string, TenantConfig> = {
  default: DEFAULT_TENANT,

  telcomax: {
    id: "telcomax",
    name: "TelcoMax",
    domain: "telcomax.selfcare.com",
    status: "active",
    branding: {
      primaryColor: "#6366f1",
      secondaryColor: "#818cf8",
      logo: "/tenants/telcomax/logo.svg",
      theme: "light",
    },
    localization: {
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      timezone: "America/New_York",
      currency: "USD",
      locale: "en-US",
      rtl: false,
    },
    features: {
      dashboard: true,
      billing: true,
      usage: true,
      profile: true,
      familyAccounts: true,
      autopay: true,
      expressPay: true,
      chatbot: true,
      creditTransfer: true,
      referralProgram: true,
      voucherRedemption: true,
      dataPassPurchase: true,
      planSwitching: true,
      supportTickets: true,
    },
    contact: {
      supportEmail: "support@telcomax.com",
      supportPhone: "+1-800-TELCO",
      businessHours: "Mon-Fri 9am-6pm EST",
    },
  },

  mobileplus: {
    id: "mobileplus",
    name: "Mobile Plus",
    domain: "mobileplus.selfcare.com",
    status: "active",
    branding: {
      primaryColor: "#059669",
      secondaryColor: "#10b981",
      logo: "/tenants/mobileplus/logo.svg",
      theme: "light",
    },
    localization: {
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
      timezone: "Europe/London",
      currency: "GBP",
      locale: "en-GB",
      rtl: false,
    },
    features: {
      dashboard: true,
      billing: true,
      usage: true,
      profile: true,
      familyAccounts: false,
      autopay: true,
      expressPay: false,
      chatbot: false,
      creditTransfer: false,
      referralProgram: false,
      voucherRedemption: false,
      dataPassPurchase: true,
      planSwitching: true,
      supportTickets: true,
    },
    contact: {
      supportEmail: "help@mobileplus.co.uk",
    },
  },
};

export function getTenantById(tenantId: string): TenantConfig {
  return DEMO_TENANTS[tenantId] || DEFAULT_TENANT;
}
