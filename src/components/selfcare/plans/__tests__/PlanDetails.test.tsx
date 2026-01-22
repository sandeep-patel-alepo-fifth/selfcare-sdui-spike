import { render, screen, userEvent } from "@/test/test-utils";
import { PlanDetails } from "../PlanDetails";
import { Plan } from "@/types/plans";

describe("PlanDetails", () => {
  const mockPlan: Plan = {
    id: "plan-001",
    name: "Premium Plan",
    description: "Unlimited everything for power users",
    price: 59.99,
    currency: "USD",
    billingCycle: "monthly",
    type: "postpaid",
    category: "premium",
    data: "Unlimited",
    voice: "Unlimited",
    sms: "Unlimited",
    popular: true,
    features: [
      { name: "5G Access", included: true, limit: null },
      { name: "Hotspot", included: true, limit: "20GB" },
      { name: "International Calls", included: true, limit: "60 mins" },
      { name: "Premium Support", included: true, limit: null },
      { name: "Streaming Quality", included: true, limit: "4K HD" },
      { name: "Rollover Data", included: false, limit: null },
    ],
  };

  describe("header", () => {
    it("displays the plan name", () => {
      render(<PlanDetails plan={mockPlan} />);
      expect(screen.getByText("Premium Plan")).toBeInTheDocument();
    });

    it("displays the plan description", () => {
      render(<PlanDetails plan={mockPlan} />);
      expect(screen.getByText("Unlimited everything for power users")).toBeInTheDocument();
    });

    it("displays the formatted price", () => {
      render(<PlanDetails plan={mockPlan} />);
      expect(screen.getByText("$59.99")).toBeInTheDocument();
    });

    it("displays the billing cycle", () => {
      render(<PlanDetails plan={mockPlan} />);
      expect(screen.getByText(/month/i)).toBeInTheDocument();
    });

    it("displays the plan type", () => {
      render(<PlanDetails plan={mockPlan} />);
      expect(screen.getByText("Postpaid")).toBeInTheDocument();
    });

    it("displays the plan category", () => {
      render(<PlanDetails plan={mockPlan} />);
      // Multiple elements contain "premium", so check for the chip specifically
      const premiumTexts = screen.getAllByText(/premium/i);
      // Should include category chip
      expect(premiumTexts.some(el => el.textContent === "Premium")).toBe(true);
    });
  });

  describe("allowances section", () => {
    it("displays data allowance with label", () => {
      render(<PlanDetails plan={mockPlan} />);
      expect(screen.getByText("Data")).toBeInTheDocument();
      // Multiple "Unlimited" texts exist, so check data section specifically
      const dataSection = screen.getByTestId("data-allowance");
      expect(dataSection).toHaveTextContent("Unlimited");
    });

    it("displays voice allowance with label", () => {
      render(<PlanDetails plan={mockPlan} />);
      expect(screen.getByText("Voice")).toBeInTheDocument();
      const voiceSection = screen.getByTestId("voice-allowance");
      expect(voiceSection).toHaveTextContent("Unlimited");
    });

    it("displays SMS allowance with label", () => {
      render(<PlanDetails plan={mockPlan} />);
      expect(screen.getByText("SMS")).toBeInTheDocument();
      const smsSection = screen.getByTestId("sms-allowance");
      expect(smsSection).toHaveTextContent("Unlimited");
    });
  });

  describe("features list", () => {
    it("displays all plan features", () => {
      render(<PlanDetails plan={mockPlan} />);
      expect(screen.getByText("5G Access")).toBeInTheDocument();
      expect(screen.getByText("Hotspot")).toBeInTheDocument();
      expect(screen.getByText("International Calls")).toBeInTheDocument();
      expect(screen.getByText("Premium Support")).toBeInTheDocument();
      expect(screen.getByText("Streaming Quality")).toBeInTheDocument();
      expect(screen.getByText("Rollover Data")).toBeInTheDocument();
    });

    it("shows check marks for included features", () => {
      render(<PlanDetails plan={mockPlan} />);
      const checkmarks = screen.getAllByTestId("check-icon");
      expect(checkmarks.length).toBe(5); // 5 included features
    });

    it("shows X marks for excluded features", () => {
      render(<PlanDetails plan={mockPlan} />);
      const xmarks = screen.getAllByTestId("close-icon");
      expect(xmarks.length).toBe(1); // 1 excluded feature
    });

    it("displays feature limits when available", () => {
      render(<PlanDetails plan={mockPlan} />);
      expect(screen.getByText("20GB")).toBeInTheDocument(); // Hotspot limit
      expect(screen.getByText("60 mins")).toBeInTheDocument(); // International calls limit
      expect(screen.getByText("4K HD")).toBeInTheDocument(); // Streaming quality limit
    });
  });

  describe("actions", () => {
    it("displays select button when onSelect is provided", () => {
      const handleSelect = vi.fn();
      render(<PlanDetails plan={mockPlan} onSelect={handleSelect} />);
      expect(screen.getByRole("button", { name: /select this plan/i })).toBeInTheDocument();
    });

    it("calls onSelect when select button is clicked", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      render(<PlanDetails plan={mockPlan} onSelect={handleSelect} />);

      await user.click(screen.getByRole("button", { name: /select this plan/i }));
      expect(handleSelect).toHaveBeenCalledWith(mockPlan);
    });

    it("displays back button when onBack is provided", () => {
      const handleBack = vi.fn();
      render(<PlanDetails plan={mockPlan} onBack={handleBack} />);
      expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    });

    it("calls onBack when back button is clicked", async () => {
      const user = userEvent.setup();
      const handleBack = vi.fn();
      render(<PlanDetails plan={mockPlan} onBack={handleBack} />);

      await user.click(screen.getByRole("button", { name: /back/i }));
      expect(handleBack).toHaveBeenCalled();
    });

    it("shows 'Current Plan' badge when isCurrentPlan is true", () => {
      render(<PlanDetails plan={mockPlan} isCurrentPlan />);
      expect(screen.getByText("Current Plan")).toBeInTheDocument();
    });

    it("hides select button when isCurrentPlan is true", () => {
      const handleSelect = vi.fn();
      render(<PlanDetails plan={mockPlan} isCurrentPlan onSelect={handleSelect} />);
      expect(screen.queryByRole("button", { name: /select this plan/i })).not.toBeInTheDocument();
    });
  });

  describe("popular badge", () => {
    it("shows popular badge when plan is popular", () => {
      render(<PlanDetails plan={mockPlan} />);
      expect(screen.getByText("Popular")).toBeInTheDocument();
    });

    it("does not show popular badge when plan is not popular", () => {
      const nonPopularPlan = { ...mockPlan, popular: false };
      render(<PlanDetails plan={nonPopularPlan} />);
      expect(screen.queryByText("Popular")).not.toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("shows loading spinner when loading is true", () => {
      render(<PlanDetails plan={mockPlan} loading />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });
});
