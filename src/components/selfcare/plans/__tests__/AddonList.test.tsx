import { render, screen, userEvent } from "@/test/test-utils";
import { AddonList } from "../AddonList";
import { Addon } from "@/types/plans";

describe("AddonList", () => {
  const mockAddons: Addon[] = [
    {
      id: "addon-001",
      name: "Extra Data Pack",
      description: "5GB additional data",
      price: 9.99,
      currency: "USD",
      type: "data",
      value: "5GB",
      duration: "30 days",
      recurring: false,
    },
    {
      id: "addon-002",
      name: "Voice Pack",
      description: "100 extra minutes",
      price: 4.99,
      currency: "USD",
      type: "voice",
      value: "100 mins",
      duration: "30 days",
      recurring: false,
    },
    {
      id: "addon-003",
      name: "SMS Pack",
      description: "500 SMS messages",
      price: 2.99,
      currency: "USD",
      type: "sms",
      value: "500 SMS",
      duration: "30 days",
      recurring: true,
    },
    {
      id: "addon-004",
      name: "International Roaming",
      description: "Roaming in 50+ countries",
      price: 19.99,
      currency: "USD",
      type: "roaming",
      value: null,
      duration: "7 days",
      recurring: false,
    },
  ];

  describe("rendering", () => {
    it("displays all addons", () => {
      render(<AddonList addons={mockAddons} />);
      expect(screen.getByText("Extra Data Pack")).toBeInTheDocument();
      expect(screen.getByText("Voice Pack")).toBeInTheDocument();
      expect(screen.getByText("SMS Pack")).toBeInTheDocument();
      expect(screen.getByText("International Roaming")).toBeInTheDocument();
    });

    it("renders addon cards for each addon", () => {
      render(<AddonList addons={mockAddons} />);
      const addonCards = screen.getAllByTestId("addon-card");
      expect(addonCards).toHaveLength(4);
    });

    it("displays empty state when no addons", () => {
      render(<AddonList addons={[]} />);
      expect(screen.getByText(/no add-ons available/i)).toBeInTheDocument();
    });
  });

  describe("filtering", () => {
    it("shows filter tabs by addon type", () => {
      render(<AddonList addons={mockAddons} showFilters />);
      expect(screen.getByRole("tab", { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /data/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /voice/i })).toBeInTheDocument();
    });

    it("filters addons by type when tab is clicked", async () => {
      const user = userEvent.setup();
      render(<AddonList addons={mockAddons} showFilters />);

      await user.click(screen.getByRole("tab", { name: /data/i }));

      expect(screen.getByText("Extra Data Pack")).toBeInTheDocument();
      expect(screen.queryByText("Voice Pack")).not.toBeInTheDocument();
      expect(screen.queryByText("SMS Pack")).not.toBeInTheDocument();
    });

    it("shows all addons when 'All' tab is selected", async () => {
      const user = userEvent.setup();
      render(<AddonList addons={mockAddons} showFilters />);

      // First filter to data
      await user.click(screen.getByRole("tab", { name: /data/i }));
      // Then go back to all
      await user.click(screen.getByRole("tab", { name: /all/i }));

      expect(screen.getByText("Extra Data Pack")).toBeInTheDocument();
      expect(screen.getByText("Voice Pack")).toBeInTheDocument();
      expect(screen.getByText("SMS Pack")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls onAddAddon when addon add button is clicked", async () => {
      const user = userEvent.setup();
      const handleAdd = vi.fn();
      render(<AddonList addons={mockAddons} onAddAddon={handleAdd} />);

      const addButtons = screen.getAllByRole("button", { name: /add/i });
      await user.click(addButtons[0]);

      expect(handleAdd).toHaveBeenCalledWith(mockAddons[0]);
    });
  });

  describe("active addons", () => {
    it("marks active addons correctly", () => {
      render(
        <AddonList
          addons={mockAddons}
          activeAddonIds={["addon-001", "addon-003"]}
        />
      );
      const activeChips = screen.getAllByText("Active");
      expect(activeChips).toHaveLength(2);
    });

    it("hides add button for active addons", () => {
      render(
        <AddonList
          addons={mockAddons}
          activeAddonIds={["addon-001"]}
        />
      );
      // Should have 3 add buttons (one hidden for the active addon)
      const addButtons = screen.getAllByRole("button", { name: /add/i });
      expect(addButtons).toHaveLength(3);
    });
  });

  describe("loading state", () => {
    it("shows loading skeletons when loading", () => {
      render(<AddonList addons={[]} loading />);
      const skeletons = screen.getAllByTestId("addon-skeleton");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("title", () => {
    it("displays title when provided", () => {
      render(<AddonList addons={mockAddons} title="Available Add-ons" />);
      expect(screen.getByText("Available Add-ons")).toBeInTheDocument();
    });
  });
});
