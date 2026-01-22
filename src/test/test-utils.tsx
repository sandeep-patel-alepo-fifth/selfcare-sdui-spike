/**
 * Test Utilities
 *
 * Custom render function that wraps components with the providers
 * required for testing (TenantProvider, AuthProvider, etc.)
 *
 * Usage:
 *   import { render, screen } from "@/test/test-utils";
 *
 *   it("renders component", () => {
 *     render(<MyComponent />);
 *     expect(screen.getByText("Hello")).toBeInTheDocument();
 *   });
 */

import { ReactElement, ReactNode } from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { TenantProvider } from "@/lib/core/tenant-context";
import { AuthProvider } from "@/lib/core/auth-context";
import { DEFAULT_TENANT, TenantConfig } from "@/types/tenant";

// =============================================================================
// Test Providers Wrapper
// =============================================================================

interface TestProvidersProps {
  children: ReactNode;
  tenant?: TenantConfig;
}

/**
 * Wrapper component that provides all necessary context providers for testing.
 */
function TestProviders({ children, tenant = DEFAULT_TENANT }: TestProvidersProps) {
  return (
    <TenantProvider tenant={tenant}>
      <AuthProvider>{children}</AuthProvider>
    </TenantProvider>
  );
}

// =============================================================================
// Custom Render Function
// =============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  /** Custom tenant configuration for testing tenant-specific features */
  tenant?: TenantConfig;
}

/**
 * Custom render function that wraps components with test providers.
 *
 * @param ui - The React element to render
 * @param options - Render options including custom tenant config
 * @returns The render result from React Testing Library
 *
 * @example
 * // Basic usage
 * render(<Button>Click me</Button>);
 *
 * @example
 * // With custom tenant
 * render(<FeatureComponent />, {
 *   tenant: { ...DEFAULT_TENANT, features: { dashboard: false } }
 * });
 */
function customRender(
  ui: ReactElement,
  { tenant, ...renderOptions }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <TestProviders tenant={tenant}>{children}</TestProviders>;
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// =============================================================================
// Exports
// =============================================================================

// Re-export everything from React Testing Library
export * from "@testing-library/react";

// Override the render function with our custom one
export { customRender as render };

// Export the test providers for advanced use cases
export { TestProviders };

// Re-export user-event for convenience
export { default as userEvent } from "@testing-library/user-event";
