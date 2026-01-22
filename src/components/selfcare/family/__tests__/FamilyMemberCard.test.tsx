import { render, screen, userEvent } from "@/test/test-utils";
import { FamilyMemberCard } from "../FamilyMemberCard";
import { FamilyMember } from "@/types/family";

describe("FamilyMemberCard", () => {
  const mockParentMember: FamilyMember = {
    id: "member-001",
    name: "John Doe",
    phone: "+1-555-123-4567",
    role: "parent",
    status: "active",
    planName: "Family Premium",
    avatarUrl: null,
    addedAt: "2025-01-01T00:00:00Z",
    usage: {
      data: { used: 15, total: 50, percentage: 30 },
      voice: { used: 120, total: 500, percentage: 24 },
    },
  };

  const mockChildMember: FamilyMember = {
    id: "member-002",
    name: "Jane Doe",
    phone: "+1-555-987-6543",
    role: "child",
    status: "active",
    planName: "Family Share",
    avatarUrl: null,
    addedAt: "2025-06-15T00:00:00Z",
    usage: {
      data: { used: 8, total: 20, percentage: 40 },
    },
    controls: {
      dataLimit: 20,
      voiceLimit: null,
      smsLimit: null,
      contentFiltering: true,
      purchaseBlocked: true,
      internationalBlocked: false,
      premiumServicesBlocked: false,
    },
  };

  describe("rendering", () => {
    it("displays the member name", () => {
      render(<FamilyMemberCard member={mockParentMember} />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("displays the phone number", () => {
      render(<FamilyMemberCard member={mockParentMember} />);
      expect(screen.getByText("+1-555-123-4567")).toBeInTheDocument();
    });

    it("displays the plan name", () => {
      render(<FamilyMemberCard member={mockParentMember} />);
      expect(screen.getByText("Family Premium")).toBeInTheDocument();
    });

    it("displays the role badge for parent", () => {
      render(<FamilyMemberCard member={mockParentMember} />);
      expect(screen.getByText("Parent")).toBeInTheDocument();
    });

    it("displays the role badge for child", () => {
      render(<FamilyMemberCard member={mockChildMember} />);
      expect(screen.getByText("Child")).toBeInTheDocument();
    });
  });

  describe("status badges", () => {
    it("displays active status", () => {
      render(<FamilyMemberCard member={mockParentMember} />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("displays suspended status", () => {
      const suspendedMember: FamilyMember = {
        ...mockChildMember,
        status: "suspended",
      };
      render(<FamilyMemberCard member={suspendedMember} />);
      expect(screen.getByText("Suspended")).toBeInTheDocument();
    });

    it("displays pending status", () => {
      const pendingMember: FamilyMember = {
        ...mockChildMember,
        status: "pending",
      };
      render(<FamilyMemberCard member={pendingMember} />);
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });
  });

  describe("data usage display", () => {
    it("displays data usage when available", () => {
      render(<FamilyMemberCard member={mockParentMember} />);
      expect(screen.getByText(/15.*GB.*50.*GB/i)).toBeInTheDocument();
    });

    it("displays data usage percentage", () => {
      render(<FamilyMemberCard member={mockParentMember} />);
      expect(screen.getByText(/30%/)).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls onViewDetails when view details button is clicked", async () => {
      const user = userEvent.setup();
      const handleViewDetails = vi.fn();
      render(
        <FamilyMemberCard
          member={mockParentMember}
          onViewDetails={handleViewDetails}
        />
      );

      await user.click(screen.getByRole("button", { name: /view details/i }));
      expect(handleViewDetails).toHaveBeenCalledWith(mockParentMember);
    });

    it("calls onManageControls when manage controls button is clicked for child", async () => {
      const user = userEvent.setup();
      const handleManageControls = vi.fn();
      render(
        <FamilyMemberCard
          member={mockChildMember}
          onManageControls={handleManageControls}
        />
      );

      await user.click(screen.getByRole("button", { name: /manage controls/i }));
      expect(handleManageControls).toHaveBeenCalledWith(mockChildMember);
    });

    it("does not show manage controls button for parent accounts", () => {
      const handleManageControls = vi.fn();
      render(
        <FamilyMemberCard
          member={mockParentMember}
          onManageControls={handleManageControls}
        />
      );

      expect(
        screen.queryByRole("button", { name: /manage controls/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("parental controls indicator", () => {
    it("shows controls active indicator when child has controls", () => {
      render(<FamilyMemberCard member={mockChildMember} />);
      expect(screen.getByText(/controls active/i)).toBeInTheDocument();
    });

    it("does not show controls indicator for parent accounts", () => {
      render(<FamilyMemberCard member={mockParentMember} />);
      expect(screen.queryByText(/controls active/i)).not.toBeInTheDocument();
    });
  });
});
