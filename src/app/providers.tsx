"use client";

import { ReactNode } from "react";
import { TenantProvider } from "@/lib/core/tenant-context";
import { getTenantById, DEFAULT_TENANT } from "@/types/tenant";

interface ProvidersProps {
  children: ReactNode;
  tenantId?: string;
}

export function Providers({ children, tenantId }: ProvidersProps) {
  // In production, tenantId comes from middleware via headers
  // For development, we use a default or query param
  const tenant = tenantId ? getTenantById(tenantId) : DEFAULT_TENANT;

  return <TenantProvider tenant={tenant}>{children}</TenantProvider>;
}
