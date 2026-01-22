import { render, screen, waitFor } from "@/test/test-utils";
import { ActivityFeed } from "../ActivityFeed";
import { ActivityFeedData } from "@/types/dashboard";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("ActivityFeed", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  const mockActivityData: ActivityFeedData = {
    activities: [
      {
        id: "1",
        type: "payment",
        title: "Payment received",
        description: "Thank you for your payment",
        amount: "$45.99",
        timestamp: "2026-01-20T10:30:00Z",
      },
      {
        id: "2",
        type: "usage",
        title: "Data usage spike",
        amount: "2.5 GB",
        timestamp: "2026-01-19T14:15:00Z",
      },
      {
        id: "3",
        type: "plan",
        title: "Plan renewed",
        amount: "$49.99/mo",
        timestamp: "2026-01-15T09:00:00Z",
      },
    ],
    hasMore: false,
  };

  describe("loading state", () => {
    it("shows skeleton loader while fetching data", () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));
      render(<ActivityFeed />);
      expect(screen.getByTestId("activity-feed-skeleton")).toBeInTheDocument();
    });
  });

  describe("with data", () => {
    it("displays Recent Activity heading", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityData),
      });

      render(<ActivityFeed />);

      await waitFor(() => {
        expect(screen.getByText("Recent Activity")).toBeInTheDocument();
      });
    });

    it("displays all activity items", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityData),
      });

      render(<ActivityFeed />);

      await waitFor(() => {
        expect(screen.getByText("Payment received")).toBeInTheDocument();
        expect(screen.getByText("Data usage spike")).toBeInTheDocument();
        expect(screen.getByText("Plan renewed")).toBeInTheDocument();
      });
    });

    it("displays activity amounts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityData),
      });

      render(<ActivityFeed />);

      await waitFor(() => {
        expect(screen.getByText("$45.99")).toBeInTheDocument();
        expect(screen.getByText("2.5 GB")).toBeInTheDocument();
        expect(screen.getByText("$49.99/mo")).toBeInTheDocument();
      });
    });

    it("displays formatted timestamps", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityData),
      });

      render(<ActivityFeed />);

      await waitFor(() => {
        expect(screen.getByText(/Jan 20/)).toBeInTheDocument();
        expect(screen.getByText(/Jan 19/)).toBeInTheDocument();
        expect(screen.getByText(/Jan 15/)).toBeInTheDocument();
      });
    });

    it("renders correct icons for different activity types", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityData),
      });

      render(<ActivityFeed />);

      await waitFor(() => {
        // Check for payment icon (MUI icons render with data-testid)
        expect(screen.getByTestId("PaymentIcon")).toBeInTheDocument();
        expect(screen.getByTestId("DataUsageIcon")).toBeInTheDocument();
        expect(screen.getByTestId("ReceiptIcon")).toBeInTheDocument();
      });
    });
  });

  describe("with hasMore", () => {
    it("shows View All button when hasMore is true", async () => {
      const dataWithMore: ActivityFeedData = {
        ...mockActivityData,
        hasMore: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(dataWithMore),
      });

      render(<ActivityFeed />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /view all/i })).toBeInTheDocument();
      });
    });

    it("does not show View All button when hasMore is false", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActivityData),
      });

      render(<ActivityFeed />);

      await waitFor(() => {
        expect(screen.getByText("Recent Activity")).toBeInTheDocument();
      });
      expect(screen.queryByRole("button", { name: /view all/i })).not.toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("displays error message when API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<ActivityFeed />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load activity/i)).toBeInTheDocument();
      });
    });

    it("shows retry button on error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<ActivityFeed />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe("empty state", () => {
    it("shows no activity message when activities list is empty", async () => {
      const emptyData: ActivityFeedData = {
        activities: [],
        hasMore: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(emptyData),
      });

      render(<ActivityFeed />);

      await waitFor(() => {
        expect(screen.getByText(/no recent activity/i)).toBeInTheDocument();
      });
    });
  });

  describe("with provided data prop", () => {
    it("renders with data prop without fetching", () => {
      render(<ActivityFeed data={mockActivityData} />);

      expect(screen.getByText("Recent Activity")).toBeInTheDocument();
      expect(screen.getByText("Payment received")).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
