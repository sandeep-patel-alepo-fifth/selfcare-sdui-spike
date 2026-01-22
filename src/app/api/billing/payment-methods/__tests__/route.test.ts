import { describe, it, expect } from "vitest";
import { GET, POST, DELETE } from "../route";
import { NextRequest } from "next/server";

// Note: GET doesn't require a request parameter, but POST and DELETE do

describe("Payment Methods API", () => {
  describe("GET /api/billing/payment-methods", () => {
    it("returns a list of saved payment methods", async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("methods");
      expect(Array.isArray(data.methods)).toBe(true);
    });

    it("returns payment methods with required fields", async () => {
      const response = await GET();
      const data = await response.json();

      if (data.methods.length > 0) {
        const method = data.methods[0];
        expect(method).toHaveProperty("id");
        expect(method).toHaveProperty("type");
        expect(method).toHaveProperty("last4");
        expect(method).toHaveProperty("label");
        expect(method).toHaveProperty("isDefault");
      }
    });

    it("returns masked card numbers (only last 4)", async () => {
      const response = await GET();
      const data = await response.json();

      data.methods.forEach((method: { last4: string }) => {
        expect(method.last4).toHaveLength(4);
        expect(method.last4).toMatch(/^\d{4}$/);
      });
    });
  });

  describe("POST /api/billing/payment-methods", () => {
    it("adds a new payment method", async () => {
      const newMethod = {
        type: "card",
        cardNumber: "4111111111111111",
        expiryMonth: 12,
        expiryYear: 2028,
        cardName: "Test User",
      };

      const request = new NextRequest("http://localhost/api/billing/payment-methods", {
        method: "POST",
        body: JSON.stringify(newMethod),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.method).toBeDefined();
      expect(data.method.last4).toBe("1111");
      expect(data.method.type).toBe("card");
    });

    it("returns error for missing card number", async () => {
      const newMethod = {
        type: "card",
        expiryMonth: 12,
        expiryYear: 2028,
      };

      const request = new NextRequest("http://localhost/api/billing/payment-methods", {
        method: "POST",
        body: JSON.stringify(newMethod),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe("DELETE /api/billing/payment-methods", () => {
    it("deletes a payment method", async () => {
      const request = new NextRequest("http://localhost/api/billing/payment-methods?id=pm-001", {
        method: "DELETE",
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("returns error when id is missing", async () => {
      const request = new NextRequest("http://localhost/api/billing/payment-methods", {
        method: "DELETE",
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});
