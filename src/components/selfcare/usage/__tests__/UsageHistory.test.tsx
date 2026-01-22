import { render, screen, waitFor, userEvent } from "@/test/test-utils";
import { UsageHistory } from "../UsageHistory";
import { UsageHistoryResponse } from "@/types/usage";

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("UsageHistory", () => {
  const mockHistoryResponse: UsageHistoryResponse = {
    records: [
      {
        id: "rec-001",
        date: "2026-01-15T10:30:00Z",
        type: "data",
        amount: 2.5,
        unit: "GB",
        cost: 5.0,
        currency: "USD",
        description: "Mobile Data Usage",
      },
      {
        id: "rec-002",
        date: "2026-01-14T14:20:00Z",
        type: "voice",
        amount: 45,
        unit: "minutes",
        cost: 2.25,
        currency: "USD",
        description: "Voice Call",
      },
      {
        id: "rec-003",
        date: "2026-01-13T09:15:00Z",
        type: "sms",
        amount: 10,
        unit: "messages",
        cost: 0.5,
        currency: "USD",
        description: "SMS Messages",
      },
    ],
    total: 3,
    page: 1,
    limit: 10,
    hasMore: false,
  };

  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("loading state", () => {
    it("shows skeleton loader while fetching data", () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));
      render(<UsageHistory />);
      expect(screen.getByTestId("usage-history-skeleton")).toBeInTheDocument();
    });
  });

  describe("table display", () => {
    it("displays table headers", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistoryResponse),
      });

      render(<UsageHistory />);

      await waitFor(() => {
        expect(screen.getByText("Date")).toBeInTheDocument();
        expect(screen.getByText("Type")).toBeInTheDocument();
        expect(screen.getByText("Amount")).toBeInTheDocument();
        expect(screen.getByText("Cost")).toBeInTheDocument();
      });
    });

    it("displays usage records in table rows", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistoryResponse),
      });

      render(<UsageHistory />);

      await waitFor(() => {
        expect(screen.getByText("Mobile Data Usage")).toBeInTheDocument();
        expect(screen.getByText("Voice Call")).toBeInTheDocument();
        expect(screen.getByText("SMS Messages")).toBeInTheDocument();
      });
    });

    it("displays formatted dates", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistoryResponse),
      });

      render(<UsageHistory />);

      await waitFor(() => {
        expect(screen.getByText(/Jan 15, 2026/)).toBeInTheDocument();
      });
    });

    it("displays usage amounts with units", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistoryResponse),
      });

      render(<UsageHistory />);

      await waitFor(() => {
        expect(screen.getByText("2.5 GB")).toBeInTheDocument();
        expect(screen.getByText("45 minutes")).toBeInTheDocument();
        expect(screen.getByText("10 messages")).toBeInTheDocument();
      });
    });

    it("displays costs formatted as currency", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistoryResponse),
      });

      render(<UsageHistory />);

      await waitFor(() => {
        expect(screen.getByText("$5.00")).toBeInTheDocument();
        expect(screen.getByText("$2.25")).toBeInTheDocument();
        expect(screen.getByText("$0.50")).toBeInTheDocument();
      });
    });

    it("displays usage type chips", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistoryResponse),
      });

      render(<UsageHistory />);

      await waitFor(() => {
        expect(screen.getByText("Data")).toBeInTheDocument();
        expect(screen.getByText("Voice")).toBeInTheDocument();
        expect(screen.getByText("SMS")).toBeInTheDocument();
      });
    });
  });

  describe("empty state", () => {
    it("displays message when no records", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockHistoryResponse, records: [], total: 0 }),
      });

      render(<UsageHistory />);

      await waitFor(() => {
        expect(screen.getByText(/no usage records/i)).toBeInTheDocument();
      });
    });
  });

  describe("with provided data (no fetch)", () => {
    it("renders with data prop without fetching", () => {
      render(<UsageHistory records={mockHistoryResponse.records} />);

      expect(screen.getByText("Mobile Data Usage")).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("error state", () => {
    it("displays error message when API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<UsageHistory />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load usage history/i)).toBeInTheDocument();
      });
    });

    it("shows retry button on error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<UsageHistory />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe("pagination", () => {
    it("displays pagination when hasMore is true", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockHistoryResponse, hasMore: true, total: 25 }),
      });

      render(<UsageHistory />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
      });
    });
  });
});
