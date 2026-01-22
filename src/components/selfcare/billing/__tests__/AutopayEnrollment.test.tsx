import { render, screen, userEvent, waitFor } from "@/test/test-utils";
import { AutopayEnrollment } from "../AutopayEnrollment";
import { SavedPaymentMethod } from "@/types/billing";

describe("AutopayEnrollment", () => {
  const mockPaymentMethods: SavedPaymentMethod[] = [
    {
      id: "pm-001",
      type: "card",
      last4: "4242",
      label: "Visa ending in 4242",
      expiryMonth: 12,
      expiryYear: 2027,
      isDefault: true,
    },
    {
      id: "pm-002",
      type: "card",
      last4: "5555",
      label: "Mastercard ending in 5555",
      expiryMonth: 6,
      expiryYear: 2026,
      isDefault: false,
    },
    {
      id: "pm-003",
      type: "bank",
      last4: "9876",
      label: "Bank of America",
      isDefault: false,
    },
  ];

  describe("rendering", () => {
    it("displays enrollment form title", () => {
      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={() => {}}
        />
      );

      expect(
        screen.getByRole("heading", { name: /enroll in autopay/i })
      ).toBeInTheDocument();
    });

    it("shows payment method selector", () => {
      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={() => {}}
        />
      );

      expect(screen.getByLabelText(/payment method/i)).toBeInTheDocument();
    });

    it("shows schedule type selector", () => {
      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={() => {}}
        />
      );

      expect(screen.getByLabelText(/schedule type/i)).toBeInTheDocument();
    });

    it("shows enroll button", () => {
      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={() => {}}
        />
      );

      expect(
        screen.getByRole("button", { name: /enroll/i })
      ).toBeInTheDocument();
    });

    it("shows cancel button when onCancel is provided", () => {
      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={() => {}}
          onCancel={() => {}}
        />
      );

      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
    });
  });

  describe("schedule type selection", () => {
    it("shows day of month field when day_of_month is selected", async () => {
      const user = userEvent.setup();
      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={() => {}}
        />
      );

      // Click on schedule type dropdown
      await user.click(screen.getByLabelText(/schedule type/i));
      await user.click(screen.getByRole("option", { name: /specific day/i }));

      expect(screen.getByRole("spinbutton", { name: /day of month/i })).toBeInTheDocument();
    });

    it("shows threshold field when threshold is selected", async () => {
      const user = userEvent.setup();
      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={() => {}}
        />
      );

      await user.click(screen.getByLabelText(/schedule type/i));
      await user.click(screen.getByRole("option", { name: /balance threshold/i }));

      expect(screen.getByLabelText(/threshold amount/i)).toBeInTheDocument();
    });

    it("hides day of month when due_date is selected", async () => {
      const user = userEvent.setup();
      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={() => {}}
        />
      );

      await user.click(screen.getByLabelText(/schedule type/i));
      await user.click(screen.getByRole("option", { name: /on due date/i }));

      expect(screen.queryByLabelText(/day of month/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/threshold amount/i)).not.toBeInTheDocument();
    });
  });

  describe("form validation", () => {
    it("requires payment method selection", async () => {
      const user = userEvent.setup();
      const handleEnroll = vi.fn();

      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={handleEnroll}
        />
      );

      // Try to submit without selecting payment method
      await user.click(screen.getByRole("button", { name: /enroll/i }));

      expect(handleEnroll).not.toHaveBeenCalled();
      expect(screen.getByText(/payment method is required/i)).toBeInTheDocument();
    });

    it("requires day of month when schedule type is day_of_month", async () => {
      const user = userEvent.setup();
      const handleEnroll = vi.fn();

      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={handleEnroll}
        />
      );

      // Select payment method
      await user.click(screen.getByLabelText(/payment method/i));
      await user.click(screen.getByRole("option", { name: /visa ending in 4242/i }));

      // Select day_of_month schedule
      await user.click(screen.getByLabelText(/schedule type/i));
      await user.click(screen.getByRole("option", { name: /specific day/i }));

      // Try to submit without day
      await user.click(screen.getByRole("button", { name: /enroll/i }));

      expect(handleEnroll).not.toHaveBeenCalled();
      expect(screen.getByText(/day of month is required/i)).toBeInTheDocument();
    });

    it("shows helper text about day range for day_of_month schedule", async () => {
      const user = userEvent.setup();

      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={() => {}}
        />
      );

      // Select day_of_month schedule
      await user.click(screen.getByLabelText(/schedule type/i));
      await user.click(screen.getByRole("option", { name: /specific day/i }));

      // Verify helper text is shown to guide the user
      expect(screen.getByText(/Choose 1-28 to avoid month-end issues/i)).toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    it("calls onEnroll with correct data for day_of_month schedule", async () => {
      const user = userEvent.setup();
      const handleEnroll = vi.fn();

      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={handleEnroll}
        />
      );

      // Select payment method
      await user.click(screen.getByLabelText(/payment method/i));
      await user.click(screen.getByRole("option", { name: /visa ending in 4242/i }));

      // Select day_of_month schedule
      await user.click(screen.getByLabelText(/schedule type/i));
      await user.click(screen.getByRole("option", { name: /specific day/i }));

      // Enter day
      const dayInput = screen.getByRole("spinbutton", { name: /day of month/i });
      await user.clear(dayInput);
      await user.type(dayInput, "15");

      // Submit
      await user.click(screen.getByRole("button", { name: /enroll/i }));

      await waitFor(() => {
        expect(handleEnroll).toHaveBeenCalledWith({
          paymentMethodId: "pm-001",
          scheduleType: "day_of_month",
          dayOfMonth: 15,
        });
      });
    });

    it("calls onEnroll with correct data for due_date schedule", async () => {
      const user = userEvent.setup();
      const handleEnroll = vi.fn();

      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={handleEnroll}
        />
      );

      // Select payment method
      await user.click(screen.getByLabelText(/payment method/i));
      await user.click(screen.getByRole("option", { name: /visa ending in 4242/i }));

      // Select due_date schedule
      await user.click(screen.getByLabelText(/schedule type/i));
      await user.click(screen.getByRole("option", { name: /on due date/i }));

      // Submit
      await user.click(screen.getByRole("button", { name: /enroll/i }));

      await waitFor(() => {
        expect(handleEnroll).toHaveBeenCalledWith({
          paymentMethodId: "pm-001",
          scheduleType: "due_date",
        });
      });
    });

    it("calls onEnroll with correct data for threshold schedule", async () => {
      const user = userEvent.setup();
      const handleEnroll = vi.fn();

      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={handleEnroll}
        />
      );

      // Select payment method
      await user.click(screen.getByLabelText(/payment method/i));
      await user.click(screen.getByRole("option", { name: /visa ending in 4242/i }));

      // Select threshold schedule
      await user.click(screen.getByLabelText(/schedule type/i));
      await user.click(screen.getByRole("option", { name: /balance threshold/i }));

      // Enter threshold
      const thresholdInput = screen.getByLabelText(/threshold amount/i);
      await user.clear(thresholdInput);
      await user.type(thresholdInput, "100");

      // Submit
      await user.click(screen.getByRole("button", { name: /enroll/i }));

      await waitFor(() => {
        expect(handleEnroll).toHaveBeenCalledWith({
          paymentMethodId: "pm-001",
          scheduleType: "threshold",
          thresholdAmount: 100,
        });
      });
    });

    it("includes max payment amount when provided", async () => {
      const user = userEvent.setup();
      const handleEnroll = vi.fn();

      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={handleEnroll}
        />
      );

      // Select payment method
      await user.click(screen.getByLabelText(/payment method/i));
      await user.click(screen.getByRole("option", { name: /visa ending in 4242/i }));

      // Select due_date schedule
      await user.click(screen.getByLabelText(/schedule type/i));
      await user.click(screen.getByRole("option", { name: /on due date/i }));

      // Enter max amount
      const maxInput = screen.getByLabelText(/maximum payment/i);
      await user.clear(maxInput);
      await user.type(maxInput, "500");

      // Submit
      await user.click(screen.getByRole("button", { name: /enroll/i }));

      await waitFor(() => {
        expect(handleEnroll).toHaveBeenCalledWith({
          paymentMethodId: "pm-001",
          scheduleType: "due_date",
          maxPaymentAmount: 500,
        });
      });
    });
  });

  describe("loading state", () => {
    it("disables form and shows loading indicator when submitting", () => {
      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={() => {}}
          submitting
        />
      );

      expect(screen.getByRole("button", { name: /enrolling/i })).toBeDisabled();
    });
  });

  describe("error handling", () => {
    it("displays error message when provided", () => {
      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={() => {}}
          error="Failed to enroll in autopay"
        />
      );

      expect(screen.getByText(/failed to enroll in autopay/i)).toBeInTheDocument();
    });
  });

  describe("cancel action", () => {
    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      const handleCancel = vi.fn();

      render(
        <AutopayEnrollment
          paymentMethods={mockPaymentMethods}
          onEnroll={() => {}}
          onCancel={handleCancel}
        />
      );

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(handleCancel).toHaveBeenCalled();
    });
  });
});
