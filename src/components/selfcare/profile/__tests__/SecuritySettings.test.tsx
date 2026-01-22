import { render, screen, waitFor, userEvent } from "@/test/test-utils";
import { SecuritySettings } from "../SecuritySettings";
import { MfaSettings } from "@/types/profile";

describe("SecuritySettings", () => {
  const mockMfaSettings: MfaSettings = {
    enabled: false,
    method: "sms",
    phone: "+1234567890",
    email: "test@example.com",
  };

  const mockOnPasswordChange = vi.fn();
  const mockOnMfaToggle = vi.fn();

  beforeEach(() => {
    mockOnPasswordChange.mockReset();
    mockOnMfaToggle.mockReset();
  });

  describe("rendering", () => {
    it("displays security settings heading", () => {
      render(
        <SecuritySettings
          mfaSettings={mockMfaSettings}
          onPasswordChange={mockOnPasswordChange}
          onMfaToggle={mockOnMfaToggle}
        />
      );

      expect(screen.getByText(/security settings/i)).toBeInTheDocument();
    });

    it("displays change password section", () => {
      render(
        <SecuritySettings
          mfaSettings={mockMfaSettings}
          onPasswordChange={mockOnPasswordChange}
          onMfaToggle={mockOnMfaToggle}
        />
      );

      // Look for the heading specifically (subtitle1 element)
      expect(screen.getByRole("heading", { name: /change password/i })).toBeInTheDocument();
    });

    it("displays current password field", () => {
      render(
        <SecuritySettings
          mfaSettings={mockMfaSettings}
          onPasswordChange={mockOnPasswordChange}
          onMfaToggle={mockOnMfaToggle}
        />
      );

      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    });

    it("displays new password field", () => {
      render(
        <SecuritySettings
          mfaSettings={mockMfaSettings}
          onPasswordChange={mockOnPasswordChange}
          onMfaToggle={mockOnMfaToggle}
        />
      );

      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });

    it("displays confirm password field", () => {
      render(
        <SecuritySettings
          mfaSettings={mockMfaSettings}
          onPasswordChange={mockOnPasswordChange}
          onMfaToggle={mockOnMfaToggle}
        />
      );

      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it("displays MFA section", () => {
      render(
        <SecuritySettings
          mfaSettings={mockMfaSettings}
          onPasswordChange={mockOnPasswordChange}
          onMfaToggle={mockOnMfaToggle}
        />
      );

      // Look for the heading specifically (subtitle1 element)
      expect(screen.getByRole("heading", { name: /two-factor authentication/i })).toBeInTheDocument();
    });

    it("displays MFA toggle", () => {
      render(
        <SecuritySettings
          mfaSettings={mockMfaSettings}
          onPasswordChange={mockOnPasswordChange}
          onMfaToggle={mockOnMfaToggle}
        />
      );

      expect(screen.getByLabelText(/enable mfa/i)).toBeInTheDocument();
    });
  });

  describe("password change", () => {
    it("enables change password button when all fields are filled", async () => {
      const user = userEvent.setup();
      render(
        <SecuritySettings
          mfaSettings={mockMfaSettings}
          onPasswordChange={mockOnPasswordChange}
          onMfaToggle={mockOnMfaToggle}
        />
      );

      // Initially the button should be disabled
      expect(screen.getByRole("button", { name: /change password/i })).toBeDisabled();

      // Fill in the password fields
      await user.type(screen.getByLabelText(/current password/i), "OldPassword123");
      await user.type(screen.getByLabelText(/new password/i), "NewPassword123");
      await user.type(screen.getByLabelText(/confirm password/i), "NewPassword123");

      // Now the button should be enabled
      expect(screen.getByRole("button", { name: /change password/i })).not.toBeDisabled();
    });

    it("calls onPasswordChange with password data", async () => {
      const user = userEvent.setup();
      render(
        <SecuritySettings
          mfaSettings={mockMfaSettings}
          onPasswordChange={mockOnPasswordChange}
          onMfaToggle={mockOnMfaToggle}
        />
      );

      await user.type(screen.getByLabelText(/current password/i), "OldPassword123");
      await user.type(screen.getByLabelText(/new password/i), "NewPassword123");
      await user.type(screen.getByLabelText(/confirm password/i), "NewPassword123");

      await user.click(screen.getByRole("button", { name: /change password/i }));

      await waitFor(() => {
        expect(mockOnPasswordChange).toHaveBeenCalledWith({
          currentPassword: "OldPassword123",
          newPassword: "NewPassword123",
          confirmPassword: "NewPassword123",
        });
      });
    });

    it("shows validation error when passwords do not match", async () => {
      const user = userEvent.setup();
      render(
        <SecuritySettings
          mfaSettings={mockMfaSettings}
          onPasswordChange={mockOnPasswordChange}
          onMfaToggle={mockOnMfaToggle}
        />
      );

      await user.type(screen.getByLabelText(/current password/i), "OldPassword123");
      await user.type(screen.getByLabelText(/new password/i), "NewPassword123");
      await user.type(screen.getByLabelText(/confirm password/i), "DifferentPassword123");

      await user.click(screen.getByRole("button", { name: /change password/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
      });

      expect(mockOnPasswordChange).not.toHaveBeenCalled();
    });

    it("shows validation error when new password is too short", async () => {
      const user = userEvent.setup();
      render(
        <SecuritySettings
          mfaSettings={mockMfaSettings}
          onPasswordChange={mockOnPasswordChange}
          onMfaToggle={mockOnMfaToggle}
        />
      );

      await user.type(screen.getByLabelText(/current password/i), "OldPassword123");
      await user.type(screen.getByLabelText(/new password/i), "Short1");
      await user.type(screen.getByLabelText(/confirm password/i), "Short1");

      await user.click(screen.getByRole("button", { name: /change password/i }));

      await waitFor(() => {
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      });

      expect(mockOnPasswordChange).not.toHaveBeenCalled();
    });
  });

  describe("MFA settings", () => {
    it("shows MFA as disabled initially", () => {
      render(
        <SecuritySettings
          mfaSettings={mockMfaSettings}
          onPasswordChange={mockOnPasswordChange}
          onMfaToggle={mockOnMfaToggle}
        />
      );

      const mfaToggle = screen.getByLabelText(/enable mfa/i);
      expect(mfaToggle).not.toBeChecked();
    });

    it("shows MFA as enabled when mfaSettings.enabled is true", () => {
      const enabledMfaSettings = { ...mockMfaSettings, enabled: true };
      render(
        <SecuritySettings
          mfaSettings={enabledMfaSettings}
          onPasswordChange={mockOnPasswordChange}
          onMfaToggle={mockOnMfaToggle}
        />
      );

      const mfaToggle = screen.getByLabelText(/enable mfa/i);
      expect(mfaToggle).toBeChecked();
    });

    it("calls onMfaToggle when MFA toggle is clicked", async () => {
      const user = userEvent.setup();
      render(
        <SecuritySettings
          mfaSettings={mockMfaSettings}
          onPasswordChange={mockOnPasswordChange}
          onMfaToggle={mockOnMfaToggle}
        />
      );

      const mfaToggle = screen.getByLabelText(/enable mfa/i);
      await user.click(mfaToggle);

      await waitFor(() => {
        expect(mockOnMfaToggle).toHaveBeenCalledWith(true);
      });
    });
  });

  describe("loading state", () => {
    it("shows skeleton when loading prop is true", () => {
      render(
        <SecuritySettings
          mfaSettings={mockMfaSettings}
          onPasswordChange={mockOnPasswordChange}
          onMfaToggle={mockOnMfaToggle}
          loading
        />
      );

      expect(screen.getByTestId("security-settings-skeleton")).toBeInTheDocument();
    });
  });
});
