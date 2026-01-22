import { describe, it, expect } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

describe("POST /api/billing/payments", () => {
  it("creates a new payment", async () => {
    const paymentRequest = {
      amount: 100.00,
      currency: "USD",
      paymentMethodType: "card",
      cardNumber: "4242424242424242",
      cardExpiry: "12/27",
      cardCvv: "123",
      cardName: "John Doe",
    };

    const request = new NextRequest("http://localhost/api/billing/payments", {
      method: "POST",
      body: JSON.stringify(paymentRequest),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.payment).toBeDefined();
    expect(data.payment.amount).toBe(100.00);
    expect(data.payment.method).toBe("card");
    expect(data.payment.status).toBe("completed");
  });

  it("returns error for invalid amount", async () => {
    const paymentRequest = {
      amount: -50,
      paymentMethodType: "card",
    };

    const request = new NextRequest("http://localhost/api/billing/payments", {
      method: "POST",
      body: JSON.stringify(paymentRequest),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it("returns error when payment method is missing", async () => {
    const paymentRequest = {
      amount: 100.00,
    };

    const request = new NextRequest("http://localhost/api/billing/payments", {
      method: "POST",
      body: JSON.stringify(paymentRequest),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Payment method");
  });

  it("creates payment with different payment methods", async () => {
    const methods = ["card", "bank", "cashapp", "mobile_money"];

    for (const method of methods) {
      const paymentRequest = {
        amount: 50.00,
        paymentMethodType: method,
      };

      const request = new NextRequest("http://localhost/api/billing/payments", {
        method: "POST",
        body: JSON.stringify(paymentRequest),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.payment.method).toBe(method);
    }
  });
});
