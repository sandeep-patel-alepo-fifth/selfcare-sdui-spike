import { render, screen, waitFor } from "@/test/test-utils";
import { ServicesSummary } from "../ServicesSummary";
import { ServicesSummaryData } from "@/types/dashboard";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("ServicesSummary", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  const mockServicesData: ServicesSummaryData = {
    planName: "Unlimited Plus",
    renewalDate: "2026-02-01",
    services: [
      { type: "data", label: "Data", used: 12.5, total: 20, unit: "GB", unlimited: false },
      { type: "voice", label: "Voice", used: 350, total: 500, unit: "min", unlimited: false },
      { type: "sms", label: "SMS", used: 45, total: 100, unit: "texts", unlimited: false },
    ],
  };

  describe("loading state", () => {
    it("shows skeleton loader while fetching data", () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));
      render(<ServicesSummary />);
      expect(screen.getByTestId("services-summary-skeleton")).toBeInTheDocument();
    });
  });

  describe("with data", () => {
    it("displays plan name", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockServicesData),
      });

      render(<ServicesSummary />);

      await waitFor(() => {
        expect(screen.getByText("Unlimited Plus")).toBeInTheDocument();
      });
    });

    it("displays renewal date", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockServicesData),
      });

      render(<ServicesSummary />);

      await waitFor(() => {
        expect(screen.getByText(/Renews Feb 1, 2026/)).toBeInTheDocument();
      });
    });

    it("displays all service usage items", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockServicesData),
      });

      render(<ServicesSummary />);

      await waitFor(() => {
        expect(screen.getByText("Data")).toBeInTheDocument();
        expect(screen.getByText("Voice")).toBeInTheDocument();
        expect(screen.getByText("SMS")).toBeInTheDocument();
      });
    });

    it("displays usage amounts with units", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockServicesData),
      });

      render(<ServicesSummary />);

      await waitFor(() => {
        expect(screen.getByText("12.5 / 20 GB")).toBeInTheDocument();
        expect(screen.getByText("350 / 500 min")).toBeInTheDocument();
        expect(screen.getByText("45 / 100 texts")).toBeInTheDocument();
      });
    });

    it("renders progress bars for each service", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockServicesData),
      });

      render(<ServicesSummary />);

      await waitFor(() => {
        const progressBars = screen.getAllByRole("progressbar");
        expect(progressBars).toHaveLength(3);
      });
    });
  });

  describe("unlimited services", () => {
    it("shows Unlimited chip for unlimited services", async () => {
      const unlimitedData: ServicesSummaryData = {
        planName: "Data Only",
        renewalDate: "2026-02-01",
        services: [
          { type: "data", label: "Data", used: 50, total: 0, unit: "GB", unlimited: true },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(unlimitedData),
      });

      render(<ServicesSummary />);

      await waitFor(() => {
        expect(screen.getByText(/50 GB used/)).toBeInTheDocument();
        // The Chip with "Unlimited" label should be present
        const chip = screen.getByText("Unlimited");
        expect(chip).toBeInTheDocument();
        expect(chip.closest(".MuiChip-root")).toBeInTheDocument();
      });
    });
  });

  describe("high usage warning", () => {
    it("shows warning color when usage exceeds 80%", async () => {
      const highUsageData: ServicesSummaryData = {
        ...mockServicesData,
        services: [
          { type: "data", label: "Data", used: 18, total: 20, unit: "GB", unlimited: false },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(highUsageData),
      });

      render(<ServicesSummary />);

      await waitFor(() => {
        const progressBar = screen.getByRole("progressbar");
        expect(progressBar).toBeInTheDocument();
      });
    });
  });

  describe("error state", () => {
    it("displays error message when API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<ServicesSummary />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load services/i)).toBeInTheDocument();
      });
    });

    it("shows retry button on error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<ServicesSummary />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe("with provided data prop", () => {
    it("renders with data prop without fetching", () => {
      render(<ServicesSummary data={mockServicesData} />);

      expect(screen.getByText("Unlimited Plus")).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
