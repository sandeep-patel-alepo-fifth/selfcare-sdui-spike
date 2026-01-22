import { render, screen, userEvent, waitFor } from "@/test/test-utils";
import { AutopaySettings } from "../AutopaySettings";
import { AutopayConfig, SavedPaymentMethod } from "@/types/billing";

describe("AutopaySettings", () => {
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
  ];

  const mockConfig: AutopayConfig = {
    enabled: true,
    paymentMethodId: "pm-001",
    scheduleType: "day_of_month",
    dayOfMonth: 15,
    thresholdAmount: null,
    maxPaymentAmount: 500,
    paymentMethodLabel: "Visa ending in 4242",
    paymentMethodType: "card",
    lastPaymentDate: "2026-01-15",
    lastPaymentAmount: 125.99,
    nextScheduledDate: "2026-02-15",
    createdAt: "2025-06-01T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
  };

  describe("rendering", () => {
    it("displays settings form title", () => {
      render(
        <AutopaySettings
          config={mockConfig}
          paymentMethods={mockPaymentMethods}
          onUpdate={() => {}}
          onDisable={() => {}}
        />
      );

      expect(
        screen.getByRole("heading", { name: /autopay settings/i })
      ).toBeInTheDocument();
    });

    it("shows current payment method pre-selected", () => {
      render(
        <AutopaySettings
          config={mockConfig}
          paymentMethods={mockPaymentMethods}
          onUpdate={() => {}}
          onDisable={() => {}}
        />
      );

      expect(screen.getByLabelText(/payment method/i)).toHaveTextContent(
        /visa ending in 4242/i
      );
    });

    it("shows current schedule type pre-selected", () => {
      render(
        <AutopaySettings
          config={mockConfig}
          paymentMethods={mockPaymentMethods}
          onUpdate={() => {}}
          onDisable={() => {}}
        />
      );

      expect(screen.getByLabelText(/schedule type/i)).toHaveTextContent(
        /specific day/i
      );
    });

    it("shows current day of month value", () => {
      render(
        <AutopaySettings
          config={mockConfig}
          paymentMethods={mockPaymentMethods}
          onUpdate={() => {}}
          onDisable={() => {}}
        />
      );

      const dayInput = screen.getByRole("spinbutton", { name: /day of month/i });
      expect(dayInput).toHaveValue(15);
    });

    it("shows current max payment amount", () => {
      render(
        <AutopaySettings
          config={mockConfig}
          paymentMethods={mockPaymentMethods}
          onUpdate={() => {}}
          onDisable={() => {}}
        />
      );

      const maxInput = screen.getByRole("spinbutton", { name: /maximum payment/i });
      expect(maxInput).toHaveValue(500);
    });

    it("shows save and disable buttons", () => {
      render(
        <AutopaySettings
          config={mockConfig}
          paymentMethods={mockPaymentMethods}
          onUpdate={() => {}}
          onDisable={() => {}}
        />
      );

      expect(
        screen.getByRole("button", { name: /save changes/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /disable autopay/i })
      ).toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    it("calls onUpdate with changed payment method", async () => {
      const user = userEvent.setup();
      const handleUpdate = vi.fn();

      render(
        <AutopaySettings
          config={mockConfig}
          paymentMethods={mockPaymentMethods}
          onUpdate={handleUpdate}
          onDisable={() => {}}
        />
      );

      // Change payment method
      await user.click(screen.getByLabelText(/payment method/i));
      await user.click(
        screen.getByRole("option", { name: /mastercard ending in 5555/i })
      );

      // Save
      await user.click(screen.getByRole("button", { name: /save changes/i }));

      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            paymentMethodId: "pm-002",
          })
        );
      });
    });

    it("calls onUpdate with changed schedule type", async () => {
      const user = userEvent.setup();
      const handleUpdate = vi.fn();

      render(
        <AutopaySettings
          config={mockConfig}
          paymentMethods={mockPaymentMethods}
          onUpdate={handleUpdate}
          onDisable={() => {}}
        />
      );

      // Change schedule type to due_date
      await user.click(screen.getByLabelText(/schedule type/i));
      await user.click(screen.getByRole("option", { name: /on due date/i }));

      // Save
      await user.click(screen.getByRole("button", { name: /save changes/i }));

      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            scheduleType: "due_date",
          })
        );
      });
    });

    it("calls onUpdate with changed day of month", async () => {
      const user = userEvent.setup();
      const handleUpdate = vi.fn();

      render(
        <AutopaySettings
          config={mockConfig}
          paymentMethods={mockPaymentMethods}
          onUpdate={handleUpdate}
          onDisable={() => {}}
        />
      );

      // Change day
      const dayInput = screen.getByRole("spinbutton", { name: /day of month/i });
      await user.clear(dayInput);
      await user.type(dayInput, "20");

      // Save
      await user.click(screen.getByRole("button", { name: /save changes/i }));

      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            dayOfMonth: 20,
          })
        );
      });
    });

    it("calls onUpdate with changed max payment amount", async () => {
      const user = userEvent.setup();
      const handleUpdate = vi.fn();

      render(
        <AutopaySettings
          config={mockConfig}
          paymentMethods={mockPaymentMethods}
          onUpdate={handleUpdate}
          onDisable={() => {}}
        />
      );

      // Change max amount
      const maxInput = screen.getByRole("spinbutton", { name: /maximum payment/i });
      await user.clear(maxInput);
      await user.type(maxInput, "1000");

      // Save
      await user.click(screen.getByRole("button", { name: /save changes/i }));

      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            maxPaymentAmount: 1000,
          })
        );
      });
    });
  });

  describe("disable autopay", () => {
    it("calls onDisable when disable button is clicked", async () => {
      const user = userEvent.setup();
      const handleDisable = vi.fn();

      render(
        <AutopaySettings
          config={mockConfig}
          paymentMethods={mockPaymentMethods}
          onUpdate={() => {}}
          onDisable={handleDisable}
        />
      );

      await user.click(screen.getByRole("button", { name: /disable autopay/i }));

      expect(handleDisable).toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("shows loading indicator and disables buttons when submitting", () => {
      render(
        <AutopaySettings
          config={mockConfig}
          paymentMethods={mockPaymentMethods}
          onUpdate={() => {}}
          onDisable={() => {}}
          submitting
        />
      );

      expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /disable autopay/i })).toBeDisabled();
    });
  });

  describe("error handling", () => {
    it("displays error message when provided", () => {
      render(
        <AutopaySettings
          config={mockConfig}
          paymentMethods={mockPaymentMethods}
          onUpdate={() => {}}
          onDisable={() => {}}
          error="Failed to update autopay settings"
        />
      );

      expect(
        screen.getByText(/failed to update autopay settings/i)
      ).toBeInTheDocument();
    });
  });

  describe("threshold schedule type", () => {
    const thresholdConfig: AutopayConfig = {
      ...mockConfig,
      scheduleType: "threshold",
      dayOfMonth: null,
      thresholdAmount: 100,
    };

    it("shows threshold amount pre-filled", () => {
      render(
        <AutopaySettings
          config={thresholdConfig}
          paymentMethods={mockPaymentMethods}
          onUpdate={() => {}}
          onDisable={() => {}}
        />
      );

      const thresholdInput = screen.getByRole("spinbutton", {
        name: /threshold amount/i,
      });
      expect(thresholdInput).toHaveValue(100);
    });

    it("calls onUpdate with changed threshold amount", async () => {
      const user = userEvent.setup();
      const handleUpdate = vi.fn();

      render(
        <AutopaySettings
          config={thresholdConfig}
          paymentMethods={mockPaymentMethods}
          onUpdate={handleUpdate}
          onDisable={() => {}}
        />
      );

      const thresholdInput = screen.getByRole("spinbutton", {
        name: /threshold amount/i,
      });
      await user.clear(thresholdInput);
      await user.type(thresholdInput, "200");

      await user.click(screen.getByRole("button", { name: /save changes/i }));

      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            thresholdAmount: 200,
          })
        );
      });
    });
  });

  describe("cancel action", () => {
    it("shows cancel button when onCancel is provided", () => {
      render(
        <AutopaySettings
          config={mockConfig}
          paymentMethods={mockPaymentMethods}
          onUpdate={() => {}}
          onDisable={() => {}}
          onCancel={() => {}}
        />
      );

      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      const handleCancel = vi.fn();

      render(
        <AutopaySettings
          config={mockConfig}
          paymentMethods={mockPaymentMethods}
          onUpdate={() => {}}
          onDisable={() => {}}
          onCancel={handleCancel}
        />
      );

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(handleCancel).toHaveBeenCalled();
    });
  });
});
