import { render, screen, waitFor, userEvent } from "@/test/test-utils";
import { BillingOverview } from "../BillingOverview";
import { BillingAccount, InvoiceSummary } from "@/types/billing";

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("BillingOverview", () => {
  const mockBillingAccount: BillingAccount = {
    balance: 125.99,
    currency: "USD",
    dueDate: "2026-01-15",
    accountType: "postpaid",
    autopay: {
      enabled: true,
      paymentMethodId: "pm-123",
      lastFourDigits: "4242",
      paymentType: "card",
    },
    lastPaymentDate: "2025-12-15",
    lastPaymentAmount: 89.5,
  };

  const mockRecentInvoices: InvoiceSummary[] = [
    {
      id: "inv-001",
      invoiceNumber: "INV-2026-001",
      date: "2026-01-01",
      dueDate: "2026-01-15",
      amount: 125.99,
      currency: "USD",
      status: "pending",
    },
    {
      id: "inv-002",
      invoiceNumber: "INV-2025-012",
      date: "2025-12-01",
      dueDate: "2025-12-15",
      amount: 89.5,
      currency: "USD",
      status: "paid",
    },
  ];

  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("loading state", () => {
    it("shows skeleton loader while fetching data", () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));
      render(<BillingOverview />);
      expect(screen.getByTestId("billing-overview-skeleton")).toBeInTheDocument();
    });
  });

  describe("balance display", () => {
    it("displays current balance amount", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ account: mockBillingAccount, recentInvoices: mockRecentInvoices }),
      });

      render(<BillingOverview />);

      await waitFor(() => {
        // Balance appears in balance card and invoice list, use getAllByText
        expect(screen.getAllByText("$125.99").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("displays due date for postpaid accounts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ account: mockBillingAccount, recentInvoices: mockRecentInvoices }),
      });

      render(<BillingOverview />);

      await waitFor(() => {
        expect(screen.getByText(/Due Jan 15, 2026/)).toBeInTheDocument();
      });
    });

    it("displays Current Balance heading", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ account: mockBillingAccount, recentInvoices: mockRecentInvoices }),
      });

      render(<BillingOverview />);

      await waitFor(() => {
        expect(screen.getByText("Current Balance")).toBeInTheDocument();
      });
    });
  });

  describe("autopay display", () => {
    it("displays autopay status when enabled", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ account: mockBillingAccount, recentInvoices: mockRecentInvoices }),
      });

      render(<BillingOverview />);

      await waitFor(() => {
        // Autopay text appears multiple times (heading and link)
        expect(screen.getAllByText(/autopay/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/4242/)).toBeInTheDocument();
      });
    });

    it("shows autopay disabled message when not enabled", async () => {
      const accountWithoutAutopay = {
        ...mockBillingAccount,
        autopay: {
          enabled: false,
          paymentMethodId: null,
          lastFourDigits: null,
          paymentType: null,
        },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ account: accountWithoutAutopay, recentInvoices: mockRecentInvoices }),
      });

      render(<BillingOverview />);

      await waitFor(() => {
        expect(screen.getByText(/not enabled/i)).toBeInTheDocument();
      });
    });
  });

  describe("recent invoices", () => {
    it("displays recent invoices section", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ account: mockBillingAccount, recentInvoices: mockRecentInvoices }),
      });

      render(<BillingOverview />);

      await waitFor(() => {
        expect(screen.getByText(/recent invoices/i)).toBeInTheDocument();
      });
    });

    it("displays recent invoice numbers", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ account: mockBillingAccount, recentInvoices: mockRecentInvoices }),
      });

      render(<BillingOverview />);

      await waitFor(() => {
        expect(screen.getByText("INV-2026-001")).toBeInTheDocument();
        expect(screen.getByText("INV-2025-012")).toBeInTheDocument();
      });
    });
  });

  describe("quick actions", () => {
    it("displays View All Bills link", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ account: mockBillingAccount, recentInvoices: mockRecentInvoices }),
      });

      render(<BillingOverview />);

      await waitFor(() => {
        expect(screen.getByRole("link", { name: /view all bills/i })).toBeInTheDocument();
      });
    });

    it("displays Pay Now button for postpaid with balance", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ account: mockBillingAccount, recentInvoices: mockRecentInvoices }),
      });

      render(<BillingOverview />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument();
      });
    });

    it("displays Manage Autopay link", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ account: mockBillingAccount, recentInvoices: mockRecentInvoices }),
      });

      render(<BillingOverview />);

      await waitFor(() => {
        expect(screen.getByRole("link", { name: /manage autopay/i })).toBeInTheDocument();
      });
    });
  });

  describe("prepaid accounts", () => {
    it("shows Top Up button for prepaid accounts", async () => {
      const prepaidAccount = {
        ...mockBillingAccount,
        accountType: "prepaid" as const,
        dueDate: null,
        balance: 25.5,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ account: prepaidAccount, recentInvoices: [] }),
      });

      render(<BillingOverview />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /top up/i })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /pay now/i })).not.toBeInTheDocument();
      });
    });

    it("does not show due date for prepaid accounts", async () => {
      const prepaidAccount = {
        ...mockBillingAccount,
        accountType: "prepaid" as const,
        dueDate: null,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ account: prepaidAccount, recentInvoices: [] }),
      });

      render(<BillingOverview />);

      await waitFor(() => {
        expect(screen.getByText("$125.99")).toBeInTheDocument();
      });

      expect(screen.queryByText(/due/i)).not.toBeInTheDocument();
    });
  });

  describe("with provided data (no fetch)", () => {
    it("renders with data prop without fetching", () => {
      render(
        <BillingOverview
          account={mockBillingAccount}
          recentInvoices={mockRecentInvoices}
        />
      );

      // Balance appears in multiple places
      expect(screen.getAllByText("$125.99").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("INV-2026-001")).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("error state", () => {
    it("displays error message when API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<BillingOverview />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load billing/i)).toBeInTheDocument();
      });
    });

    it("shows retry button on error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<BillingOverview />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      });
    });
  });
});
