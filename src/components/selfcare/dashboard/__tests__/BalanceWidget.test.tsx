import { render, screen, waitFor } from "@/test/test-utils";
import { BalanceWidget } from "../BalanceWidget";
import { BalanceData } from "@/types/dashboard";

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("BalanceWidget", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("loading state", () => {
    it("shows skeleton loader while fetching data", () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      render(<BalanceWidget />);
      expect(screen.getByTestId("balance-widget-skeleton")).toBeInTheDocument();
    });
  });

  describe("postpaid account", () => {
    const postpaidBalance: BalanceData = {
      current: 45.99,
      currency: "USD",
      accountType: "postpaid",
      dueDate: "2026-02-15",
      lastPaymentDate: "2026-01-15",
      lastPaymentAmount: 45.99,
    };

    it("displays current balance amount", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(postpaidBalance),
      });

      render(<BalanceWidget />);

      await waitFor(() => {
        expect(screen.getByText("$45.99")).toBeInTheDocument();
      });
    });

    it("displays due date for postpaid accounts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(postpaidBalance),
      });

      render(<BalanceWidget />);

      await waitFor(() => {
        expect(screen.getByText(/Due Feb 15, 2026/)).toBeInTheDocument();
      });
    });

    it("shows Pay Now button for postpaid accounts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(postpaidBalance),
      });

      render(<BalanceWidget />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument();
      });
    });

    it("displays Account Balance heading", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(postpaidBalance),
      });

      render(<BalanceWidget />);

      await waitFor(() => {
        expect(screen.getByText("Current Balance")).toBeInTheDocument();
      });
    });
  });

  describe("prepaid account", () => {
    const prepaidBalance: BalanceData = {
      current: 25.5,
      currency: "USD",
      accountType: "prepaid",
      dueDate: null,
      lastPaymentDate: "2026-01-10",
      lastPaymentAmount: 25.0,
    };

    it("displays available balance for prepaid accounts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(prepaidBalance),
      });

      render(<BalanceWidget />);

      await waitFor(() => {
        expect(screen.getByText("$25.50")).toBeInTheDocument();
      });
    });

    it("shows Top Up button for prepaid accounts instead of Pay Now", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(prepaidBalance),
      });

      render(<BalanceWidget />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /top up/i })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /pay now/i })).not.toBeInTheDocument();
      });
    });

    it("does not show due date for prepaid accounts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(prepaidBalance),
      });

      render(<BalanceWidget />);

      await waitFor(() => {
        expect(screen.queryByText(/Due/)).not.toBeInTheDocument();
      });
    });
  });

  describe("error state", () => {
    it("displays error message when API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<BalanceWidget />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load balance/i)).toBeInTheDocument();
      });
    });

    it("shows retry button on error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<BalanceWidget />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe("with provided data (no fetch)", () => {
    it("renders with data prop without fetching", () => {
      const data: BalanceData = {
        current: 100.0,
        currency: "USD",
        accountType: "prepaid",
        dueDate: null,
        lastPaymentDate: null,
        lastPaymentAmount: null,
      };

      render(<BalanceWidget data={data} />);

      expect(screen.getByText("$100.00")).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
