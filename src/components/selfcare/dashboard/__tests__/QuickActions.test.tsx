import { render, screen, waitFor } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import { QuickActions } from "../QuickActions";
import { QuickAction } from "@/types/dashboard";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("QuickActions", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  const mockActions: QuickAction[] = [
    { id: "1", label: "Pay Bill", icon: "payment", primary: true },
    { id: "2", label: "Buy Data", icon: "data_usage" },
    { id: "3", label: "View Usage", icon: "trending_up", href: "/usage" },
    { id: "4", label: "Support", icon: "support", disabled: true },
  ];

  describe("loading state", () => {
    it("shows skeleton loader while fetching data", () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));
      render(<QuickActions />);
      expect(screen.getByTestId("quick-actions-skeleton")).toBeInTheDocument();
    });
  });

  describe("with data", () => {
    it("displays Quick Actions heading", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActions),
      });

      render(<QuickActions />);

      await waitFor(() => {
        expect(screen.getByText("Quick Actions")).toBeInTheDocument();
      });
    });

    it("renders all action buttons", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActions),
      });

      render(<QuickActions />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /pay bill/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /buy data/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /view usage/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /support/i })).toBeInTheDocument();
      });
    });

    it("renders primary action with contained variant", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActions),
      });

      render(<QuickActions />);

      await waitFor(() => {
        const payBillButton = screen.getByRole("button", { name: /pay bill/i });
        expect(payBillButton).toHaveClass("MuiButton-contained");
      });
    });

    it("renders non-primary actions with outlined variant", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActions),
      });

      render(<QuickActions />);

      await waitFor(() => {
        const buyDataButton = screen.getByRole("button", { name: /buy data/i });
        expect(buyDataButton).toHaveClass("MuiButton-outlined");
      });
    });

    it("disables buttons marked as disabled", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActions),
      });

      render(<QuickActions />);

      await waitFor(() => {
        const supportButton = screen.getByRole("button", { name: /support/i });
        expect(supportButton).toBeDisabled();
      });
    });

    it("calls onAction callback when action button is clicked", async () => {
      const user = userEvent.setup();
      const onAction = vi.fn();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActions),
      });

      render(<QuickActions onAction={onAction} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /pay bill/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /pay bill/i }));
      expect(onAction).toHaveBeenCalledWith(mockActions[0]);
    });
  });

  describe("error state", () => {
    it("displays error message when API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<QuickActions />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load actions/i)).toBeInTheDocument();
      });
    });

    it("shows retry button on error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<QuickActions />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe("with provided actions prop", () => {
    it("renders with actions prop without fetching", () => {
      render(<QuickActions actions={mockActions} />);

      expect(screen.getByText("Quick Actions")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /pay bill/i })).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("responsive layout", () => {
    it("renders actions in a flex container", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockActions),
      });

      render(<QuickActions />);

      await waitFor(() => {
        const container = screen.getByTestId("quick-actions-container");
        expect(container).toBeInTheDocument();
      });
    });
  });
});
