import { z } from "zod";
import type { JsonSchema, UISchemaElement } from "@jsonforms/core";

// =============================================================================
// Tenant Configuration
// =============================================================================

export const TenantConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string().optional(),

  // Branding
  branding: z.object({
    primaryColor: z.string().default("#6366f1"),
    secondaryColor: z.string().optional(),
    logo: z.string().optional(),
    favicon: z.string().optional(),
  }),

  // Feature toggles
  features: z.record(z.boolean()).default({}),

  // Custom config per screen
  screenConfig: z.record(z.unknown()).optional(),
});

export type TenantConfig = z.infer<typeof TenantConfigSchema>;

// =============================================================================
// Screen Configuration
// =============================================================================

/**
 * Screen types:
 * - "form" - Uses JSON Forms for rendering
 * - "layout" - Simple component-based layout
 * - "flow" - Multi-step wizard
 */
export type ScreenType = "form" | "layout" | "flow";

export interface ScreenConfig {
  id: string;
  type: ScreenType;
  title: string;
  description?: string;

  // For "form" type - uses JSON Forms
  form?: {
    schema: JsonSchema;
    uiSchema?: UISchemaElement;
    initialData?: Record<string, unknown>;
  };

  // For "layout" type - simple components
  layout?: {
    components: LayoutComponent[];
  };

  // For "flow" type - multi-step
  flow?: {
    steps: FlowStep[];
    currentStep?: string;
  };

  // Actions available on this screen
  actions?: Record<string, ActionConfig>;
}

export interface LayoutComponent {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: LayoutComponent[];
}

export interface FlowStep {
  id: string;
  title: string;
  screen: ScreenConfig;
}

export interface ActionConfig {
  type: "api" | "navigate" | "setState" | "nextStep" | "prevStep";
  endpoint?: string;
  method?: string;
  route?: string;
  payload?: Record<string, unknown>;
}

// =============================================================================
// Action System
// =============================================================================

export interface ActionContext {
  tenant: TenantConfig;
  screen: ScreenConfig;
  data: Record<string, unknown>;
  state: Record<string, unknown>;
}

export interface ActionResult {
  success: boolean;
  data?: Record<string, unknown>;
  errors?: Record<string, string>;
  navigate?: string;
  nextStep?: boolean;
  prevStep?: boolean;
  toast?: {
    type: "success" | "error" | "info";
    message: string;
  };
}

export type ActionHandler = (ctx: ActionContext) => Promise<ActionResult>;

// =============================================================================
// API Types
// =============================================================================

export interface GetScreenRequest {
  tenantId: string;
  screenId: string;
  params?: Record<string, string>;
}

export interface GetScreenResponse {
  screen: ScreenConfig;
  tenant: Pick<TenantConfig, "id" | "name" | "branding">;
}

export interface ExecuteActionRequest {
  tenantId: string;
  screenId: string;
  action: string;
  data: Record<string, unknown>;
}

export interface ExecuteActionResponse {
  result: ActionResult;
}
