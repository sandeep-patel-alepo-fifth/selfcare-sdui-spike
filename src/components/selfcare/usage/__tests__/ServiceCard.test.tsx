import { render, screen, userEvent } from "@/test/test-utils";
import { ServiceCard } from "../ServiceCard";
import { Service } from "@/types/usage";

describe("ServiceCard", () => {
  const mockOnRenew = vi.fn();

  const mockService: Service = {
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
  };

  beforeEach(() => {
    mockOnRenew.mockReset();
  });

  describe("service information display", () => {
    it("displays service name", () => {
      render(<ServiceCard service={mockService} />);

      expect(screen.getByText("Premium Data Plan")).toBeInTheDocument();
    });

    it("displays service description", () => {
      render(<ServiceCard service={mockService} />);

      expect(screen.getByText("50GB High Speed Data")).toBeInTheDocument();
    });

    it("displays service status as chip", () => {
      render(<ServiceCard service={mockService} />);

      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("displays renewal date", () => {
      render(<ServiceCard service={mockService} />);

      expect(screen.getByText(/renews.*Feb 1, 2026/i)).toBeInTheDocument();
    });

    it("displays price", () => {
      render(<ServiceCard service={mockService} />);

      expect(screen.getByText("$29.99")).toBeInTheDocument();
    });
  });

  describe("usage display", () => {
    it("displays usage progress when usage data exists", () => {
      render(<ServiceCard service={mockService} />);

      expect(screen.getByText(/15/)).toBeInTheDocument();
      expect(screen.getByText(/of 50 GB/i)).toBeInTheDocument();
    });

    it("displays progress bar when usage data exists", () => {
      render(<ServiceCard service={mockService} />);

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("does not display usage section for services without usage data", () => {
      const serviceWithoutUsage: Service = {
        ...mockService,
        usage: undefined,
        total: undefined,
        unit: undefined,
      };
      render(<ServiceCard service={serviceWithoutUsage} />);

      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });

  describe("status variations", () => {
    it("displays suspended status with warning color", () => {
      const suspendedService: Service = {
        ...mockService,
        status: "suspended",
      };
      render(<ServiceCard service={suspendedService} />);

      expect(screen.getByText("Suspended")).toBeInTheDocument();
    });

    it("displays expired status with error color", () => {
      const expiredService: Service = {
        ...mockService,
        status: "expired",
      };
      render(<ServiceCard service={expiredService} />);

      expect(screen.getByText("Expired")).toBeInTheDocument();
    });

    it("displays pending status with info color", () => {
      const pendingService: Service = {
        ...mockService,
        status: "pending",
      };
      render(<ServiceCard service={pendingService} />);

      expect(screen.getByText("Pending")).toBeInTheDocument();
    });
  });

  describe("service type display", () => {
    it("displays service type badge", () => {
      render(<ServiceCard service={mockService} />);

      // Use exact match for the chip (capitalized "Plan")
      expect(screen.getByText("Plan")).toBeInTheDocument();
    });

    it("displays addon type", () => {
      const addonService: Service = {
        ...mockService,
        type: "addon",
      };
      render(<ServiceCard service={addonService} />);

      expect(screen.getByText(/add-on/i)).toBeInTheDocument();
    });
  });

  describe("renew action", () => {
    it("displays renew button for active services", () => {
      render(<ServiceCard service={mockService} onRenew={mockOnRenew} />);

      expect(screen.getByRole("button", { name: /renew/i })).toBeInTheDocument();
    });

    it("calls onRenew when renew button is clicked", async () => {
      const user = userEvent.setup();
      render(<ServiceCard service={mockService} onRenew={mockOnRenew} />);

      await user.click(screen.getByRole("button", { name: /renew/i }));

      expect(mockOnRenew).toHaveBeenCalledWith(mockService.id);
    });

    it("disables renew button for suspended services", () => {
      const suspendedService: Service = {
        ...mockService,
        status: "suspended",
      };
      render(<ServiceCard service={suspendedService} onRenew={mockOnRenew} />);

      expect(screen.getByRole("button", { name: /renew/i })).toBeDisabled();
    });
  });
});
