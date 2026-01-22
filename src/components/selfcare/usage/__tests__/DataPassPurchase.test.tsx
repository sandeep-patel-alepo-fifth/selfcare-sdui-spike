import { render, screen, waitFor, userEvent } from "@/test/test-utils";
import { DataPassPurchase } from "../DataPassPurchase";
import { DataPass } from "@/types/usage";

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("DataPassPurchase", () => {
  const mockDataPasses: DataPass[] = [
    {
      id: "dp-001",
      name: "Weekend Data Boost",
      description: "Extra 10GB for the weekend",
      dataAmount: 10,
      price: 4.99,
      currency: "USD",
      validity: 2,
      status: "available",
      expiryDate: null,
      purchaseDate: null,
    },
    {
      id: "dp-002",
      name: "Weekly Data Pack",
      description: "20GB valid for 7 days",
      dataAmount: 20,
      price: 9.99,
      currency: "USD",
      validity: 7,
      status: "available",
      expiryDate: null,
      purchaseDate: null,
    },
  ];

  const mockActiveDataPasses: DataPass[] = [
    {
      id: "dp-003",
      name: "Monthly Pack",
      description: "50GB valid for 30 days",
      dataAmount: 50,
      dataUsed: 10,
      price: 19.99,
      currency: "USD",
      validity: 30,
      status: "active",
      expiryDate: "2026-02-15",
      purchaseDate: "2026-01-15",
    },
  ];

  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("loading state", () => {
    it("shows skeleton loader while fetching data", () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));
      render(<DataPassPurchase />);
      expect(screen.getByTestId("data-pass-purchase-skeleton")).toBeInTheDocument();
    });
  });

  describe("available passes display", () => {
    it("displays available data passes section", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ available: mockDataPasses, active: [] }),
      });

      render(<DataPassPurchase />);

      await waitFor(() => {
        expect(screen.getByText(/available data passes/i)).toBeInTheDocument();
      });
    });

    it("displays all available data passes", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ available: mockDataPasses, active: [] }),
      });

      render(<DataPassPurchase />);

      await waitFor(() => {
        expect(screen.getByText("Weekend Data Boost")).toBeInTheDocument();
        expect(screen.getByText("Weekly Data Pack")).toBeInTheDocument();
      });
    });
  });

  describe("active passes display", () => {
    it("displays active data passes section when passes exist", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ available: mockDataPasses, active: mockActiveDataPasses }),
      });

      render(<DataPassPurchase />);

      await waitFor(() => {
        expect(screen.getByText(/your active data passes/i)).toBeInTheDocument();
      });
    });

    it("displays active data passes", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ available: mockDataPasses, active: mockActiveDataPasses }),
      });

      render(<DataPassPurchase />);

      await waitFor(() => {
        expect(screen.getByText("Monthly Pack")).toBeInTheDocument();
      });
    });

    it("does not display active section when no active passes", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ available: mockDataPasses, active: [] }),
      });

      render(<DataPassPurchase />);

      await waitFor(() => {
        expect(screen.getByText("Weekend Data Boost")).toBeInTheDocument();
      });

      expect(screen.queryByText(/your active data passes/i)).not.toBeInTheDocument();
    });
  });

  describe("purchase flow", () => {
    it("shows confirmation dialog when buy button is clicked", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ available: mockDataPasses, active: [] }),
      });

      render(<DataPassPurchase />);

      await waitFor(() => {
        expect(screen.getByText("Weekend Data Boost")).toBeInTheDocument();
      });

      const buyButtons = screen.getAllByRole("button", { name: /buy now/i });
      await user.click(buyButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/confirm purchase/i)).toBeInTheDocument();
      });
    });

    it("displays pass details in confirmation dialog", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ available: mockDataPasses, active: [] }),
      });

      render(<DataPassPurchase />);

      await waitFor(() => {
        expect(screen.getByText("Weekend Data Boost")).toBeInTheDocument();
      });

      const buyButtons = screen.getAllByRole("button", { name: /buy now/i });
      await user.click(buyButtons[0]);

      await waitFor(() => {
        // Check for the confirmation dialog content specifically
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to purchase/)).toBeInTheDocument();
      });
    });

    it("closes confirmation dialog when cancel is clicked", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ available: mockDataPasses, active: [] }),
      });

      render(<DataPassPurchase />);

      await waitFor(() => {
        expect(screen.getByText("Weekend Data Boost")).toBeInTheDocument();
      });

      const buyButtons = screen.getAllByRole("button", { name: /buy now/i });
      await user.click(buyButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/confirm purchase/i)).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByText(/confirm purchase/i)).not.toBeInTheDocument();
      });
    });

    it("submits purchase and shows success message", async () => {
      const user = userEvent.setup();
      // Need 3 mocks: initial load, purchase API call, refresh load
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ available: mockDataPasses, active: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ available: mockDataPasses, active: [] }),
        });

      render(<DataPassPurchase />);

      await waitFor(() => {
        expect(screen.getByText("Weekend Data Boost")).toBeInTheDocument();
      });

      const buyButtons = screen.getAllByRole("button", { name: /buy now/i });
      await user.click(buyButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/confirm purchase/i)).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /confirm/i }));

      await waitFor(() => {
        expect(screen.getByText(/purchase successful/i)).toBeInTheDocument();
      });
    });
  });

  describe("error state", () => {
    it("displays error message when API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<DataPassPurchase />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load data passes/i)).toBeInTheDocument();
      });
    });

    it("shows retry button on error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<DataPassPurchase />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe("with provided data (no fetch)", () => {
    it("renders with data prop without fetching", () => {
      render(<DataPassPurchase available={mockDataPasses} active={[]} />);

      expect(screen.getByText("Weekend Data Boost")).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
