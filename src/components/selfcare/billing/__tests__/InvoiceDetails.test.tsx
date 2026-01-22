import { render, screen, waitFor, userEvent } from "@/test/test-utils";
import { InvoiceDetails } from "../InvoiceDetails";
import { Invoice } from "@/types/billing";

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("InvoiceDetails", () => {
  const mockInvoice: Invoice = {
    id: "inv-001",
    invoiceNumber: "INV-2026-001",
    date: "2026-01-01",
    dueDate: "2026-01-15",
    amount: 125.99,
    currency: "USD",
    status: "pending",
    billingPeriod: {
      start: "2025-12-01",
      end: "2025-12-31",
    },
    lineItems: [
      {
        id: "item-1",
        description: "Monthly Data Plan - 10GB",
        quantity: 1,
        unitPrice: 49.99,
        total: 49.99,
        category: "Data",
      },
      {
        id: "item-2",
        description: "Voice Minutes - 500 min",
        quantity: 1,
        unitPrice: 29.99,
        total: 29.99,
        category: "Voice",
      },
      {
        id: "item-3",
        description: "SMS Bundle - 100 messages",
        quantity: 1,
        unitPrice: 9.99,
        total: 9.99,
        category: "SMS",
      },
      {
        id: "item-4",
        description: "Taxes and Fees",
        quantity: 1,
        unitPrice: 36.02,
        total: 36.02,
        category: "Fees",
      },
    ],
    downloadUrl: "/api/billing/invoices/inv-001/download",
  };

  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("loading state", () => {
    it("shows skeleton loader while fetching data", () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));
      render(<InvoiceDetails invoiceId="inv-001" />);
      expect(screen.getByTestId("invoice-details-skeleton")).toBeInTheDocument();
    });
  });

  describe("rendering with data", () => {
    it("displays invoice number in header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInvoice),
      });

      render(<InvoiceDetails invoiceId="inv-001" />);

      await waitFor(() => {
        expect(screen.getByText("INV-2026-001")).toBeInTheDocument();
      });
    });

    it("displays invoice total amount", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInvoice),
      });

      render(<InvoiceDetails invoiceId="inv-001" />);

      await waitFor(() => {
        // Total amount appears in header and footer, so use getAllByText
        const totalAmounts = screen.getAllByText("$125.99");
        expect(totalAmounts.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("displays billing period", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInvoice),
      });

      render(<InvoiceDetails invoiceId="inv-001" />);

      await waitFor(() => {
        expect(screen.getByText(/Dec 1, 2025/)).toBeInTheDocument();
        expect(screen.getByText(/Dec 31, 2025/)).toBeInTheDocument();
      });
    });

    it("displays status badge", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInvoice),
      });

      render(<InvoiceDetails invoiceId="inv-001" />);

      await waitFor(() => {
        expect(screen.getByText("Pending")).toBeInTheDocument();
      });
    });
  });

  describe("line items", () => {
    it("displays all line items", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInvoice),
      });

      render(<InvoiceDetails invoiceId="inv-001" />);

      await waitFor(() => {
        expect(screen.getByText("Monthly Data Plan - 10GB")).toBeInTheDocument();
        expect(screen.getByText("Voice Minutes - 500 min")).toBeInTheDocument();
        expect(screen.getByText("SMS Bundle - 100 messages")).toBeInTheDocument();
        expect(screen.getByText("Taxes and Fees")).toBeInTheDocument();
      });
    });

    it("displays line item totals", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInvoice),
      });

      render(<InvoiceDetails invoiceId="inv-001" />);

      await waitFor(() => {
        // Line item totals appear in unit price and total columns
        expect(screen.getAllByText("$49.99").length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText("$29.99").length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText("$9.99").length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText("$36.02").length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("with provided data (no fetch)", () => {
    it("renders with data prop without fetching", () => {
      render(<InvoiceDetails data={mockInvoice} />);

      expect(screen.getByText("INV-2026-001")).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("error state", () => {
    it("displays error message when API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<InvoiceDetails invoiceId="inv-001" />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load invoice/i)).toBeInTheDocument();
      });
    });

    it("shows retry button on error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<InvoiceDetails invoiceId="inv-001" />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe("download functionality", () => {
    it("shows download PDF button when downloadUrl is available", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInvoice),
      });

      render(<InvoiceDetails invoiceId="inv-001" />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
      });
    });

    it("calls onDownload when download button is clicked", async () => {
      const user = userEvent.setup();
      const handleDownload = vi.fn();
      render(<InvoiceDetails data={mockInvoice} onDownload={handleDownload} />);

      await user.click(screen.getByRole("button", { name: /download pdf/i }));
      expect(handleDownload).toHaveBeenCalledWith(mockInvoice.id);
    });
  });

  describe("actions", () => {
    it("shows Pay Now button for pending invoices", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInvoice),
      });

      render(<InvoiceDetails invoiceId="inv-001" />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument();
      });
    });

    it("does not show Pay Now button for paid invoices", async () => {
      const paidInvoice = { ...mockInvoice, status: "paid" as const };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(paidInvoice),
      });

      render(<InvoiceDetails invoiceId="inv-001" />);

      await waitFor(() => {
        expect(screen.getByText("Paid")).toBeInTheDocument();
      });

      expect(screen.queryByRole("button", { name: /pay now/i })).not.toBeInTheDocument();
    });
  });
});
