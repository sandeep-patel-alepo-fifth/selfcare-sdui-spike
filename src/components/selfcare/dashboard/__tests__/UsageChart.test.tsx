import { render, screen, waitFor } from "@/test/test-utils";
import { UsageChart } from "../UsageChart";
import { UsageChartData } from "@/types/dashboard";

// Mock Recharts components since they don't render properly in jsdom
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("UsageChart", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  const mockChartData: UsageChartData = {
    period: "daily",
    dataPoints: [
      { date: "2026-01-15", data: 1.5, voice: 45, sms: 10 },
      { date: "2026-01-16", data: 2.0, voice: 60, sms: 15 },
      { date: "2026-01-17", data: 1.8, voice: 30, sms: 8 },
      { date: "2026-01-18", data: 2.5, voice: 75, sms: 20 },
      { date: "2026-01-19", data: 1.2, voice: 25, sms: 5 },
    ],
  };

  describe("loading state", () => {
    it("shows skeleton loader while fetching data", () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));
      render(<UsageChart />);
      expect(screen.getByTestId("usage-chart-skeleton")).toBeInTheDocument();
    });
  });

  describe("with data", () => {
    it("displays chart title", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChartData),
      });

      render(<UsageChart />);

      await waitFor(() => {
        expect(screen.getByText("Usage Over Time")).toBeInTheDocument();
      });
    });

    it("renders the chart container", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChartData),
      });

      render(<UsageChart />);

      await waitFor(() => {
        expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
      });
    });

    it("renders line chart by default", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChartData),
      });

      render(<UsageChart />);

      await waitFor(() => {
        expect(screen.getByTestId("line-chart")).toBeInTheDocument();
      });
    });

    it("renders bar chart when chartType is bar", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChartData),
      });

      render(<UsageChart chartType="bar" />);

      await waitFor(() => {
        expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
      });
    });

    it("displays period toggle buttons", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChartData),
      });

      render(<UsageChart />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /daily/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /weekly/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /monthly/i })).toBeInTheDocument();
      });
    });
  });

  describe("error state", () => {
    it("displays error message when API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<UsageChart />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load usage data/i)).toBeInTheDocument();
      });
    });

    it("shows retry button on error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<UsageChart />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe("empty state", () => {
    it("shows no data message when dataPoints is empty", async () => {
      const emptyData: UsageChartData = {
        period: "daily",
        dataPoints: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(emptyData),
      });

      render(<UsageChart />);

      await waitFor(() => {
        expect(screen.getByText(/no usage data available/i)).toBeInTheDocument();
      });
    });
  });

  describe("with provided data prop", () => {
    it("renders with data prop without fetching", () => {
      render(<UsageChart data={mockChartData} />);

      expect(screen.getByText("Usage Over Time")).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
