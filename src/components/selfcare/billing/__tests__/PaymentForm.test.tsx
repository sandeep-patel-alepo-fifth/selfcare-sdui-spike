import { render, screen, userEvent, waitFor } from "@/test/test-utils";
import { PaymentForm } from "../PaymentForm";
import { SavedPaymentMethod } from "@/types/billing";

describe("PaymentForm", () => {
  const mockSavedMethods: SavedPaymentMethod[] = [
    {
      id: "pm-001",
      type: "card",
      last4: "4242",
      label: "Visa ending in 4242",
      expiryMonth: 12,
      expiryYear: 2027,
      isDefault: true,
    },
  ];

  describe("rendering", () => {
    it("displays amount input field", () => {
      render(<PaymentForm onSubmit={() => {}} />);

      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    });

    it("displays payment method selector", () => {
      render(<PaymentForm onSubmit={() => {}} />);

      expect(screen.getByLabelText(/Credit\/Debit Card/i)).toBeInTheDocument();
    });

    it("displays submit button", () => {
      render(<PaymentForm onSubmit={() => {}} />);

      expect(screen.getByRole("button", { name: /pay/i })).toBeInTheDocument();
    });

    it("shows saved payment methods when provided", () => {
      render(<PaymentForm onSubmit={() => {}} savedMethods={mockSavedMethods} />);

      expect(screen.getByText(/Visa ending in 4242/)).toBeInTheDocument();
    });
  });

  describe("card details", () => {
    it("shows card number field when card method is selected", () => {
      render(<PaymentForm onSubmit={() => {}} />);

      expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
    });

    it("shows expiry field when card method is selected", () => {
      render(<PaymentForm onSubmit={() => {}} />);

      expect(screen.getByLabelText(/expiry/i)).toBeInTheDocument();
    });

    it("shows CVV field when card method is selected", () => {
      render(<PaymentForm onSubmit={() => {}} />);

      expect(screen.getByLabelText(/cvv/i)).toBeInTheDocument();
    });

    it("shows cardholder name field when card method is selected", () => {
      render(<PaymentForm onSubmit={() => {}} />);

      expect(screen.getByLabelText(/name on card/i)).toBeInTheDocument();
    });

    it("hides card fields when non-card method is selected", async () => {
      const user = userEvent.setup();
      render(<PaymentForm onSubmit={() => {}} />);

      await user.click(screen.getByLabelText("Bank Transfer"));

      expect(screen.queryByLabelText(/card number/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/cvv/i)).not.toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    it("calls onSubmit with payment data", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<PaymentForm onSubmit={handleSubmit} />);

      await user.type(screen.getByLabelText(/amount/i), "100.00");
      await user.type(screen.getByLabelText(/card number/i), "4242424242424242");
      await user.type(screen.getByLabelText(/expiry/i), "12/27");
      await user.type(screen.getByLabelText(/cvv/i), "123");
      await user.type(screen.getByLabelText(/name on card/i), "John Doe");

      await user.click(screen.getByRole("button", { name: /pay/i }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            amount: 100,
            paymentMethodType: "card",
            cardNumber: "4242424242424242",
            cardExpiry: "12/27",
            cardCvv: "123",
            cardName: "John Doe",
          })
        );
      });
    });

    it("does not submit when amount is empty (HTML5 validation)", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<PaymentForm onSubmit={handleSubmit} />);

      await user.click(screen.getByRole("button", { name: /pay/i }));

      // HTML5 required validation prevents submission
      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it("uses saved payment method when selected", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<PaymentForm onSubmit={handleSubmit} savedMethods={mockSavedMethods} />);

      // Select saved method
      await user.click(screen.getByText(/Visa ending in 4242/));
      await user.type(screen.getByLabelText(/amount/i), "50.00");

      await user.click(screen.getByRole("button", { name: /pay/i }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            amount: 50,
            paymentMethodId: "pm-001",
          })
        );
      });
    });
  });

  describe("loading state", () => {
    it("disables form when submitting", () => {
      render(<PaymentForm onSubmit={() => {}} submitting />);

      expect(screen.getByLabelText(/amount/i)).toBeDisabled();
      // Button shows "Processing..." text when submitting
      expect(screen.getByRole("button", { name: /processing/i })).toBeDisabled();
    });

    it("shows loading indicator on button when submitting", () => {
      render(<PaymentForm onSubmit={() => {}} submitting />);

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  describe("save payment method option", () => {
    it("shows save payment method checkbox", () => {
      render(<PaymentForm onSubmit={() => {}} />);

      expect(screen.getByLabelText(/save this payment method/i)).toBeInTheDocument();
    });

    it("includes savePaymentMethod in submission when checked", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<PaymentForm onSubmit={handleSubmit} />);

      await user.type(screen.getByLabelText(/amount/i), "25.00");
      await user.type(screen.getByLabelText(/card number/i), "4242424242424242");
      await user.type(screen.getByLabelText(/expiry/i), "12/27");
      await user.type(screen.getByLabelText(/cvv/i), "123");
      await user.type(screen.getByLabelText(/name on card/i), "Jane Doe");
      await user.click(screen.getByLabelText(/save this payment method/i));

      await user.click(screen.getByRole("button", { name: /pay/i }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            savePaymentMethod: true,
          })
        );
      });
    });
  });
});
