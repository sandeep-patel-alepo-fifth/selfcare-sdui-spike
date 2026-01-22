import { render, screen, userEvent } from "@/test/test-utils";
import { ChildAccountCard } from "../ChildAccountCard";
import { FamilyMember } from "@/types/family";

describe("ChildAccountCard", () => {
  const mockChild: FamilyMember = {
    id: "child-001",
    name: "Jane Doe",
    phone: "+1-555-987-6543",
    role: "child",
    status: "active",
    planName: "Family Share",
    avatarUrl: null,
    addedAt: "2025-06-15T00:00:00Z",
    usage: {
      data: { used: 8, total: 20, percentage: 40 },
      voice: { used: 60, total: 200, percentage: 30 },
      sms: { used: 50, total: 500, percentage: 10 },
    },
    controls: {
      dataLimit: 20,
      voiceLimit: 200,
      smsLimit: null,
      contentFiltering: true,
      purchaseBlocked: true,
      internationalBlocked: false,
      premiumServicesBlocked: false,
    },
  };

  describe("rendering", () => {
    it("displays the child name", () => {
      render(<ChildAccountCard child={mockChild} />);
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });

    it("displays the phone number", () => {
      render(<ChildAccountCard child={mockChild} />);
      expect(screen.getByText("+1-555-987-6543")).toBeInTheDocument();
    });

    it("displays data usage with progress bar", () => {
      render(<ChildAccountCard child={mockChild} />);
      expect(screen.getByText(/8.*GB.*20.*GB/i)).toBeInTheDocument();
    });

    it("displays voice usage when available", () => {
      render(<ChildAccountCard child={mockChild} />);
      expect(screen.getByText(/60.*min.*200.*min/i)).toBeInTheDocument();
    });

    it("displays SMS usage when available", () => {
      render(<ChildAccountCard child={mockChild} />);
      expect(screen.getByText(/50.*500/)).toBeInTheDocument();
    });
  });

  describe("parental controls display", () => {
    it("shows content filtering status when enabled", () => {
      render(<ChildAccountCard child={mockChild} />);
      expect(screen.getByText(/content filtering/i)).toBeInTheDocument();
    });

    it("shows purchase blocked status when enabled", () => {
      render(<ChildAccountCard child={mockChild} />);
      expect(screen.getByText(/purchases blocked/i)).toBeInTheDocument();
    });

    it("shows data limit when set", () => {
      render(<ChildAccountCard child={mockChild} />);
      expect(screen.getByText(/20.*GB.*limit/i)).toBeInTheDocument();
    });
  });

  describe("status indicator", () => {
    it("shows active status indicator", () => {
      render(<ChildAccountCard child={mockChild} />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("shows suspended status indicator", () => {
      const suspendedChild: FamilyMember = {
        ...mockChild,
        status: "suspended",
      };
      render(<ChildAccountCard child={suspendedChild} />);
      expect(screen.getByText("Suspended")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls onEditControls when edit controls button is clicked", async () => {
      const user = userEvent.setup();
      const handleEditControls = vi.fn();
      render(
        <ChildAccountCard
          child={mockChild}
          onEditControls={handleEditControls}
        />
      );

      await user.click(screen.getByRole("button", { name: /edit controls/i }));
      expect(handleEditControls).toHaveBeenCalledWith(mockChild);
    });

    it("calls onRemove when remove button is clicked", async () => {
      const user = userEvent.setup();
      const handleRemove = vi.fn();
      render(
        <ChildAccountCard
          child={mockChild}
          onRemove={handleRemove}
        />
      );

      await user.click(screen.getByRole("button", { name: /remove/i }));
      expect(handleRemove).toHaveBeenCalledWith(mockChild);
    });

    it("calls onViewUsage when view usage button is clicked", async () => {
      const user = userEvent.setup();
      const handleViewUsage = vi.fn();
      render(
        <ChildAccountCard
          child={mockChild}
          onViewUsage={handleViewUsage}
        />
      );

      await user.click(screen.getByRole("button", { name: /view usage/i }));
      expect(handleViewUsage).toHaveBeenCalledWith(mockChild);
    });
  });

  describe("high usage warning", () => {
    it("shows warning when data usage exceeds 80%", () => {
      const highUsageChild: FamilyMember = {
        ...mockChild,
        usage: {
          data: { used: 18, total: 20, percentage: 90 },
        },
      };
      render(<ChildAccountCard child={highUsageChild} />);
      expect(screen.getByText(/high usage/i)).toBeInTheDocument();
    });

    it("does not show warning when data usage is below 80%", () => {
      render(<ChildAccountCard child={mockChild} />);
      expect(screen.queryByText(/high usage/i)).not.toBeInTheDocument();
    });
  });
});
