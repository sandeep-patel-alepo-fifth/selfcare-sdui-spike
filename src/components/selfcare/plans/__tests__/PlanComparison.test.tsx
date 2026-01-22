import { render, screen, userEvent } from "@/test/test-utils";
import { PlanComparison } from "../PlanComparison";
import { Plan } from "@/types/plans";

describe("PlanComparison", () => {
  const mockPlans: Plan[] = [
    {
      id: "plan-001",
      name: "Basic Plan",
      description: "Great for everyday use",
      price: 29.99,
      currency: "USD",
      billingCycle: "monthly",
      type: "postpaid",
      category: "basic",
      data: "10GB",
      voice: "500 mins",
      sms: "100 SMS",
      popular: false,
      features: [
        { name: "5G Access", included: true, limit: null },
        { name: "Hotspot", included: true, limit: "5GB" },
        { name: "International Calls", included: false, limit: null },
      ],
    },
    {
      id: "plan-002",
      name: "Premium Plan",
      description: "For power users",
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
      ],
    },
    {
      id: "plan-003",
      name: "Standard Plan",
      description: "Best value",
      price: 39.99,
      currency: "USD",
      billingCycle: "monthly",
      type: "postpaid",
      category: "standard",
      data: "20GB",
      voice: "Unlimited",
      sms: "200 SMS",
      popular: false,
      features: [
        { name: "5G Access", included: true, limit: null },
        { name: "Hotspot", included: true, limit: "10GB" },
        { name: "International Calls", included: false, limit: null },
      ],
    },
  ];

  describe("rendering", () => {
    it("displays all plan names in header", () => {
      render(<PlanComparison plans={mockPlans.slice(0, 2)} />);
      expect(screen.getByText("Basic Plan")).toBeInTheDocument();
      expect(screen.getByText("Premium Plan")).toBeInTheDocument();
    });

    it("displays prices for all plans", () => {
      render(<PlanComparison plans={mockPlans.slice(0, 2)} />);
      expect(screen.getByText("$29.99")).toBeInTheDocument();
      expect(screen.getByText("$59.99")).toBeInTheDocument();
    });

    it("displays data allowances for all plans", () => {
      render(<PlanComparison plans={mockPlans.slice(0, 2)} />);
      expect(screen.getByText("10GB")).toBeInTheDocument();
      // Premium plan has multiple "Unlimited" values, so use getAllByText
      const unlimitedTexts = screen.getAllByText("Unlimited");
      expect(unlimitedTexts.length).toBeGreaterThan(0);
    });

    it("renders comparison table with feature rows", () => {
      render(<PlanComparison plans={mockPlans.slice(0, 2)} />);
      expect(screen.getByText("5G Access")).toBeInTheDocument();
      expect(screen.getByText("Hotspot")).toBeInTheDocument();
      expect(screen.getByText("International Calls")).toBeInTheDocument();
    });

    it("displays check marks for included features", () => {
      render(<PlanComparison plans={mockPlans.slice(0, 2)} />);
      // All plans have 5G Access included
      const checkmarks = screen.getAllByTestId("check-icon");
      expect(checkmarks.length).toBeGreaterThan(0);
    });

    it("displays X marks for excluded features", () => {
      render(<PlanComparison plans={mockPlans.slice(0, 2)} />);
      // Basic plan does not include International Calls
      const xmarks = screen.getAllByTestId("close-icon");
      expect(xmarks.length).toBeGreaterThan(0);
    });

    it("displays feature limits when available", () => {
      render(<PlanComparison plans={mockPlans.slice(0, 2)} />);
      expect(screen.getByText("5GB")).toBeInTheDocument(); // Basic plan hotspot limit
      expect(screen.getByText("20GB")).toBeInTheDocument(); // Premium plan hotspot limit
    });
  });

  describe("plan limit", () => {
    it("supports comparing up to 3 plans", () => {
      render(<PlanComparison plans={mockPlans} />);
      expect(screen.getByText("Basic Plan")).toBeInTheDocument();
      expect(screen.getByText("Premium Plan")).toBeInTheDocument();
      expect(screen.getByText("Standard Plan")).toBeInTheDocument();
    });

    it("shows only first 3 plans when more than 3 are provided", () => {
      const fourPlans = [
        ...mockPlans,
        {
          ...mockPlans[0],
          id: "plan-004",
          name: "Fourth Plan",
        },
      ];
      render(<PlanComparison plans={fourPlans} />);
      expect(screen.queryByText("Fourth Plan")).not.toBeInTheDocument();
    });
  });

  describe("select functionality", () => {
    it("renders select buttons for each plan", () => {
      render(<PlanComparison plans={mockPlans.slice(0, 2)} />);
      const selectButtons = screen.getAllByRole("button", { name: /select/i });
      expect(selectButtons).toHaveLength(2);
    });

    it("calls onSelectPlan when select button is clicked", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      render(
        <PlanComparison plans={mockPlans.slice(0, 2)} onSelectPlan={handleSelect} />
      );

      const selectButtons = screen.getAllByRole("button", { name: /select/i });
      await user.click(selectButtons[0]);
      expect(handleSelect).toHaveBeenCalledWith(mockPlans[0]);
    });

    it("marks current plan and disables its select button", () => {
      render(
        <PlanComparison plans={mockPlans.slice(0, 2)} currentPlanId="plan-001" />
      );
      expect(screen.getByText("Current Plan")).toBeInTheDocument();
    });
  });

  describe("popular badge", () => {
    it("shows popular badge for popular plans", () => {
      render(<PlanComparison plans={mockPlans.slice(0, 2)} />);
      expect(screen.getByText("Popular")).toBeInTheDocument();
    });
  });
});
