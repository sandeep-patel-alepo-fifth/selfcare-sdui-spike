// Re-export everything from core tenant context for backwards compatibility
export {
  TenantProvider,
  useTenant,
  useFeature,
  getTenantById,
  DEFAULT_TENANT,
} from "@/lib/core/tenant-context";

export type { TenantConfig, FeatureKey } from "@/lib/core/tenant-context";

// Legacy alias
import { getTenantById as _getTenantById } from "@/lib/core/tenant-context";
export const getTenant = _getTenantById;
