import { render, screen } from "@/test/test-utils";
import { AutopayStatus } from "../AutopayStatus";
import { AutopayConfig } from "@/types/billing";

describe("AutopayStatus", () => {
  const mockEnabledAutopay: AutopayConfig = {
    enabled: true,
    paymentMethodId: "pm-001",
    scheduleType: "day_of_month",
    dayOfMonth: 15,
    thresholdAmount: null,
    maxPaymentAmount: 500,
    paymentMethodLabel: "Visa ending in 4242",
    paymentMethodType: "card",
    lastPaymentDate: "2026-01-15",
    lastPaymentAmount: 125.99,
    nextScheduledDate: "2026-02-15",
    createdAt: "2025-06-01T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
  };

  const mockDisabledAutopay: AutopayConfig = {
    enabled: false,
    paymentMethodId: null,
    scheduleType: "due_date",
    dayOfMonth: null,
    thresholdAmount: null,
    maxPaymentAmount: null,
    paymentMethodLabel: null,
    paymentMethodType: null,
    lastPaymentDate: null,
    lastPaymentAmount: null,
    nextScheduledDate: null,
    createdAt: "2025-06-01T00:00:00Z",
    updatedAt: "2025-06-01T00:00:00Z",
  };

  describe("when autopay is enabled", () => {
    it("displays enabled status", () => {
      render(<AutopayStatus config={mockEnabledAutopay} />);

      expect(screen.getByRole("heading", { name: /autopay/i })).toBeInTheDocument();
      expect(screen.getByText("Enabled")).toBeInTheDocument();
    });

    it("shows payment method information", () => {
      render(<AutopayStatus config={mockEnabledAutopay} />);

      expect(screen.getByText(/Visa ending in 4242/i)).toBeInTheDocument();
    });

    it("shows schedule information for day of month", () => {
      render(<AutopayStatus config={mockEnabledAutopay} />);

      expect(screen.getByText(/15th/i)).toBeInTheDocument();
    });

    it("shows next scheduled payment date", () => {
      render(<AutopayStatus config={mockEnabledAutopay} />);

      expect(screen.getByText(/Feb 15, 2026/i)).toBeInTheDocument();
    });

    it("shows last payment information", () => {
      render(<AutopayStatus config={mockEnabledAutopay} />);

      expect(screen.getByText(/\$125\.99/)).toBeInTheDocument();
    });

    it("shows max payment amount when set", () => {
      render(<AutopayStatus config={mockEnabledAutopay} />);

      expect(screen.getByText(/\$500/)).toBeInTheDocument();
    });
  });

  describe("when autopay is disabled", () => {
    it("displays disabled status", () => {
      render(<AutopayStatus config={mockDisabledAutopay} />);

      expect(screen.getByRole("heading", { name: /autopay/i })).toBeInTheDocument();
      expect(screen.getByText("Disabled")).toBeInTheDocument();
    });

    it("shows call to action to enable when onEnable provided", () => {
      render(<AutopayStatus config={mockDisabledAutopay} onEnable={() => {}} />);

      expect(screen.getByRole("button", { name: /enable autopay/i })).toBeInTheDocument();
    });
  });

  describe("threshold schedule", () => {
    const thresholdConfig: AutopayConfig = {
      ...mockEnabledAutopay,
      scheduleType: "threshold",
      dayOfMonth: null,
      thresholdAmount: 100,
      nextScheduledDate: null,
    };

    it("shows threshold amount", () => {
      render(<AutopayStatus config={thresholdConfig} />);

      expect(screen.getByText(/\$100/)).toBeInTheDocument();
      expect(screen.getByText(/balance exceeds/i)).toBeInTheDocument();
    });
  });

  describe("due date schedule", () => {
    const dueDateConfig: AutopayConfig = {
      ...mockEnabledAutopay,
      scheduleType: "due_date",
      dayOfMonth: null,
    };

    it("shows due date schedule info", () => {
      render(<AutopayStatus config={dueDateConfig} />);

      expect(screen.getByText(/due date/i)).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("shows loading indicator when loading", () => {
      render(<AutopayStatus config={null} loading />);

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls onManage when manage button is clicked", async () => {
      const { userEvent } = await import("@/test/test-utils");
      const user = userEvent.setup();
      const handleManage = vi.fn();

      render(
        <AutopayStatus config={mockEnabledAutopay} onManage={handleManage} />
      );

      await user.click(screen.getByRole("button", { name: /manage/i }));

      expect(handleManage).toHaveBeenCalled();
    });

    it("calls onEnable when enable button is clicked", async () => {
      const { userEvent } = await import("@/test/test-utils");
      const user = userEvent.setup();
      const handleEnable = vi.fn();

      render(
        <AutopayStatus config={mockDisabledAutopay} onEnable={handleEnable} />
      );

      await user.click(screen.getByRole("button", { name: /enable autopay/i }));

      expect(handleEnable).toHaveBeenCalled();
    });
  });
});
