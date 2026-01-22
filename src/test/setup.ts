/**
 * Vitest Global Test Setup
 *
 * This file runs before all tests to configure:
 * - @testing-library/jest-dom matchers (toBeInTheDocument, etc.)
 * - DOM cleanup between tests
 * - Mock browser APIs not available in jsdom
 * - Mock Next.js App Router navigation
 */

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// =============================================================================
// Mock Next.js Navigation (App Router)
// =============================================================================

// Mock next/navigation module for App Router components
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Cleanup after each test case (unmount components, clear DOM)
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia (required for MUI responsive components)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver (used by MUI and other UI libraries)
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});

// Mock IntersectionObserver (used for lazy loading)
class IntersectionObserverMock {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: IntersectionObserverMock,
});

// Mock scrollTo (not implemented in jsdom)
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: vi.fn(),
});

// Mock getComputedStyle for animations (partial implementation for MUI)
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (element: Element) => {
  const style = originalGetComputedStyle(element);
  // Return empty string for animation properties to prevent animation errors
  return {
    ...style,
    getPropertyValue: (prop: string) => {
      if (prop.includes("animation") || prop.includes("transition")) {
        return "";
      }
      return style.getPropertyValue(prop);
    },
  } as CSSStyleDeclaration;
};
