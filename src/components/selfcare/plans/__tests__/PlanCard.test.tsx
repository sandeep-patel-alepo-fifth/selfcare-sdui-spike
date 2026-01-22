import { render, screen, userEvent } from "@/test/test-utils";
import { PlanCard } from "../PlanCard";
import { PlanSummary } from "@/types/plans";

describe("PlanCard", () => {
  const mockPlan: PlanSummary = {
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
  };

  describe("rendering", () => {
    it("displays the plan name", () => {
      render(<PlanCard plan={mockPlan} />);
      expect(screen.getByText("Basic Plan")).toBeInTheDocument();
    });

    it("displays the plan description", () => {
      render(<PlanCard plan={mockPlan} />);
      expect(screen.getByText("Great for everyday use")).toBeInTheDocument();
    });

    it("displays the formatted price with currency", () => {
      render(<PlanCard plan={mockPlan} />);
      expect(screen.getByText("$29.99")).toBeInTheDocument();
    });

    it("displays the billing cycle", () => {
      render(<PlanCard plan={mockPlan} />);
      expect(screen.getByText(/month/i)).toBeInTheDocument();
    });

    it("displays the data allowance", () => {
      render(<PlanCard plan={mockPlan} />);
      expect(screen.getByText("10GB")).toBeInTheDocument();
    });

    it("displays the voice allowance", () => {
      render(<PlanCard plan={mockPlan} />);
      expect(screen.getByText("500 mins")).toBeInTheDocument();
    });

    it("displays the SMS allowance", () => {
      render(<PlanCard plan={mockPlan} />);
      expect(screen.getByText("100 SMS")).toBeInTheDocument();
    });
  });

  describe("popular badge", () => {
    it("shows popular badge when plan is marked as popular", () => {
      const popularPlan: PlanSummary = {
        ...mockPlan,
        popular: true,
      };
      render(<PlanCard plan={popularPlan} />);
      expect(screen.getByText("Popular")).toBeInTheDocument();
    });

    it("does not show popular badge when plan is not popular", () => {
      render(<PlanCard plan={mockPlan} />);
      expect(screen.queryByText("Popular")).not.toBeInTheDocument();
    });
  });

  describe("select button", () => {
    it("renders select button", () => {
      render(<PlanCard plan={mockPlan} />);
      expect(screen.getByRole("button", { name: /select/i })).toBeInTheDocument();
    });

    it("calls onSelect when select button is clicked", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      render(<PlanCard plan={mockPlan} onSelect={handleSelect} />);

      await user.click(screen.getByRole("button", { name: /select/i }));
      expect(handleSelect).toHaveBeenCalledWith(mockPlan);
    });

    it("disables select button when disabled prop is true", () => {
      render(<PlanCard plan={mockPlan} disabled />);
      expect(screen.getByRole("button", { name: /select/i })).toBeDisabled();
    });

    it("shows 'Current Plan' when isCurrentPlan is true", () => {
      render(<PlanCard plan={mockPlan} isCurrentPlan />);
      expect(screen.getByText("Current Plan")).toBeInTheDocument();
    });
  });

  describe("currency formatting", () => {
    it("formats EUR currency correctly", () => {
      const eurPlan: PlanSummary = {
        ...mockPlan,
        currency: "EUR",
        price: 24.99,
      };
      render(<PlanCard plan={eurPlan} />);
      expect(screen.getByText(/24.99/)).toBeInTheDocument();
    });
  });

  describe("plan types", () => {
    it("displays prepaid plan type", () => {
      const prepaidPlan: PlanSummary = {
        ...mockPlan,
        type: "prepaid",
      };
      render(<PlanCard plan={prepaidPlan} />);
      expect(screen.getByText("Prepaid")).toBeInTheDocument();
    });

    it("displays postpaid plan type", () => {
      render(<PlanCard plan={mockPlan} />);
      expect(screen.getByText("Postpaid")).toBeInTheDocument();
    });
  });
});
