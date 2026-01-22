import { describe, it, expect } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

describe("GET /api/billing/payments", () => {
  it("returns a list of payments", async () => {
    const request = new NextRequest("http://localhost/api/billing/payments");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("payments");
    expect(Array.isArray(data.payments)).toBe(true);
  });

  it("returns paginated results", async () => {
    const request = new NextRequest("http://localhost/api/billing/payments?page=1&limit=5");
    const response = await GET(request);
    const data = await response.json();

    expect(data).toHaveProperty("page", 1);
    expect(data).toHaveProperty("limit", 5);
    expect(data).toHaveProperty("total");
    expect(data).toHaveProperty("hasMore");
  });

  it("filters by status", async () => {
    const request = new NextRequest("http://localhost/api/billing/payments?status=completed");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    data.payments.forEach((payment: { status: string }) => {
      expect(payment.status).toBe("completed");
    });
  });

  it("returns payment with required fields", async () => {
    const request = new NextRequest("http://localhost/api/billing/payments");
    const response = await GET(request);
    const data = await response.json();

    if (data.payments.length > 0) {
      const payment = data.payments[0];
      expect(payment).toHaveProperty("id");
      expect(payment).toHaveProperty("amount");
      expect(payment).toHaveProperty("method");
      expect(payment).toHaveProperty("status");
      expect(payment).toHaveProperty("date");
      expect(payment).toHaveProperty("reference");
    }
  });
});
