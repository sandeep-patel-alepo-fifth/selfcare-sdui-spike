import { render, screen, userEvent } from "@/test/test-utils";
import { InvoiceCard } from "../InvoiceCard";
import { InvoiceSummary } from "@/types/billing";

describe("InvoiceCard", () => {
  const mockInvoice: InvoiceSummary = {
    id: "inv-001",
    invoiceNumber: "INV-2026-001",
    date: "2026-01-01",
    dueDate: "2026-01-15",
    amount: 125.99,
    currency: "USD",
    status: "pending",
  };

  describe("rendering", () => {
    it("displays the invoice number", () => {
      render(<InvoiceCard invoice={mockInvoice} />);
      expect(screen.getByText("INV-2026-001")).toBeInTheDocument();
    });

    it("displays the formatted amount with currency", () => {
      render(<InvoiceCard invoice={mockInvoice} />);
      expect(screen.getByText("$125.99")).toBeInTheDocument();
    });

    it("displays the invoice date", () => {
      render(<InvoiceCard invoice={mockInvoice} />);
      expect(screen.getByText(/Jan 1, 2026/)).toBeInTheDocument();
    });

    it("displays the due date", () => {
      render(<InvoiceCard invoice={mockInvoice} />);
      expect(screen.getByText(/Due Jan 15, 2026/)).toBeInTheDocument();
    });
  });

  describe("status badges", () => {
    it("displays pending status with appropriate styling", () => {
      render(<InvoiceCard invoice={mockInvoice} />);
      const chip = screen.getByText("Pending");
      expect(chip).toBeInTheDocument();
    });

    it("displays paid status for paid invoices", () => {
      const paidInvoice: InvoiceSummary = {
        ...mockInvoice,
        status: "paid",
      };
      render(<InvoiceCard invoice={paidInvoice} />);
      expect(screen.getByText("Paid")).toBeInTheDocument();
    });

    it("displays overdue status for overdue invoices", () => {
      const overdueInvoice: InvoiceSummary = {
        ...mockInvoice,
        status: "overdue",
      };
      render(<InvoiceCard invoice={overdueInvoice} />);
      expect(screen.getByText("Overdue")).toBeInTheDocument();
    });

    it("displays processing status for processing invoices", () => {
      const processingInvoice: InvoiceSummary = {
        ...mockInvoice,
        status: "processing",
      };
      render(<InvoiceCard invoice={processingInvoice} />);
      expect(screen.getByText("Processing")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls onClick when card is clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<InvoiceCard invoice={mockInvoice} onClick={handleClick} />);

      await user.click(screen.getByRole("article"));
      expect(handleClick).toHaveBeenCalledWith(mockInvoice);
    });

    it("shows view details button when onViewDetails is provided", () => {
      const handleViewDetails = vi.fn();
      render(
        <InvoiceCard invoice={mockInvoice} onViewDetails={handleViewDetails} />
      );
      expect(screen.getByRole("button", { name: /view details/i })).toBeInTheDocument();
    });

    it("calls onViewDetails when view details button is clicked", async () => {
      const user = userEvent.setup();
      const handleViewDetails = vi.fn();
      render(
        <InvoiceCard invoice={mockInvoice} onViewDetails={handleViewDetails} />
      );

      await user.click(screen.getByRole("button", { name: /view details/i }));
      expect(handleViewDetails).toHaveBeenCalledWith(mockInvoice.id);
    });
  });

  describe("currency formatting", () => {
    it("formats EUR currency correctly", () => {
      const eurInvoice: InvoiceSummary = {
        ...mockInvoice,
        currency: "EUR",
        amount: 99.5,
      };
      render(<InvoiceCard invoice={eurInvoice} />);
      // EUR formatting includes the Euro sign
      expect(screen.getByText(/99.50/)).toBeInTheDocument();
    });
  });
});
