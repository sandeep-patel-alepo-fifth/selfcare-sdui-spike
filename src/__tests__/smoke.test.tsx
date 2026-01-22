/**
 * Smoke test to verify the testing infrastructure is working correctly.
 * This test validates:
 * - Vitest is configured and running
 * - React Testing Library can render components
 * - jsdom environment is working
 * - Path aliases (@/) are resolved
 * - Test providers (MUI theme, Tenant context) are working
 */
import { render, screen } from "@/test/test-utils";
import { Button } from "@/components/ui/button";

describe("Testing Infrastructure", () => {
  describe("Vitest setup", () => {
    it("should run basic assertions", () => {
      expect(true).toBe(true);
      expect(1 + 1).toBe(2);
    });
  });

  describe("React Testing Library setup", () => {
    it("should render a simple component", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
    });

    it("should render component with different variants", () => {
      render(<Button variant="secondary">Secondary Button</Button>);
      expect(screen.getByRole("button", { name: /secondary button/i })).toBeInTheDocument();
    });
  });
});
