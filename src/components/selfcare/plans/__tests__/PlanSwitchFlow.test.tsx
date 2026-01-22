import { render, screen, userEvent, waitFor } from "@/test/test-utils";
import { PlanSwitchFlow } from "../PlanSwitchFlow";
import { Plan, PlanSwitchResponse } from "@/types/plans";

describe("PlanSwitchFlow", () => {
  const currentPlan: Plan = {
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
    ],
  };

  const newPlan: Plan = {
    id: "plan-002",
    name: "Premium Plan",
    description: "Unlimited everything",
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
    ],
  };

  const mockOnSwitch = vi.fn().mockResolvedValue({
    success: true,
    message: "Plan switched successfully",
    switchId: "switch-001",
    effectiveDate: "2026-02-01",
  } as PlanSwitchResponse);

  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("step 1 - select plan", () => {
    it("displays current plan information", () => {
      render(
        <PlanSwitchFlow
          currentPlan={currentPlan}
          newPlan={newPlan}
          onSwitch={mockOnSwitch}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText("Basic Plan")).toBeInTheDocument();
      expect(screen.getByText("$29.99")).toBeInTheDocument();
    });

    it("displays new plan information", () => {
      render(
        <PlanSwitchFlow
          currentPlan={currentPlan}
          newPlan={newPlan}
          onSwitch={mockOnSwitch}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText("Premium Plan")).toBeInTheDocument();
      expect(screen.getByText("$59.99")).toBeInTheDocument();
    });

    it("shows price difference", () => {
      render(
        <PlanSwitchFlow
          currentPlan={currentPlan}
          newPlan={newPlan}
          onSwitch={mockOnSwitch}
          onCancel={mockOnCancel}
        />
      );
      // New plan costs $30 more
      expect(screen.getByText(/\+\$30\.00/)).toBeInTheDocument();
    });

    it("displays step indicator showing step 1 of 3", () => {
      render(
        <PlanSwitchFlow
          currentPlan={currentPlan}
          newPlan={newPlan}
          onSwitch={mockOnSwitch}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText(/step 1/i)).toBeInTheDocument();
    });

    it("shows continue button", () => {
      render(
        <PlanSwitchFlow
          currentPlan={currentPlan}
          newPlan={newPlan}
          onSwitch={mockOnSwitch}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
    });

    it("shows cancel button", () => {
      render(
        <PlanSwitchFlow
          currentPlan={currentPlan}
          newPlan={newPlan}
          onSwitch={mockOnSwitch}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <PlanSwitchFlow
          currentPlan={currentPlan}
          newPlan={newPlan}
          onSwitch={mockOnSwitch}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole("button", { name: /cancel/i }));
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe("step 2 - confirm", () => {
    it("advances to confirm step when continue is clicked", async () => {
      const user = userEvent.setup();
      render(
        <PlanSwitchFlow
          currentPlan={currentPlan}
          newPlan={newPlan}
          onSwitch={mockOnSwitch}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole("button", { name: /continue/i }));
      expect(screen.getByText(/step 2/i)).toBeInTheDocument();
    });

    it("shows confirmation message", async () => {
      const user = userEvent.setup();
      render(
        <PlanSwitchFlow
          currentPlan={currentPlan}
          newPlan={newPlan}
          onSwitch={mockOnSwitch}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole("button", { name: /continue/i }));
      expect(screen.getByText("Confirm Your Switch")).toBeInTheDocument();
    });

    it("shows back button to return to step 1", async () => {
      const user = userEvent.setup();
      render(
        <PlanSwitchFlow
          currentPlan={currentPlan}
          newPlan={newPlan}
          onSwitch={mockOnSwitch}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole("button", { name: /continue/i }));
      expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    });

    it("returns to step 1 when back is clicked", async () => {
      const user = userEvent.setup();
      render(
        <PlanSwitchFlow
          currentPlan={currentPlan}
          newPlan={newPlan}
          onSwitch={mockOnSwitch}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole("button", { name: /continue/i }));
      await user.click(screen.getByRole("button", { name: /back/i }));
      expect(screen.getByText(/step 1/i)).toBeInTheDocument();
    });

    it("shows effective date options", async () => {
      const user = userEvent.setup();
      render(
        <PlanSwitchFlow
          currentPlan={currentPlan}
          newPlan={newPlan}
          onSwitch={mockOnSwitch}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole("button", { name: /continue/i }));
      expect(screen.getByRole("radio", { name: /immediate/i })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: /next billing cycle/i })).toBeInTheDocument();
    });

    it("shows confirm switch button", async () => {
      const user = userEvent.setup();
      render(
        <PlanSwitchFlow
          currentPlan={currentPlan}
          newPlan={newPlan}
          onSwitch={mockOnSwitch}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole("button", { name: /continue/i }));
      expect(screen.getByRole("button", { name: /confirm switch/i })).toBeInTheDocument();
    });
  });

  describe("step 3 - result", () => {
    it("calls onSwitch and shows success on confirmation", async () => {
      const user = userEvent.setup();
      render(
        <PlanSwitchFlow
          currentPlan={currentPlan}
          newPlan={newPlan}
          onSwitch={mockOnSwitch}
          onCancel={mockOnCancel}
        />
      );

      // Step 1 -> Step 2
      await user.click(screen.getByRole("button", { name: /continue/i }));
      // Step 2 -> Step 3
      await user.click(screen.getByRole("button", { name: /confirm switch/i }));

      await waitFor(() => {
        expect(mockOnSwitch).toHaveBeenCalledWith({
          currentPlanId: "plan-001",
          newPlanId: "plan-002",
          effectiveDate: "next_billing_cycle",
          keepAddons: false,
        });
      });

      await waitFor(() => {
        expect(screen.getByText("Success!")).toBeInTheDocument();
      });
    });

    it("shows error message on switch failure", async () => {
      const failingSwitch = vi.fn().mockResolvedValue({
        success: false,
        error: "Unable to switch plan at this time",
      } as PlanSwitchResponse);

      const user = userEvent.setup();
      render(
        <PlanSwitchFlow
          currentPlan={currentPlan}
          newPlan={newPlan}
          onSwitch={failingSwitch}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole("button", { name: /continue/i }));
      await user.click(screen.getByRole("button", { name: /confirm switch/i }));

      await waitFor(() => {
        expect(screen.getByText(/unable to switch plan/i)).toBeInTheDocument();
      });
    });

    it("shows done button after successful switch", async () => {
      const user = userEvent.setup();
      render(
        <PlanSwitchFlow
          currentPlan={currentPlan}
          newPlan={newPlan}
          onSwitch={mockOnSwitch}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole("button", { name: /continue/i }));
      await user.click(screen.getByRole("button", { name: /confirm switch/i }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /done/i })).toBeInTheDocument();
      });
    });
  });

  describe("loading state", () => {
    it("shows loading spinner during switch", async () => {
      const slowSwitch = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const user = userEvent.setup();
      render(
        <PlanSwitchFlow
          currentPlan={currentPlan}
          newPlan={newPlan}
          onSwitch={slowSwitch}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole("button", { name: /continue/i }));
      await user.click(screen.getByRole("button", { name: /confirm switch/i }));

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });
});
