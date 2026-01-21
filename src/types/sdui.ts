import { z } from "zod";

// ============================================================================
// Base Types
// ============================================================================

export const ComponentTypeSchema = z.enum([
  // Layout
  "container",
  "grid",
  "flex",
  "stack",
  "spacer",
  // Data Display
  "text",
  "heading",
  "card",
  "image",
  "avatar",
  "badge",
  "kpi",
  "list",
  "listItem",
  "divider",
  // Input
  "input",
  "textarea",
  "select",
  "checkbox",
  "radio",
  "switch",
  "slider",
  "datePicker",
  "otp",
  // Navigation
  "button",
  "link",
  "tabs",
  "stepper",
  "breadcrumb",
  // Feedback
  "alert",
  "progress",
  "skeleton",
  "spinner",
  // Domain-Specific
  "usageWidget",
  "planCard",
  "billingCard",
  "welcomeSlide",
  // Charts
  "chart",
]);

export type ComponentType = z.infer<typeof ComponentTypeSchema>;

// ============================================================================
// Conditions for Conditional Rendering
// ============================================================================

export const ConditionOperatorSchema = z.enum([
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "contains",
  "notContains",
  "startsWith",
  "endsWith",
  "in",
  "notIn",
  "exists",
  "notExists",
]);

export const RenderConditionSchema = z.object({
  field: z.string(), // Path to field in context, e.g., "user.plan.type"
  operator: ConditionOperatorSchema,
  value: z.any().optional(),
});

export const ConditionGroupSchema: z.ZodType<ConditionGroup> = z.lazy(() =>
  z.object({
    operator: z.enum(["and", "or"]),
    conditions: z.array(z.union([RenderConditionSchema, ConditionGroupSchema])),
  })
);

export type RenderCondition = z.infer<typeof RenderConditionSchema>;
export type ConditionGroup = {
  operator: "and" | "or";
  conditions: (RenderCondition | ConditionGroup)[];
};

// ============================================================================
// Actions
// ============================================================================

export const ActionTriggerSchema = z.enum([
  "click",
  "submit",
  "change",
  "blur",
  "focus",
  "mount",
  "unmount",
]);

export const ActionTypeSchema = z.enum([
  "navigate",
  "navigateBack",
  "apiCall",
  "setState",
  "setPersistentState",
  "setField",
  "showToast",
  "openModal",
  "closeModal",
  "nextStep",
  "prevStep",
  "goToStep",
  "submit",
  "validate",
  "custom",
]);

// Define Action type first for self-referential schema
export interface Action {
  id?: string;
  trigger: z.infer<typeof ActionTriggerSchema>;
  type: z.infer<typeof ActionTypeSchema>;
  payload?: Record<string, unknown>;
  condition?: RenderCondition | ConditionGroup;
  onSuccess?: Action[];
  onError?: Action[];
}

export const ActionSchema: z.ZodType<Action> = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    trigger: ActionTriggerSchema,
    type: ActionTypeSchema,
    payload: z.record(z.any()).optional(),
    condition: z.union([RenderConditionSchema, ConditionGroupSchema]).optional(),
    onSuccess: z.array(ActionSchema).optional(),
    onError: z.array(ActionSchema).optional(),
  })
);

// ============================================================================
// Layout Configuration
// ============================================================================

export const LayoutConfigSchema = z.object({
  type: z.enum(["grid", "flex", "stack"]).optional(),
  columns: z.union([z.number(), z.record(z.number())]).optional(), // { sm: 1, md: 2, lg: 3 }
  rows: z.number().optional(),
  gap: z.union([z.number(), z.string()]).optional(),
  padding: z.union([z.number(), z.string()]).optional(),
  margin: z.union([z.number(), z.string()]).optional(),
  align: z.enum(["start", "center", "end", "stretch", "baseline"]).optional(),
  justify: z.enum(["start", "center", "end", "between", "around", "evenly"]).optional(),
  wrap: z.boolean().optional(),
  direction: z.enum(["row", "column", "row-reverse", "column-reverse"]).optional(),
});

export type LayoutConfig = z.infer<typeof LayoutConfigSchema>;

// ============================================================================
// Data Binding
// ============================================================================

