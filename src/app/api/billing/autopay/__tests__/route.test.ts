import { GET, PUT, DELETE } from "../route";
import { NextRequest } from "next/server";

// Suppress unused import warning - NextRequest is used for PUT tests
void NextRequest;

describe("GET /api/billing/autopay", () => {
  it("returns autopay configuration", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.autopay).toBeDefined();
    expect(typeof data.autopay.enabled).toBe("boolean");
    expect(data.autopay.scheduleType).toBeDefined();
  });

  it("includes payment method details when enabled", async () => {
    const response = await GET();
    const data = await response.json();

    if (data.autopay.enabled) {
      expect(data.autopay.paymentMethodId).toBeDefined();
      expect(data.autopay.paymentMethodLabel).toBeDefined();
    }
  });
});

describe("PUT /api/billing/autopay", () => {
  it("updates autopay settings successfully", async () => {
    const request = new NextRequest("http://localhost/api/billing/autopay", {
      method: "PUT",
      body: JSON.stringify({
        dayOfMonth: 20,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.autopay).toBeDefined();
  });

  it("validates day of month range", async () => {
    const request = new NextRequest("http://localhost/api/billing/autopay", {
      method: "PUT",
      body: JSON.stringify({
        dayOfMonth: 32,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it("validates threshold amount is positive", async () => {
    const request = new NextRequest("http://localhost/api/billing/autopay", {
      method: "PUT",
      body: JSON.stringify({
        thresholdAmount: -50,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

describe("DELETE /api/billing/autopay", () => {
  it("disables autopay successfully", async () => {
    const response = await DELETE();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
