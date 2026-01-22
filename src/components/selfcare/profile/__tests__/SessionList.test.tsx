import { render, screen, waitFor, userEvent } from "@/test/test-utils";
import { SessionList } from "../SessionList";
import { Session } from "@/types/profile";

describe("SessionList", () => {
  const mockSessions: Session[] = [
    {
      id: "session-1",
      device: "MacBook Pro",
      browser: "Chrome 120",
      location: "New York, US",
      ipAddress: "192.168.1.1",
      lastActive: "2026-01-22T10:30:00Z",
      current: true,
    },
    {
      id: "session-2",
      device: "iPhone 15",
      browser: "Safari Mobile",
      location: "Los Angeles, US",
      ipAddress: "10.0.0.5",
      lastActive: "2026-01-21T15:45:00Z",
      current: false,
    },
    {
      id: "session-3",
      device: "Windows PC",
      browser: "Firefox 121",
      location: "Chicago, US",
      ipAddress: "172.16.0.10",
      lastActive: "2026-01-20T09:00:00Z",
      current: false,
    },
  ];

  const mockOnLogout = vi.fn();

  beforeEach(() => {
    mockOnLogout.mockReset();
  });

  describe("rendering", () => {
    it("displays active sessions heading", () => {
      render(<SessionList sessions={mockSessions} onLogout={mockOnLogout} />);

      expect(screen.getByText(/active sessions/i)).toBeInTheDocument();
    });

    it("displays all sessions", () => {
      render(<SessionList sessions={mockSessions} onLogout={mockOnLogout} />);

      expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
      expect(screen.getByText("iPhone 15")).toBeInTheDocument();
      expect(screen.getByText("Windows PC")).toBeInTheDocument();
    });

    it("displays browser information for each session", () => {
      render(<SessionList sessions={mockSessions} onLogout={mockOnLogout} />);

      expect(screen.getByText("Chrome 120")).toBeInTheDocument();
      expect(screen.getByText("Safari Mobile")).toBeInTheDocument();
      expect(screen.getByText("Firefox 121")).toBeInTheDocument();
    });

    it("displays location for each session", () => {
      render(<SessionList sessions={mockSessions} onLogout={mockOnLogout} />);

      expect(screen.getByText("New York, US")).toBeInTheDocument();
      expect(screen.getByText("Los Angeles, US")).toBeInTheDocument();
      expect(screen.getByText("Chicago, US")).toBeInTheDocument();
    });

    it("marks current session with a badge", () => {
      render(<SessionList sessions={mockSessions} onLogout={mockOnLogout} />);

      expect(screen.getByText(/current session/i)).toBeInTheDocument();
    });

    it("displays IP address for each session", () => {
      render(<SessionList sessions={mockSessions} onLogout={mockOnLogout} />);

      expect(screen.getByText("192.168.1.1")).toBeInTheDocument();
      expect(screen.getByText("10.0.0.5")).toBeInTheDocument();
      expect(screen.getByText("172.16.0.10")).toBeInTheDocument();
    });
  });

  describe("logout functionality", () => {
    it("shows logout button for non-current sessions", () => {
      render(<SessionList sessions={mockSessions} onLogout={mockOnLogout} />);

      // Should have 3 buttons: 2 individual logout + 1 logout all
      const logoutButtons = screen.getAllByRole("button", { name: /logout/i });
      expect(logoutButtons).toHaveLength(3);

      // 2 should be individual session logout buttons (icon buttons with aria-label)
      const individualLogoutButtons = screen.getAllByLabelText("logout");
      expect(individualLogoutButtons).toHaveLength(2);
    });

    it("does not show logout button for current session", () => {
      const currentSessionOnly = [mockSessions[0]]; // Only the current session
      render(<SessionList sessions={currentSessionOnly} onLogout={mockOnLogout} />);

      expect(screen.queryByRole("button", { name: /logout/i })).not.toBeInTheDocument();
    });

    it("calls onLogout with session id when logout button is clicked", async () => {
      const user = userEvent.setup();
      render(<SessionList sessions={mockSessions} onLogout={mockOnLogout} />);

      const logoutButtons = screen.getAllByRole("button", { name: /logout/i });
      await user.click(logoutButtons[0]);

      await waitFor(() => {
        expect(mockOnLogout).toHaveBeenCalledWith("session-2");
      });
    });

    it("shows logout all other sessions button when multiple sessions exist", () => {
      render(<SessionList sessions={mockSessions} onLogout={mockOnLogout} />);

      expect(screen.getByRole("button", { name: /logout all other sessions/i })).toBeInTheDocument();
    });

    it("calls onLogout for each non-current session when logout all is clicked", async () => {
      const user = userEvent.setup();
      render(<SessionList sessions={mockSessions} onLogout={mockOnLogout} />);

      const logoutAllButton = screen.getByRole("button", { name: /logout all other sessions/i });
      await user.click(logoutAllButton);

      await waitFor(() => {
        expect(mockOnLogout).toHaveBeenCalledWith("session-2");
        expect(mockOnLogout).toHaveBeenCalledWith("session-3");
        expect(mockOnLogout).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("empty state", () => {
    it("shows no other sessions message when only current session exists", () => {
      const currentSessionOnly = [mockSessions[0]];
      render(<SessionList sessions={currentSessionOnly} onLogout={mockOnLogout} />);

      expect(screen.getByText(/this is your only active session/i)).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("shows skeleton when loading prop is true", () => {
      render(<SessionList sessions={mockSessions} onLogout={mockOnLogout} loading />);

      expect(screen.getByTestId("session-list-skeleton")).toBeInTheDocument();
    });
  });

  describe("formatted timestamps", () => {
    it("displays last active time in a human-readable format", () => {
      render(<SessionList sessions={mockSessions} onLogout={mockOnLogout} />);

      // Check that dates are formatted (exact format may vary)
      expect(screen.getByText(/jan 22/i)).toBeInTheDocument();
      expect(screen.getByText(/jan 21/i)).toBeInTheDocument();
    });
  });
});
