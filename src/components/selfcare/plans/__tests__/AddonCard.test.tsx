import { render, screen, userEvent } from "@/test/test-utils";
import { AddonCard } from "../AddonCard";
import { Addon } from "@/types/plans";

describe("AddonCard", () => {
  const mockAddon: Addon = {
    id: "addon-001",
    name: "Extra Data Pack",
    description: "5GB additional data for 30 days",
    price: 9.99,
    currency: "USD",
    type: "data",
    value: "5GB",
    duration: "30 days",
    recurring: false,
  };

  describe("rendering", () => {
    it("displays the addon name", () => {
      render(<AddonCard addon={mockAddon} />);
      expect(screen.getByText("Extra Data Pack")).toBeInTheDocument();
    });

    it("displays the addon description", () => {
      render(<AddonCard addon={mockAddon} />);
      expect(screen.getByText("5GB additional data for 30 days")).toBeInTheDocument();
    });

    it("displays the formatted price with currency", () => {
      render(<AddonCard addon={mockAddon} />);
      expect(screen.getByText("$9.99")).toBeInTheDocument();
    });

    it("displays the addon value", () => {
      render(<AddonCard addon={mockAddon} />);
      expect(screen.getByText("5GB")).toBeInTheDocument();
    });

    it("displays the addon duration", () => {
      render(<AddonCard addon={mockAddon} />);
      expect(screen.getByText("30 days")).toBeInTheDocument();
    });
  });

  describe("addon types", () => {
    it("displays data addon type", () => {
      render(<AddonCard addon={mockAddon} />);
      expect(screen.getByText("Data")).toBeInTheDocument();
    });

    it("displays voice addon type", () => {
      const voiceAddon: Addon = {
        ...mockAddon,
        type: "voice",
        name: "Voice Pack",
        value: "100 mins",
      };
      render(<AddonCard addon={voiceAddon} />);
      expect(screen.getByText("Voice")).toBeInTheDocument();
    });

    it("displays sms addon type", () => {
      const smsAddon: Addon = {
        ...mockAddon,
        type: "sms",
        name: "SMS Pack",
        value: "500 SMS",
      };
      render(<AddonCard addon={smsAddon} />);
      expect(screen.getByText("SMS")).toBeInTheDocument();
    });

    it("displays roaming addon type", () => {
      const roamingAddon: Addon = {
        ...mockAddon,
        type: "roaming",
        name: "International Roaming",
      };
      render(<AddonCard addon={roamingAddon} />);
      expect(screen.getByText("Roaming")).toBeInTheDocument();
    });

    it("displays entertainment addon type", () => {
      const entertainmentAddon: Addon = {
        ...mockAddon,
        type: "entertainment",
        name: "Streaming Pack",
      };
      render(<AddonCard addon={entertainmentAddon} />);
      expect(screen.getByText("Entertainment")).toBeInTheDocument();
    });

    it("displays security addon type", () => {
      const securityAddon: Addon = {
        ...mockAddon,
        type: "security",
        name: "Security Suite",
      };
      render(<AddonCard addon={securityAddon} />);
      expect(screen.getByText("Security")).toBeInTheDocument();
    });
  });

  describe("recurring badge", () => {
    it("shows recurring badge when addon is recurring", () => {
      const recurringAddon: Addon = {
        ...mockAddon,
        recurring: true,
      };
      render(<AddonCard addon={recurringAddon} />);
      expect(screen.getByText("Recurring")).toBeInTheDocument();
    });

    it("does not show recurring badge when addon is not recurring", () => {
      render(<AddonCard addon={mockAddon} />);
      expect(screen.queryByText("Recurring")).not.toBeInTheDocument();
    });
  });

  describe("add button", () => {
    it("renders add button", () => {
      render(<AddonCard addon={mockAddon} />);
      expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    });

    it("calls onAdd when add button is clicked", async () => {
      const user = userEvent.setup();
      const handleAdd = vi.fn();
      render(<AddonCard addon={mockAddon} onAdd={handleAdd} />);

      await user.click(screen.getByRole("button", { name: /add/i }));
      expect(handleAdd).toHaveBeenCalledWith(mockAddon);
    });

    it("disables add button when disabled prop is true", () => {
      render(<AddonCard addon={mockAddon} disabled />);
      expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
    });

    it("shows 'Active' badge when isActive is true", () => {
      render(<AddonCard addon={mockAddon} isActive />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("hides add button when isActive is true", () => {
      render(<AddonCard addon={mockAddon} isActive />);
      expect(screen.queryByRole("button", { name: /add/i })).not.toBeInTheDocument();
    });
  });

  describe("currency formatting", () => {
    it("formats EUR currency correctly", () => {
      const eurAddon: Addon = {
        ...mockAddon,
        currency: "EUR",
        price: 7.99,
      };
      render(<AddonCard addon={eurAddon} />);
      expect(screen.getByText(/7.99/)).toBeInTheDocument();
    });
  });
});
