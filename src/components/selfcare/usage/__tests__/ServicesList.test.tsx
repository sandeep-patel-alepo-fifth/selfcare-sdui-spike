import { render, screen, waitFor, userEvent } from "@/test/test-utils";
import { ServicesList } from "../ServicesList";
import { Service } from "@/types/usage";

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("ServicesList", () => {
  const mockServices: Service[] = [
    {
      id: "svc-001",
      name: "Premium Data Plan",
      type: "plan",
      description: "50GB High Speed Data",
      usage: 15,
      total: 50,
      unit: "GB",
      status: "active",
      renewDate: "2026-02-01",
      price: 29.99,
      currency: "USD",
    },
    {
      id: "svc-002",
      name: "International Roaming",
      type: "addon",
      description: "Unlimited roaming in 50+ countries",
      status: "active",
      renewDate: "2026-02-01",
      price: 9.99,
      currency: "USD",
    },
    {
      id: "svc-003",
      name: "Caller ID",
      type: "feature",
      description: "Display caller information",
      status: "active",
      renewDate: null,
      price: 2.99,
      currency: "USD",
    },
  ];

  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("loading state", () => {
    it("shows skeleton loader while fetching data", () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));
      render(<ServicesList />);
      expect(screen.getByTestId("services-list-skeleton")).toBeInTheDocument();
    });
  });

  describe("services display", () => {
    it("displays all services", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ services: mockServices }),
      });

      render(<ServicesList />);

      await waitFor(() => {
        expect(screen.getByText("Premium Data Plan")).toBeInTheDocument();
        expect(screen.getByText("International Roaming")).toBeInTheDocument();
        expect(screen.getByText("Caller ID")).toBeInTheDocument();
      });
    });

    it("displays services count", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ services: mockServices }),
      });

      render(<ServicesList />);

      await waitFor(() => {
        expect(screen.getByText(/3 services/i)).toBeInTheDocument();
      });
    });
  });

  describe("empty state", () => {
    it("displays message when no services", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ services: [] }),
      });

      render(<ServicesList />);

      await waitFor(() => {
        expect(screen.getByText(/no active services/i)).toBeInTheDocument();
      });
    });
  });

  describe("with provided data (no fetch)", () => {
    it("renders with data prop without fetching", () => {
      render(<ServicesList services={mockServices} />);

      expect(screen.getByText("Premium Data Plan")).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("error state", () => {
    it("displays error message when API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<ServicesList />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load services/i)).toBeInTheDocument();
      });
    });

    it("shows retry button on error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<ServicesList />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe("renew action", () => {
    it("calls onRenew when renew button is clicked", async () => {
      const mockOnRenew = vi.fn();
      const user = userEvent.setup();
      render(<ServicesList services={mockServices} onRenew={mockOnRenew} />);

      // Find the first renew button
      const renewButtons = screen.getAllByRole("button", { name: /renew/i });
      await user.click(renewButtons[0]);

      expect(mockOnRenew).toHaveBeenCalledWith("svc-001");
    });
  });

  describe("filtering", () => {
    it("filters services by type when filter is provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ services: mockServices }),
      });

      render(<ServicesList filterType="addon" />);

      await waitFor(() => {
        expect(screen.getByText("International Roaming")).toBeInTheDocument();
      });

      expect(screen.queryByText("Premium Data Plan")).not.toBeInTheDocument();
      expect(screen.queryByText("Caller ID")).not.toBeInTheDocument();
    });
  });
});
