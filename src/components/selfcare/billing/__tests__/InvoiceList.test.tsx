import { render, screen, waitFor, userEvent, within } from "@/test/test-utils";
import { InvoiceList } from "../InvoiceList";
import { InvoiceSummary } from "@/types/billing";

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("InvoiceList", () => {
  const mockInvoices: InvoiceSummary[] = [
    {
      id: "inv-001",
      invoiceNumber: "INV-2026-001",
      date: "2026-01-01",
      dueDate: "2026-01-15",
      amount: 125.99,
      currency: "USD",
      status: "pending",
    },
    {
      id: "inv-002",
      invoiceNumber: "INV-2026-002",
      date: "2025-12-01",
      dueDate: "2025-12-15",
      amount: 89.5,
      currency: "USD",
      status: "paid",
    },
    {
      id: "inv-003",
      invoiceNumber: "INV-2026-003",
      date: "2025-11-01",
      dueDate: "2025-11-15",
      amount: 150.0,
      currency: "USD",
      status: "overdue",
    },
  ];

  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("loading state", () => {
    it("shows skeleton loader while fetching data", () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      render(<InvoiceList />);
      expect(screen.getByTestId("invoice-list-skeleton")).toBeInTheDocument();
    });
  });

  describe("rendering with data", () => {
    it("displays list of invoices from API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            invoices: mockInvoices,
            total: 3,
            page: 1,
            limit: 10,
            hasMore: false,
          }),
      });

      render(<InvoiceList />);

      await waitFor(() => {
        expect(screen.getByText("INV-2026-001")).toBeInTheDocument();
        expect(screen.getByText("INV-2026-002")).toBeInTheDocument();
        expect(screen.getByText("INV-2026-003")).toBeInTheDocument();
      });
    });

    it("displays invoice amounts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            invoices: mockInvoices,
            total: 3,
            page: 1,
            limit: 10,
            hasMore: false,
          }),
      });

      render(<InvoiceList />);

      await waitFor(() => {
        expect(screen.getByText("$125.99")).toBeInTheDocument();
        expect(screen.getByText("$89.50")).toBeInTheDocument();
        expect(screen.getByText("$150.00")).toBeInTheDocument();
      });
    });

    it("displays status badges for each invoice", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            invoices: mockInvoices,
            total: 3,
            page: 1,
            limit: 10,
            hasMore: false,
          }),
      });

      render(<InvoiceList />);

      await waitFor(() => {
        expect(screen.getByText("Pending")).toBeInTheDocument();
        expect(screen.getByText("Paid")).toBeInTheDocument();
        expect(screen.getByText("Overdue")).toBeInTheDocument();
      });
    });
  });

  describe("with provided data (no fetch)", () => {
    it("renders with data prop without fetching", () => {
      render(<InvoiceList data={mockInvoices} />);

      expect(screen.getByText("INV-2026-001")).toBeInTheDocument();
      expect(screen.getByText("INV-2026-002")).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("empty state", () => {
    it("displays empty message when no invoices exist", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            invoices: [],
            total: 0,
            page: 1,
            limit: 10,
            hasMore: false,
          }),
      });

      render(<InvoiceList />);

      await waitFor(() => {
        expect(screen.getByText(/no invoices found/i)).toBeInTheDocument();
      });
    });
  });

  describe("error state", () => {
    it("displays error message when API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<InvoiceList />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load invoices/i)).toBeInTheDocument();
      });
    });

    it("shows retry button on error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<InvoiceList />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe("filtering", () => {
    it("displays status filter dropdown", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            invoices: mockInvoices,
            total: 3,
            page: 1,
            limit: 10,
            hasMore: false,
          }),
      });

      render(<InvoiceList />);

      await waitFor(() => {
        expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      });
    });

    it("filters invoices by status when filter is selected", async () => {
      const user = userEvent.setup();
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              invoices: mockInvoices,
              total: 3,
              page: 1,
              limit: 10,
              hasMore: false,
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              invoices: [mockInvoices[1]], // Only paid invoice
              total: 1,
              page: 1,
              limit: 10,
              hasMore: false,
            }),
        });

      render(<InvoiceList />);

      await waitFor(() => {
        expect(screen.getByText("INV-2026-001")).toBeInTheDocument();
      });

      // Select 'Paid' from the status filter
      const statusFilter = screen.getByLabelText(/status/i);
      await user.click(statusFilter);
      await user.click(screen.getByRole("option", { name: "Paid" }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("status=paid")
        );
      });
    });
  });

  describe("interactions", () => {
    it("calls onInvoiceClick when an invoice is clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<InvoiceList data={mockInvoices} onInvoiceClick={handleClick} />);

      const firstInvoiceRow = screen.getByText("INV-2026-001").closest("tr");
      await user.click(firstInvoiceRow!);

      expect(handleClick).toHaveBeenCalledWith(mockInvoices[0]);
    });
  });
});
