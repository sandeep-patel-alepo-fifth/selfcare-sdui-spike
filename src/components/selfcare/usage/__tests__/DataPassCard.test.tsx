import { render, screen, userEvent } from "@/test/test-utils";
import { DataPassCard } from "../DataPassCard";
import { DataPass } from "@/types/usage";

describe("DataPassCard", () => {
  const mockOnPurchase = vi.fn();

  const mockAvailableDataPass: DataPass = {
    id: "dp-001",
    name: "Weekend Data Boost",
    description: "Extra 10GB for the weekend",
    dataAmount: 10,
    price: 4.99,
    currency: "USD",
    validity: 2,
    status: "available",
    expiryDate: null,
    purchaseDate: null,
  };

  const mockActiveDataPass: DataPass = {
    id: "dp-002",
    name: "Weekly Data Pack",
    description: "20GB valid for 7 days",
    dataAmount: 20,
    dataUsed: 8,
    price: 9.99,
    currency: "USD",
    validity: 7,
    status: "active",
    expiryDate: "2026-01-25",
    purchaseDate: "2026-01-18",
  };

  beforeEach(() => {
    mockOnPurchase.mockReset();
  });

  describe("available data pass display", () => {
    it("displays data pass name", () => {
      render(<DataPassCard dataPass={mockAvailableDataPass} />);

      expect(screen.getByText("Weekend Data Boost")).toBeInTheDocument();
    });

    it("displays data pass description", () => {
      render(<DataPassCard dataPass={mockAvailableDataPass} />);

      expect(screen.getByText("Extra 10GB for the weekend")).toBeInTheDocument();
    });

    it("displays data amount", () => {
      render(<DataPassCard dataPass={mockAvailableDataPass} />);

      // Use heading role to target the h5 element specifically
      expect(screen.getByRole("heading", { name: /10.*GB/i })).toBeInTheDocument();
    });

    it("displays price", () => {
      render(<DataPassCard dataPass={mockAvailableDataPass} />);

      expect(screen.getByText("$4.99")).toBeInTheDocument();
    });

    it("displays validity period", () => {
      render(<DataPassCard dataPass={mockAvailableDataPass} />);

      expect(screen.getByText(/2 days/i)).toBeInTheDocument();
    });

    it("displays available status", () => {
      render(<DataPassCard dataPass={mockAvailableDataPass} />);

      expect(screen.getByText("Available")).toBeInTheDocument();
    });
  });

  describe("active data pass display", () => {
    it("displays active status", () => {
      render(<DataPassCard dataPass={mockActiveDataPass} />);

      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("displays usage progress when active", () => {
      render(<DataPassCard dataPass={mockActiveDataPass} />);

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("displays remaining data", () => {
      render(<DataPassCard dataPass={mockActiveDataPass} />);

      // 8 used of 20, so 12 remaining
      expect(screen.getByText(/12 ?GB remaining/i)).toBeInTheDocument();
    });

    it("displays expiry date", () => {
      render(<DataPassCard dataPass={mockActiveDataPass} />);

      expect(screen.getByText(/expires.*Jan 25, 2026/i)).toBeInTheDocument();
    });
  });

  describe("status variations", () => {
    it("displays expired status", () => {
      const expiredPass: DataPass = {
        ...mockActiveDataPass,
        status: "expired",
      };
      render(<DataPassCard dataPass={expiredPass} />);

      expect(screen.getByText("Expired")).toBeInTheDocument();
    });

    it("displays depleted status", () => {
      const depletedPass: DataPass = {
        ...mockActiveDataPass,
        status: "depleted",
        dataUsed: 20,
      };
      render(<DataPassCard dataPass={depletedPass} />);

      expect(screen.getByText("Depleted")).toBeInTheDocument();
    });
  });

  describe("purchase action", () => {
    it("displays purchase button for available passes", () => {
      render(<DataPassCard dataPass={mockAvailableDataPass} onPurchase={mockOnPurchase} />);

      expect(screen.getByRole("button", { name: /buy now/i })).toBeInTheDocument();
    });

    it("calls onPurchase when purchase button is clicked", async () => {
      const user = userEvent.setup();
      render(<DataPassCard dataPass={mockAvailableDataPass} onPurchase={mockOnPurchase} />);

      await user.click(screen.getByRole("button", { name: /buy now/i }));

      expect(mockOnPurchase).toHaveBeenCalledWith(mockAvailableDataPass.id);
    });

    it("does not show purchase button for active passes", () => {
      render(<DataPassCard dataPass={mockActiveDataPass} onPurchase={mockOnPurchase} />);

      expect(screen.queryByRole("button", { name: /buy now/i })).not.toBeInTheDocument();
    });

    it("does not show purchase button when onPurchase is not provided", () => {
      render(<DataPassCard dataPass={mockAvailableDataPass} />);

      expect(screen.queryByRole("button", { name: /buy now/i })).not.toBeInTheDocument();
    });
  });
});
