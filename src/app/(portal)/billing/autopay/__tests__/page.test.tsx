import { render, screen, waitFor } from "@/test/test-utils";
import AutopayPage from "../page";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("AutopayPage", () => {
  const mockAutopayConfig = {
    enabled: true,
    paymentMethodId: "pm-001",
    scheduleType: "day_of_month",
    dayOfMonth: 15,
    thresholdAmount: null,
    maxPaymentAmount: 500,
    paymentMethodLabel: "Visa ending in 4242",
    paymentMethodType: "card",
    lastPaymentDate: "2026-01-15",
    lastPaymentAmount: 125.99,
    nextScheduledDate: "2026-02-15",
    createdAt: "2025-06-01T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
  };

  const mockPaymentMethods = {
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
      {
        id: "pm-002",
        type: "card",
        last4: "5555",
        label: "Mastercard ending in 5555",
        expiryMonth: 6,
        expiryYear: 2026,
        isDefault: false,
      },
    ],
  };

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("renders page title", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/api/billing/autopay")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ success: true, autopay: mockAutopayConfig }),
        });
      }
      if (url.includes("/api/billing/payment-methods")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPaymentMethods),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(<AutopayPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /autopay/i, level: 4 })
      ).toBeInTheDocument();
    });
  });

  it("shows autopay status when enabled", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/api/billing/autopay")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ success: true, autopay: mockAutopayConfig }),
        });
      }
      if (url.includes("/api/billing/payment-methods")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPaymentMethods),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(<AutopayPage />);

    await waitFor(() => {
      expect(screen.getByText("Enabled")).toBeInTheDocument();
    });
  });

  it("shows enrollment form when autopay is disabled", async () => {
    const disabledConfig = {
      ...mockAutopayConfig,
      enabled: false,
      paymentMethodId: null,
    };

    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/api/billing/autopay")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ success: true, autopay: disabledConfig }),
        });
      }
      if (url.includes("/api/billing/payment-methods")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPaymentMethods),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(<AutopayPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /enroll in autopay/i })
      ).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<AutopayPage />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows error state when fetch fails", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    render(<AutopayPage />);

    await waitFor(() => {
      // Multiple alerts may appear due to multiple failed fetch calls
      const alerts = screen.getAllByText(/network error/i);
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  it("displays breadcrumbs navigation", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/api/billing/autopay")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ success: true, autopay: mockAutopayConfig }),
        });
      }
      if (url.includes("/api/billing/payment-methods")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPaymentMethods),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(<AutopayPage />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /billing/i })).toBeInTheDocument();
    });
  });
});
