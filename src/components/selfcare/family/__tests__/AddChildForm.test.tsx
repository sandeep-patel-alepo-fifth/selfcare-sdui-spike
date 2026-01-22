import { render, screen, userEvent, waitFor } from "@/test/test-utils";
import { AddChildForm } from "../AddChildForm";

describe("AddChildForm", () => {
  describe("rendering", () => {
    it("renders the form title", () => {
      render(<AddChildForm onSubmit={vi.fn()} />);
      expect(screen.getByText(/add child account/i)).toBeInTheDocument();
    });

    it("renders phone number input field", () => {
      render(<AddChildForm onSubmit={vi.fn()} />);
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    });

    it("renders nickname input field", () => {
      render(<AddChildForm onSubmit={vi.fn()} />);
      expect(screen.getByLabelText(/nickname/i)).toBeInTheDocument();
    });

    it("renders submit button", () => {
      render(<AddChildForm onSubmit={vi.fn()} />);
      expect(screen.getByRole("button", { name: /add child/i })).toBeInTheDocument();
    });
  });

  describe("parental controls options", () => {
    it("renders content filtering checkbox", () => {
      render(<AddChildForm onSubmit={vi.fn()} />);
      expect(screen.getByLabelText(/content filtering/i)).toBeInTheDocument();
    });

    it("renders purchase blocking checkbox", () => {
      render(<AddChildForm onSubmit={vi.fn()} />);
      expect(screen.getByLabelText(/block purchases/i)).toBeInTheDocument();
    });

    it("renders data limit input", () => {
      render(<AddChildForm onSubmit={vi.fn()} />);
      expect(screen.getByLabelText(/data limit/i)).toBeInTheDocument();
    });
  });

  describe("form validation", () => {
    it("shows error when phone number is empty", async () => {
      const user = userEvent.setup();
      render(<AddChildForm onSubmit={vi.fn()} />);

      await user.click(screen.getByRole("button", { name: /add child/i }));
      expect(await screen.findByText(/phone number is required/i)).toBeInTheDocument();
    });

    it("shows error when phone number is invalid", async () => {
      const user = userEvent.setup();
      render(<AddChildForm onSubmit={vi.fn()} />);

      await user.type(screen.getByLabelText(/phone number/i), "123");
      await user.click(screen.getByRole("button", { name: /add child/i }));
      expect(await screen.findByText(/valid phone number/i)).toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    it("calls onSubmit with phone number when valid", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<AddChildForm onSubmit={handleSubmit} />);

      await user.type(screen.getByLabelText(/phone number/i), "5551234567");
      await user.click(screen.getByRole("button", { name: /add child/i }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            phoneNumber: "5551234567",
          })
        );
      });
    });

    it("includes nickname in submission when provided", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<AddChildForm onSubmit={handleSubmit} />);

      await user.type(screen.getByLabelText(/phone number/i), "5551234567");
      await user.type(screen.getByLabelText(/nickname/i), "Johnny");
      await user.click(screen.getByRole("button", { name: /add child/i }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            phoneNumber: "5551234567",
            nickname: "Johnny",
          })
        );
      });
    });

    it("includes parental controls in submission when enabled", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<AddChildForm onSubmit={handleSubmit} />);

      await user.type(screen.getByLabelText(/phone number/i), "5551234567");
      await user.click(screen.getByLabelText(/content filtering/i));
      await user.click(screen.getByLabelText(/block purchases/i));
      await user.click(screen.getByRole("button", { name: /add child/i }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            phoneNumber: "5551234567",
            controls: expect.objectContaining({
              contentFiltering: true,
              purchaseBlocked: true,
            }),
          })
        );
      });
    });
  });

  describe("loading state", () => {
    it("disables submit button when submitting", () => {
      render(<AddChildForm onSubmit={vi.fn()} submitting />);
      expect(screen.getByRole("button", { name: /adding/i })).toBeDisabled();
    });

    it("shows loading indicator when submitting", () => {
      render(<AddChildForm onSubmit={vi.fn()} submitting />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("displays error message when provided", () => {
      render(
        <AddChildForm
          onSubmit={vi.fn()}
          error="This phone number is already linked"
        />
      );
      expect(screen.getByText(/already linked/i)).toBeInTheDocument();
    });
  });

  describe("cancel action", () => {
    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      const handleCancel = vi.fn();
      render(<AddChildForm onSubmit={vi.fn()} onCancel={handleCancel} />);

      await user.click(screen.getByRole("button", { name: /cancel/i }));
      expect(handleCancel).toHaveBeenCalled();
    });
  });
});
