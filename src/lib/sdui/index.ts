/**
 * Simplified Enterprise SDUI
 *
 * Uses proven open-source libraries:
 * - JSON Forms for dynamic forms (enterprise-grade)
 * - Zod for validation
 * - Simple component mapping for layouts
 * - Config-driven multi-tenancy
 *
 * Philosophy: "Use libraries, don't build frameworks"
 */

// Re-export JSON Forms for forms
export { JsonForms } from "@jsonforms/react";
export {
  materialRenderers,
  materialCells,
} from "@jsonforms/material-renderers";

// Export our simple additions
export { TenantProvider, useTenant } from "./tenant-context";
export { ScreenLoader } from "./screen-loader";
export { ActionExecutor, useActions } from "./actions";
export type { TenantConfig, ScreenConfig, ActionResult } from "./types";
