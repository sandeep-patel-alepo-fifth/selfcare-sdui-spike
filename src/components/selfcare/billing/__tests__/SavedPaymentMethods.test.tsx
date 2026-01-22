import { render, screen, userEvent } from "@/test/test-utils";
import { SavedPaymentMethods } from "../SavedPaymentMethods";
import { SavedPaymentMethod } from "@/types/billing";

describe("SavedPaymentMethods", () => {
  const mockMethods: SavedPaymentMethod[] = [
    {
      id: "pm-001",
      type: "card",
      last4: "4242",
      label: "Visa ending in 4242",
      expiryMonth: 12,
      expiryYear: 2027,
      isDefault: true,
    },
    {
      id: "pm-002",
      type: "card",
      last4: "5555",
      label: "Mastercard ending in 5555",
      expiryMonth: 6,
      expiryYear: 2026,
      isDefault: false,
    },
    {
      id: "pm-003",
      type: "bank",
      last4: "9876",
      label: "Bank of America",
      isDefault: false,
    },
  ];

  describe("rendering", () => {
    it("displays all saved payment methods", () => {
      render(<SavedPaymentMethods methods={mockMethods} />);

      expect(screen.getByText("Visa ending in 4242")).toBeInTheDocument();
      expect(screen.getByText("Mastercard ending in 5555")).toBeInTheDocument();
      expect(screen.getByText("Bank of America")).toBeInTheDocument();
    });

    it("shows masked card numbers with last 4 digits", () => {
      render(<SavedPaymentMethods methods={mockMethods} />);

      expect(screen.getByText(/\*{4} 4242/)).toBeInTheDocument();
      expect(screen.getByText(/\*{4} 5555/)).toBeInTheDocument();
    });

    it("displays expiry date for cards", () => {
      render(<SavedPaymentMethods methods={mockMethods} />);

      expect(screen.getByText(/12\/2027/)).toBeInTheDocument();
      expect(screen.getByText(/06\/2026/)).toBeInTheDocument();
    });

    it("shows default badge for default method", () => {
      render(<SavedPaymentMethods methods={mockMethods} />);

      expect(screen.getByText("Default")).toBeInTheDocument();
    });

    it("shows empty state when no methods", () => {
      render(<SavedPaymentMethods methods={[]} />);

      expect(screen.getByText(/No saved payment methods/i)).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("shows delete button for each method", () => {
      render(<SavedPaymentMethods methods={mockMethods} onDelete={() => {}} />);

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      expect(deleteButtons).toHaveLength(3);
    });

    it("calls onDelete when delete button is clicked", async () => {
      const user = userEvent.setup();
      const handleDelete = vi.fn();

      render(<SavedPaymentMethods methods={mockMethods} onDelete={handleDelete} />);

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[0]);

      expect(handleDelete).toHaveBeenCalledWith("pm-001");
    });

    it("calls onSetDefault when set default is clicked", async () => {
      const user = userEvent.setup();
      const handleSetDefault = vi.fn();

      render(
        <SavedPaymentMethods
          methods={mockMethods}
          onSetDefault={handleSetDefault}
        />
      );

      // Find a "Set as default" button (not for the already default one)
      const setDefaultButtons = screen.getAllByRole("button", { name: /set as default/i });
      await user.click(setDefaultButtons[0]);

      expect(handleSetDefault).toHaveBeenCalled();
    });

    it("shows add payment method button", () => {
      render(<SavedPaymentMethods methods={mockMethods} onAdd={() => {}} />);

      expect(screen.getByRole("button", { name: /add payment method/i })).toBeInTheDocument();
    });

    it("calls onAdd when add button is clicked", async () => {
      const user = userEvent.setup();
      const handleAdd = vi.fn();

      render(<SavedPaymentMethods methods={mockMethods} onAdd={handleAdd} />);

      await user.click(screen.getByRole("button", { name: /add payment method/i }));
      expect(handleAdd).toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("shows loading indicator when loading", () => {
      render(<SavedPaymentMethods methods={[]} loading />);

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });
});
