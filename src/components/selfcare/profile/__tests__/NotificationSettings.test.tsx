import { render, screen, waitFor, userEvent } from "@/test/test-utils";
import { NotificationSettings } from "../NotificationSettings";
import { UserPreferences } from "@/types/profile";

describe("NotificationSettings", () => {
  const mockPreferences: UserPreferences = {
    language: "en",
    theme: "auto",
    notifications: {
      email: true,
      sms: true,
      push: false,
    },
  };

  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockReset();
  });

  describe("rendering", () => {
    it("displays notification settings heading", () => {
      render(<NotificationSettings preferences={mockPreferences} onChange={mockOnChange} />);

      expect(screen.getByText(/notification preferences/i)).toBeInTheDocument();
    });

    it("displays email toggle", () => {
      render(<NotificationSettings preferences={mockPreferences} onChange={mockOnChange} />);

      expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument();
    });

    it("displays SMS toggle", () => {
      render(<NotificationSettings preferences={mockPreferences} onChange={mockOnChange} />);

      expect(screen.getByLabelText(/sms notifications/i)).toBeInTheDocument();
    });

    it("displays push toggle", () => {
      render(<NotificationSettings preferences={mockPreferences} onChange={mockOnChange} />);

      expect(screen.getByLabelText(/push notifications/i)).toBeInTheDocument();
    });

    it("shows correct initial toggle states", () => {
      render(<NotificationSettings preferences={mockPreferences} onChange={mockOnChange} />);

      const emailToggle = screen.getByLabelText(/email notifications/i);
      const smsToggle = screen.getByLabelText(/sms notifications/i);
      const pushToggle = screen.getByLabelText(/push notifications/i);

      expect(emailToggle).toBeChecked();
      expect(smsToggle).toBeChecked();
      expect(pushToggle).not.toBeChecked();
    });

    it("displays language selector", () => {
      render(<NotificationSettings preferences={mockPreferences} onChange={mockOnChange} />);

      expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    });

    it("displays theme selector", () => {
      render(<NotificationSettings preferences={mockPreferences} onChange={mockOnChange} />);

      expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    });
  });

  describe("toggle interactions", () => {
    it("calls onChange when email toggle is clicked", async () => {
      const user = userEvent.setup();
      render(<NotificationSettings preferences={mockPreferences} onChange={mockOnChange} />);

      const emailToggle = screen.getByLabelText(/email notifications/i);
      await user.click(emailToggle);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            notifications: expect.objectContaining({
              email: false,
            }),
          })
        );
      });
    });

    it("calls onChange when SMS toggle is clicked", async () => {
      const user = userEvent.setup();
      render(<NotificationSettings preferences={mockPreferences} onChange={mockOnChange} />);

      const smsToggle = screen.getByLabelText(/sms notifications/i);
      await user.click(smsToggle);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            notifications: expect.objectContaining({
              sms: false,
            }),
          })
        );
      });
    });

    it("calls onChange when push toggle is clicked", async () => {
      const user = userEvent.setup();
      render(<NotificationSettings preferences={mockPreferences} onChange={mockOnChange} />);

      const pushToggle = screen.getByLabelText(/push notifications/i);
      await user.click(pushToggle);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            notifications: expect.objectContaining({
              push: true,
            }),
          })
        );
      });
    });
  });

  describe("theme selection", () => {
    it("shows light, dark, and auto theme options", async () => {
      const user = userEvent.setup();
      render(<NotificationSettings preferences={mockPreferences} onChange={mockOnChange} />);

      const themeSelect = screen.getByLabelText(/theme/i);
      await user.click(themeSelect);

      await waitFor(() => {
        expect(screen.getByRole("option", { name: /light/i })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: /dark/i })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: /auto/i })).toBeInTheDocument();
      });
    });

    it("calls onChange when theme is changed", async () => {
      const user = userEvent.setup();
      render(<NotificationSettings preferences={mockPreferences} onChange={mockOnChange} />);

      const themeSelect = screen.getByLabelText(/theme/i);
      await user.click(themeSelect);

      await waitFor(() => {
        expect(screen.getByRole("option", { name: /dark/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("option", { name: /dark/i }));

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            theme: "dark",
          })
        );
      });
    });
  });

  describe("language selection", () => {
    it("shows English and other language options", async () => {
      const user = userEvent.setup();
      render(<NotificationSettings preferences={mockPreferences} onChange={mockOnChange} />);

      const languageSelect = screen.getByLabelText(/language/i);
      await user.click(languageSelect);

      await waitFor(() => {
        expect(screen.getByRole("option", { name: /english/i })).toBeInTheDocument();
      });
    });

    it("calls onChange when language is changed", async () => {
      const user = userEvent.setup();
      render(<NotificationSettings preferences={mockPreferences} onChange={mockOnChange} />);

      const languageSelect = screen.getByLabelText(/language/i);
      await user.click(languageSelect);

      await waitFor(() => {
        expect(screen.getByRole("option", { name: /spanish/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("option", { name: /spanish/i }));

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            language: "es",
          })
        );
      });
    });
  });

  describe("loading state", () => {
    it("shows skeleton when loading prop is true", () => {
      render(<NotificationSettings preferences={mockPreferences} onChange={mockOnChange} loading />);

      expect(screen.getByTestId("notification-settings-skeleton")).toBeInTheDocument();
    });

    it("disables toggles when saving", () => {
      render(<NotificationSettings preferences={mockPreferences} onChange={mockOnChange} saving />);

      const emailToggle = screen.getByLabelText(/email notifications/i);
      expect(emailToggle).toBeDisabled();
    });
  });
});
