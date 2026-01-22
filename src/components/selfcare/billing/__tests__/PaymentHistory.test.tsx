import { render, screen, userEvent } from "@/test/test-utils";
import { PaymentHistory } from "../PaymentHistory";
import { Payment } from "@/types/billing";

describe("PaymentHistory", () => {
  const mockPayments: Payment[] = [
    {
      id: "pay-001",
      amount: 125.99,
      currency: "USD",
      method: "card",
      status: "completed",
      date: "2026-01-15",
      reference: "REF-001",
      description: "Invoice INV-2026-001",
    },
    {
      id: "pay-002",
      amount: 89.50,
      currency: "USD",
      method: "bank",
      status: "pending",
      date: "2026-01-10",
      reference: "REF-002",
    },
    {
      id: "pay-003",
      amount: 50.00,
      currency: "USD",
      method: "cashapp",
      status: "failed",
      date: "2026-01-05",
      reference: "REF-003",
    },
  ];

  describe("rendering", () => {
    it("displays a list of payments", () => {
      render(<PaymentHistory payments={mockPayments} />);

      expect(screen.getByText("$125.99")).toBeInTheDocument();
      expect(screen.getByText("$89.50")).toBeInTheDocument();
      expect(screen.getByText("$50.00")).toBeInTheDocument();
    });

    it("displays payment references", () => {
      render(<PaymentHistory payments={mockPayments} />);

      expect(screen.getByText("REF-001")).toBeInTheDocument();
      expect(screen.getByText("REF-002")).toBeInTheDocument();
      expect(screen.getByText("REF-003")).toBeInTheDocument();
    });

    it("displays payment dates formatted", () => {
      render(<PaymentHistory payments={mockPayments} />);

      expect(screen.getByText(/Jan 15, 2026/)).toBeInTheDocument();
      expect(screen.getByText(/Jan 10, 2026/)).toBeInTheDocument();
      expect(screen.getByText(/Jan 5, 2026/)).toBeInTheDocument();
    });

    it("displays payment status badges", () => {
      render(<PaymentHistory payments={mockPayments} />);

      expect(screen.getByText("Completed")).toBeInTheDocument();
      expect(screen.getByText("Pending")).toBeInTheDocument();
      expect(screen.getByText("Failed")).toBeInTheDocument();
    });

    it("displays payment method types", () => {
      render(<PaymentHistory payments={mockPayments} />);

      expect(screen.getByText(/Card/)).toBeInTheDocument();
      expect(screen.getByText(/Bank/)).toBeInTheDocument();
      expect(screen.getByText(/CashApp/)).toBeInTheDocument();
    });

    it("shows empty state when no payments", () => {
      render(<PaymentHistory payments={[]} />);

      expect(screen.getByText(/No payments/i)).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("shows loading indicator when loading", () => {
      render(<PaymentHistory payments={[]} loading />);

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("does not show payments when loading", () => {
      render(<PaymentHistory payments={mockPayments} loading />);

      expect(screen.queryByText("$125.99")).not.toBeInTheDocument();
    });
  });

  describe("description", () => {
    it("displays description when provided", () => {
      render(<PaymentHistory payments={mockPayments} />);

      expect(screen.getByText("Invoice INV-2026-001")).toBeInTheDocument();
    });
  });
});
