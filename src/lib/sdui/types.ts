import type { JsonSchema, UISchemaElement } from "@jsonforms/core";
import type { TenantConfig, FeatureKey } from "@/types/tenant";

// Re-export tenant types from central location
export type { TenantConfig, FeatureKey };

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