export const DataBindingSchema = z.object({
  source: z.enum(["context", "api", "state", "form"]),
  path: z.string(), // Dot-notation path, e.g., "user.profile.name"
  transform: z.string().optional(), // Transform function name
  fallback: z.any().optional(),
});

export type DataBinding = z.infer<typeof DataBindingSchema>;

// ============================================================================
// Validation Rules
// ============================================================================

export const ValidationRuleSchema = z.object({
  type: z.enum([
    "required",
    "email",
    "phone",
    "minLength",
    "maxLength",
    "min",
    "max",
    "pattern",
    "custom",
  ]),
  value: z.any().optional(),
  message: z.string(),
});

export type ValidationRule = z.infer<typeof ValidationRuleSchema>;

// ============================================================================
// Component Schema
// ============================================================================

export const ComponentPropsSchema = z.record(z.any());

export const BaseComponentSchema = z.object({
  id: z.string(),
  type: ComponentTypeSchema,
  props: ComponentPropsSchema.optional(),
  className: z.string().optional(),
  style: z.record(z.string()).optional(),
  dataBinding: z.record(DataBindingSchema).optional(),
  conditions: z.union([RenderConditionSchema, ConditionGroupSchema]).optional(),
  actions: z.array(ActionSchema).optional(),
  validation: z.array(ValidationRuleSchema).optional(),
});

export const ComponentSchema: z.ZodType<ComponentNode> = BaseComponentSchema.extend({
  children: z.array(z.lazy(() => ComponentSchema)).optional(),
  layout: LayoutConfigSchema.optional(),
});

export type ComponentNode = z.infer<typeof BaseComponentSchema> & {
  children?: ComponentNode[];
  layout?: LayoutConfig;
};

// ============================================================================
// Screen Schema
// ============================================================================

export const ScreenMetaSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  requiresAuth: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const ScreenSchema = z.object({
  $schema: z.string().optional(),
  version: z.string(),
  id: z.string(),
  type: z.literal("screen"),
  meta: ScreenMetaSchema.optional(),
  layout: LayoutConfigSchema.optional(),
  components: z.array(ComponentSchema),
  initialState: z.record(z.any()).optional(),
  dataFetching: z
    .array(
      z.object({
        id: z.string(),
        endpoint: z.string(),
        method: z.enum(["GET", "POST", "PUT", "DELETE"]).optional(),
        params: z.record(z.any()).optional(),
        transform: z.string().optional(),
        refetchInterval: z.number().optional(),
      })
    )
    .optional(),
});

export type Screen = z.infer<typeof ScreenSchema>;

// ============================================================================
// Flow Schema (Multi-screen flows like Onboarding)
// ============================================================================

export const FlowStepSchema = z.object({
  id: z.string(),
  screenId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  conditions: z.union([RenderConditionSchema, ConditionGroupSchema]).optional(),
  onEnter: z.array(ActionSchema).optional(),
  onExit: z.array(ActionSchema).optional(),
});

export const FlowSchema = z.object({
  $schema: z.string().optional(),
  version: z.string(),
  id: z.string(),
  type: z.literal("flow"),
  meta: ScreenMetaSchema.optional(),
  steps: z.array(FlowStepSchema),
  initialStep: z.string().optional(),
  onComplete: z.array(ActionSchema).optional(),
  sharedState: z.record(z.any()).optional(),
});

export type FlowStep = z.infer<typeof FlowStepSchema>;
export type Flow = z.infer<typeof FlowSchema>;

// ============================================================================
// Theme Schema
// ============================================================================

export const ThemeSchema = z.object({
  id: z.string(),
  name: z.string(),
  colors: z.record(z.string()),
  typography: z
    .object({
      fontFamily: z.string().optional(),
      fontSize: z.record(z.string()).optional(),
      fontWeight: z.record(z.number()).optional(),
      lineHeight: z.record(z.string()).optional(),
    })
    .optional(),
  spacing: z.record(z.string()).optional(),
  borderRadius: z.record(z.string()).optional(),
  shadows: z.record(z.string()).optional(),
});

export type Theme = z.infer<typeof ThemeSchema>;

// ============================================================================
// Tenant Configuration
// ============================================================================

export const TenantConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  themeId: z.string().optional(),
  features: z.record(z.boolean()).optional(),
  customCss: z.string().optional(),
});

export type TenantConfig = z.infer<typeof TenantConfigSchema>;
