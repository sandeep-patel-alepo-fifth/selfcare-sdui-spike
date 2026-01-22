import { render, screen, userEvent } from "@/test/test-utils";
import { UsageFilters } from "../UsageFilters";
import { UsageFilters as UsageFiltersType } from "@/types/usage";

describe("UsageFilters", () => {
  const mockOnFilterChange = vi.fn();

  const defaultFilters: UsageFiltersType = {
    type: undefined,
    startDate: undefined,
    endDate: undefined,
  };

  beforeEach(() => {
    mockOnFilterChange.mockReset();
  });

  describe("usage type filter", () => {
    it("renders usage type select", () => {
      render(<UsageFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByLabelText(/usage type/i)).toBeInTheDocument();
    });

    it("shows all type options", async () => {
      const user = userEvent.setup();
      render(<UsageFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);

      const select = screen.getByLabelText(/usage type/i);
      await user.click(select);

      expect(screen.getByRole("option", { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /data/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /voice/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /sms/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /roaming/i })).toBeInTheDocument();
    });

    it("calls onFilterChange when type is selected", async () => {
      const user = userEvent.setup();
      render(<UsageFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);

      const select = screen.getByLabelText(/usage type/i);
      await user.click(select);
      await user.click(screen.getByRole("option", { name: /data/i }));

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ type: "data" })
      );
    });
  });

  describe("date range filter", () => {
    it("renders start date input", () => {
      render(<UsageFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    });

    it("renders end date input", () => {
      render(<UsageFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    });

    it("calls onFilterChange when start date changes", async () => {
      const user = userEvent.setup();
      render(<UsageFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.clear(startDateInput);
      await user.type(startDateInput, "2026-01-01");

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ startDate: "2026-01-01" })
      );
    });

    it("calls onFilterChange when end date changes", async () => {
      const user = userEvent.setup();
      render(<UsageFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);

      const endDateInput = screen.getByLabelText(/end date/i);
      await user.clear(endDateInput);
      await user.type(endDateInput, "2026-01-31");

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ endDate: "2026-01-31" })
      );
    });
  });

  describe("clear filters", () => {
    it("renders clear button when filters are active", () => {
      const activeFilters: UsageFiltersType = {
        type: "data",
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      };
      render(<UsageFilters filters={activeFilters} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });

    it("calls onFilterChange with empty filters when clear is clicked", async () => {
      const user = userEvent.setup();
      const activeFilters: UsageFiltersType = {
        type: "data",
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      };
      render(<UsageFilters filters={activeFilters} onFilterChange={mockOnFilterChange} />);

      await user.click(screen.getByRole("button", { name: /clear/i }));

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        type: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });
  });

  describe("filter display", () => {
    it("displays current filter values", () => {
      const activeFilters: UsageFiltersType = {
        type: "voice",
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      };
      render(<UsageFilters filters={activeFilters} onFilterChange={mockOnFilterChange} />);

      // The type select should show the current value
      expect(screen.getByDisplayValue("2026-01-01")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2026-01-31")).toBeInTheDocument();
    });
  });
});
