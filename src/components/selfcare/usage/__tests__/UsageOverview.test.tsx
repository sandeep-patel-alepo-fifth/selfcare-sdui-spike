import { render, screen, waitFor } from "@/test/test-utils";
import { UsageOverview } from "../UsageOverview";
import { UsageSummary } from "@/types/usage";

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("UsageOverview", () => {
  const mockUsageSummary: UsageSummary = {
    billingPeriod: {
      start: "2026-01-01",
      end: "2026-01-31",
    },
    items: [
      {
        type: "data",
        used: 15,
        total: 50,
        unit: "GB",
        percentage: 30,
        cost: 25.0,
        currency: "USD",
      },
      {
        type: "voice",
        used: 120,
        total: 500,
        unit: "minutes",
        percentage: 24,
        cost: 15.0,
        currency: "USD",
      },
      {
        type: "sms",
        used: 50,
        total: 200,
        unit: "messages",
        percentage: 25,
        cost: 5.0,
        currency: "USD",
      },
    ],
    totalCost: 45.0,
    currency: "USD",
  };

  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("loading state", () => {
    it("shows skeleton loader while fetching data", () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));
      render(<UsageOverview />);
      expect(screen.getByTestId("usage-overview-skeleton")).toBeInTheDocument();
    });
  });

  describe("usage summary display", () => {
    it("displays data usage with progress bar", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsageSummary),
      });

      render(<UsageOverview />);

      await waitFor(() => {
        expect(screen.getByText(/data/i)).toBeInTheDocument();
        // Check for usage amount (exact match to avoid matching cost)
        expect(screen.getByText("15")).toBeInTheDocument();
        expect(screen.getByText(/of 50 GB/i)).toBeInTheDocument();
      });
    });

    it("displays voice usage with progress bar", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsageSummary),
      });

      render(<UsageOverview />);

      await waitFor(() => {
        expect(screen.getByText(/voice/i)).toBeInTheDocument();
        expect(screen.getByText(/120/)).toBeInTheDocument();
        expect(screen.getByText(/500 minutes/i)).toBeInTheDocument();
      });
    });

    it("displays SMS usage with progress bar", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsageSummary),
      });

      render(<UsageOverview />);

      await waitFor(() => {
        expect(screen.getByText(/sms/i)).toBeInTheDocument();
        // Check for usage amount (exact match to avoid matching cost)
        expect(screen.getByText("50")).toBeInTheDocument();
        expect(screen.getByText(/of 200 messages/i)).toBeInTheDocument();
      });
    });

    it("displays billing period", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsageSummary),
      });

      render(<UsageOverview />);

      await waitFor(() => {
        expect(screen.getByText(/Jan 1, 2026/)).toBeInTheDocument();
        expect(screen.getByText(/Jan 31, 2026/)).toBeInTheDocument();
      });
    });

    it("displays total cost", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsageSummary),
      });

      render(<UsageOverview />);

      await waitFor(() => {
        expect(screen.getByText(/Total:.*\$45\.00/)).toBeInTheDocument();
      });
    });
  });

  describe("with provided data (no fetch)", () => {
    it("renders with data prop without fetching", () => {
      render(<UsageOverview summary={mockUsageSummary} />);

      expect(screen.getByText(/data/i)).toBeInTheDocument();
      // Check for usage amount (exact match to avoid matching cost)
      expect(screen.getByText("15")).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("error state", () => {
    it("displays error message when API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<UsageOverview />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load usage/i)).toBeInTheDocument();
      });
    });

    it("shows retry button on error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<UsageOverview />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe("progress bars", () => {
    it("renders progress bars for each usage type", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsageSummary),
      });

      render(<UsageOverview />);

      await waitFor(() => {
        const progressBars = screen.getAllByRole("progressbar");
        expect(progressBars.length).toBe(3);
      });
    });
  });

  describe("quick actions", () => {
    it("displays View History link", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsageSummary),
      });

      render(<UsageOverview />);

      await waitFor(() => {
        expect(screen.getByRole("link", { name: /view history/i })).toBeInTheDocument();
      });
    });
  });
});
