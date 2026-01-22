import { render, screen, userEvent } from "@/test/test-utils";
import { PaymentMethodSelector } from "../PaymentMethodSelector";
import { PaymentMethodType } from "@/types/billing";

describe("PaymentMethodSelector", () => {
  const paymentMethods: { value: PaymentMethodType; label: string }[] = [
    { value: "card", label: "Credit/Debit Card" },
    { value: "bank", label: "Bank Transfer" },
    { value: "cashapp", label: "CashApp" },
    { value: "mobile_money", label: "Mobile Money" },
  ];

  describe("rendering", () => {
    it("displays all payment method options", () => {
      render(
        <PaymentMethodSelector
          value="card"
          onChange={() => {}}
        />
      );

      expect(screen.getByLabelText("Credit/Debit Card")).toBeInTheDocument();
      expect(screen.getByLabelText("Bank Transfer")).toBeInTheDocument();
      expect(screen.getByLabelText("CashApp")).toBeInTheDocument();
      expect(screen.getByLabelText("Mobile Money")).toBeInTheDocument();
    });

    it("shows the selected payment method as checked", () => {
      render(
        <PaymentMethodSelector
          value="bank"
          onChange={() => {}}
        />
      );

      const bankRadio = screen.getByLabelText("Bank Transfer");
      expect(bankRadio).toBeChecked();
    });

    it("does not check other methods when one is selected", () => {
      render(
        <PaymentMethodSelector
          value="card"
          onChange={() => {}}
        />
      );

      expect(screen.getByLabelText("Credit/Debit Card")).toBeChecked();
      expect(screen.getByLabelText("Bank Transfer")).not.toBeChecked();
      expect(screen.getByLabelText("CashApp")).not.toBeChecked();
      expect(screen.getByLabelText("Mobile Money")).not.toBeChecked();
    });
  });

  describe("interactions", () => {
    it("calls onChange when a different method is selected", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <PaymentMethodSelector
          value="card"
          onChange={handleChange}
        />
      );

      await user.click(screen.getByLabelText("CashApp"));
      expect(handleChange).toHaveBeenCalledWith("cashapp");
    });

    it("calls onChange with bank when bank transfer is selected", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <PaymentMethodSelector
          value="card"
          onChange={handleChange}
        />
      );

      await user.click(screen.getByLabelText("Bank Transfer"));
      expect(handleChange).toHaveBeenCalledWith("bank");
    });
  });

  describe("disabled state", () => {
    it("disables all options when disabled prop is true", () => {
      render(
        <PaymentMethodSelector
          value="card"
          onChange={() => {}}
          disabled
        />
      );

      expect(screen.getByLabelText("Credit/Debit Card")).toBeDisabled();
      expect(screen.getByLabelText("Bank Transfer")).toBeDisabled();
      expect(screen.getByLabelText("CashApp")).toBeDisabled();
      expect(screen.getByLabelText("Mobile Money")).toBeDisabled();
    });
  });
});
