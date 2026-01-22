import { render, screen, waitFor, userEvent } from "@/test/test-utils";
import { ProfileForm } from "../ProfileForm";
import { Profile } from "@/types/profile";

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("ProfileForm", () => {
  const mockProfile: Profile = {
    id: "user-123",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
    },
    avatarUrl: null,
  };

  const mockOnSave = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    mockOnSave.mockReset();
  });

  describe("rendering", () => {
    it("displays profile information in form fields", () => {
      render(<ProfileForm profile={mockProfile} onSave={mockOnSave} />);

      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("john.doe@example.com")).toBeInTheDocument();
      expect(screen.getByDisplayValue("+1234567890")).toBeInTheDocument();
    });

    it("displays address fields when address is provided", () => {
      render(<ProfileForm profile={mockProfile} onSave={mockOnSave} />);

      expect(screen.getByDisplayValue("123 Main St")).toBeInTheDocument();
      expect(screen.getByDisplayValue("New York")).toBeInTheDocument();
      expect(screen.getByDisplayValue("NY")).toBeInTheDocument();
      expect(screen.getByDisplayValue("10001")).toBeInTheDocument();
    });

    it("shows phone field as disabled (read-only)", () => {
      render(<ProfileForm profile={mockProfile} onSave={mockOnSave} />);

      const phoneInput = screen.getByDisplayValue("+1234567890");
      expect(phoneInput).toBeDisabled();
    });

    it("shows Save Changes button", () => {
      render(<ProfileForm profile={mockProfile} onSave={mockOnSave} />);

      expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    });

    it("shows profile avatar placeholder", () => {
      render(<ProfileForm profile={mockProfile} onSave={mockOnSave} />);

      expect(screen.getByTestId("profile-avatar")).toBeInTheDocument();
    });
  });

  describe("form editing", () => {
    it("allows editing first name", async () => {
      const user = userEvent.setup();
      render(<ProfileForm profile={mockProfile} onSave={mockOnSave} />);

      const firstNameInput = screen.getByDisplayValue("John");
      await user.clear(firstNameInput);
      await user.type(firstNameInput, "Jane");

      expect(screen.getByDisplayValue("Jane")).toBeInTheDocument();
    });

    it("allows editing email", async () => {
      const user = userEvent.setup();
      render(<ProfileForm profile={mockProfile} onSave={mockOnSave} />);

      const emailInput = screen.getByDisplayValue("john.doe@example.com");
      await user.clear(emailInput);
      await user.type(emailInput, "jane.doe@example.com");

      expect(screen.getByDisplayValue("jane.doe@example.com")).toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    it("calls onSave with updated profile when form is submitted", async () => {
      const user = userEvent.setup();
      render(<ProfileForm profile={mockProfile} onSave={mockOnSave} />);

      const firstNameInput = screen.getByDisplayValue("John");
      await user.clear(firstNameInput);
      await user.type(firstNameInput, "Jane");

      const saveButton = screen.getByRole("button", { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: "Jane",
            lastName: "Doe",
          })
        );
      });
    });

    it("shows loading state while saving", async () => {
      const user = userEvent.setup();
      // Make onSave return a promise that we can control
      mockOnSave.mockImplementation(() => new Promise(() => {}));

      render(<ProfileForm profile={mockProfile} onSave={mockOnSave} />);

      const saveButton = screen.getByRole("button", { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /saving/i })).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    it("shows validation error for empty first name", async () => {
      // Use profile with empty first name to trigger validation
      const profileWithEmptyFirstName = {
        ...mockProfile,
        firstName: "",
      };
      render(<ProfileForm profile={profileWithEmptyFirstName} onSave={mockOnSave} />);

      const user = userEvent.setup();
      const saveButton = screen.getByRole("button", { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        // Zod returns "First name is required" for min(1) validation
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });

      // Verify onSave was not called
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("shows validation error for invalid email format", async () => {
      // Use profile with invalid email to trigger validation
      const profileWithInvalidEmail = {
        ...mockProfile,
        email: "invalid-email",
      };
      const { container } = render(<ProfileForm profile={profileWithInvalidEmail} onSave={mockOnSave} />);

      // Verify the email value is displayed
      expect(screen.getByDisplayValue("invalid-email")).toBeInTheDocument();

      // Submit the form
      const form = container.querySelector("form");
      expect(form).not.toBeNull();

      const user = userEvent.setup();
      const saveButton = screen.getByRole("button", { name: /save changes/i });
      await user.click(saveButton);

      // Wait for the error to appear
      await waitFor(
        () => {
          // Zod returns "Invalid email address" for .email() validation
          expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify onSave was not called
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("does not call onSave when validation fails", async () => {
      const user = userEvent.setup();
      const profileWithEmptyLastName = {
        ...mockProfile,
        lastName: "",
      };
      render(<ProfileForm profile={profileWithEmptyLastName} onSave={mockOnSave} />);

      const saveButton = screen.getByRole("button", { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("shows skeleton when loading prop is true", () => {
      render(<ProfileForm profile={mockProfile} onSave={mockOnSave} loading />);

      expect(screen.getByTestId("profile-form-skeleton")).toBeInTheDocument();
    });
  });
});
