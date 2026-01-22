import { render, screen, waitFor } from "@/test/test-utils";
import PaymentsPage from "../page";

// Mock fetch for API calls
global.fetch = vi.fn();

describe("PaymentsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock API responses
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes("/api/billing/payments")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              payments: [
                {
                  id: "pay-001",
                  amount: 125.99,
                  currency: "USD",
                  method: "card",
                  status: "completed",
                  date: "2026-01-15",
                  reference: "REF-001",
                },
              ],
              total: 1,
              page: 1,
              limit: 10,
              hasMore: false,
            }),
        });
      }
      if (url.includes("/api/billing/payment-methods")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              methods: [
                {
                  id: "pm-001",
                  type: "card",
                  last4: "4242",
                  label: "Visa ending in 4242",
                  expiryMonth: 12,
                  expiryYear: 2027,
                  isDefault: true,
                },
              ],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  describe("rendering", () => {
    it("displays page header with title", async () => {
      render(<PaymentsPage />);

      // Wait for initial render to complete - page has h4 title
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 4, name: "Make a Payment" })).toBeInTheDocument();
      });
    });

    it("displays breadcrumbs navigation", async () => {
      render(<PaymentsPage />);

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Billing")).toBeInTheDocument();
        expect(screen.getByText("Payments")).toBeInTheDocument();
      });
    });

    it("displays payment form section", async () => {
      render(<PaymentsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      });
    });

    it("displays payment history section", async () => {
      render(<PaymentsPage />);

      await waitFor(() => {
        expect(screen.getByText("Payment History")).toBeInTheDocument();
      });
    });

    it("displays saved payment methods section", async () => {
      render(<PaymentsPage />);

      await waitFor(() => {
        // There may be multiple "Saved Payment Methods" elements - one in form, one as section
        const savedMethodsHeadings = screen.getAllByText("Saved Payment Methods");
        expect(savedMethodsHeadings.length).toBeGreaterThan(0);
      });
    });
  });
});
