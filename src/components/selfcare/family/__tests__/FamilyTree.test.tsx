import { render, screen, userEvent } from "@/test/test-utils";
import { FamilyTree } from "../FamilyTree";
import { FamilyHierarchy } from "@/types/family";

describe("FamilyTree", () => {
  const mockHierarchy: FamilyHierarchy = {
    parent: {
      id: "parent-001",
      name: "John Doe",
      phone: "+1-555-123-4567",
      role: "parent",
      status: "active",
      planName: "Family Premium",
      avatarUrl: null,
      addedAt: "2025-01-01T00:00:00Z",
      usage: {
        data: { used: 15, total: 50, percentage: 30 },
      },
    },
    children: [
      {
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
        },
        controls: {
          dataLimit: 20,
          voiceLimit: null,
          smsLimit: null,
          contentFiltering: true,
          purchaseBlocked: false,
          internationalBlocked: false,
          premiumServicesBlocked: false,
        },
      },
      {
        id: "child-002",
        name: "Jimmy Doe",
        phone: "+1-555-456-7890",
        role: "child",
        status: "active",
        planName: "Family Share",
        avatarUrl: null,
        addedAt: "2025-08-01T00:00:00Z",
        usage: {
          data: { used: 5, total: 20, percentage: 25 },
        },
      },
    ],
    maxChildren: 5,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-08-01T00:00:00Z",
  };

  describe("rendering", () => {
    it("displays the parent account", () => {
      render(<FamilyTree hierarchy={mockHierarchy} />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("displays all child accounts", () => {
      render(<FamilyTree hierarchy={mockHierarchy} />);
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      expect(screen.getByText("Jimmy Doe")).toBeInTheDocument();
    });

    it("displays parent role badge", () => {
      render(<FamilyTree hierarchy={mockHierarchy} />);
      expect(screen.getByText("Parent")).toBeInTheDocument();
    });

    it("displays child count", () => {
      render(<FamilyTree hierarchy={mockHierarchy} />);
      expect(screen.getByText(/2.*child/i)).toBeInTheDocument();
    });

    it("displays max children limit", () => {
      render(<FamilyTree hierarchy={mockHierarchy} />);
      expect(screen.getByText(/of 5/)).toBeInTheDocument();
    });
  });

  describe("hierarchy visualization", () => {
    it("shows parent at the top of the tree", () => {
      render(<FamilyTree hierarchy={mockHierarchy} />);
      const parentSection = screen.getByTestId("parent-section");
      const childSection = screen.getByTestId("children-section");
      expect(parentSection).toBeInTheDocument();
      expect(childSection).toBeInTheDocument();
    });

    it("shows visual connection between parent and children", () => {
      render(<FamilyTree hierarchy={mockHierarchy} />);
      expect(screen.getByTestId("hierarchy-connector")).toBeInTheDocument();
    });
  });

  describe("empty children", () => {
    it("shows empty state when no children", () => {
      const hierarchyWithNoChildren: FamilyHierarchy = {
        ...mockHierarchy,
        children: [],
      };
      render(<FamilyTree hierarchy={hierarchyWithNoChildren} />);
      expect(screen.getByText(/no child accounts/i)).toBeInTheDocument();
    });

    it("shows add child prompt when no children", () => {
      const hierarchyWithNoChildren: FamilyHierarchy = {
        ...mockHierarchy,
        children: [],
      };
      render(<FamilyTree hierarchy={hierarchyWithNoChildren} onAddChild={vi.fn()} />);
      expect(screen.getByRole("button", { name: /add.*child/i })).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls onSelectMember when parent is clicked", async () => {
      const user = userEvent.setup();
      const handleSelectMember = vi.fn();
      render(
        <FamilyTree
          hierarchy={mockHierarchy}
          onSelectMember={handleSelectMember}
        />
      );

      await user.click(screen.getByText("John Doe"));
      expect(handleSelectMember).toHaveBeenCalledWith(mockHierarchy.parent);
    });

    it("calls onSelectMember when child is clicked", async () => {
      const user = userEvent.setup();
      const handleSelectMember = vi.fn();
      render(
        <FamilyTree
          hierarchy={mockHierarchy}
          onSelectMember={handleSelectMember}
        />
      );

      await user.click(screen.getByText("Jane Doe"));
      expect(handleSelectMember).toHaveBeenCalledWith(mockHierarchy.children[0]);
    });

    it("calls onAddChild when add child button is clicked", async () => {
      const user = userEvent.setup();
      const handleAddChild = vi.fn();
      render(
        <FamilyTree
          hierarchy={mockHierarchy}
          onAddChild={handleAddChild}
        />
      );

      await user.click(screen.getByRole("button", { name: /add.*child/i }));
      expect(handleAddChild).toHaveBeenCalled();
    });

    it("calls onManageChild when manage button is clicked", async () => {
      const user = userEvent.setup();
      const handleManageChild = vi.fn();
      render(
        <FamilyTree
          hierarchy={mockHierarchy}
          onManageChild={handleManageChild}
        />
      );

      // Click manage on the first child
      const manageButtons = screen.getAllByRole("button", { name: /manage/i });
      await user.click(manageButtons[0]);
      expect(handleManageChild).toHaveBeenCalledWith(mockHierarchy.children[0]);
    });
  });

  describe("max children limit", () => {
    it("hides add child button when at max children", () => {
      const fullHierarchy: FamilyHierarchy = {
        ...mockHierarchy,
        children: Array(5).fill(null).map((_, i) => ({
          ...mockHierarchy.children[0],
          id: `child-${i}`,
          name: `Child ${i + 1}`,
        })),
        maxChildren: 5,
      };
      render(<FamilyTree hierarchy={fullHierarchy} onAddChild={vi.fn()} />);
      // When at max, we show an alert instead of the add button
      expect(screen.queryByRole("button", { name: /add.*child/i })).not.toBeInTheDocument();
    });

    it("shows max reached message when at limit", () => {
      const fullHierarchy: FamilyHierarchy = {
        ...mockHierarchy,
        children: Array(5).fill(null).map((_, i) => ({
          ...mockHierarchy.children[0],
          id: `child-${i}`,
          name: `Child ${i + 1}`,
        })),
        maxChildren: 5,
      };
      render(<FamilyTree hierarchy={fullHierarchy} onAddChild={vi.fn()} />);
      expect(screen.getByText(/maximum.*reached/i)).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("shows loading skeleton when loading", () => {
      render(<FamilyTree hierarchy={null} loading />);
      expect(screen.getByTestId("family-tree-skeleton")).toBeInTheDocument();
    });
  });
});
