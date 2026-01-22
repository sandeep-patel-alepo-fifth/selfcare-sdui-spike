import { POST } from "../enroll/route";
import { NextRequest } from "next/server";

describe("POST /api/billing/autopay/enroll", () => {
  it("enrolls in autopay successfully with due_date schedule", async () => {
    const request = new NextRequest("http://localhost/api/billing/autopay/enroll", {
      method: "POST",
      body: JSON.stringify({
        paymentMethodId: "pm-001",
        scheduleType: "due_date",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.autopay).toBeDefined();
    expect(data.autopay.enabled).toBe(true);
    expect(data.autopay.scheduleType).toBe("due_date");
  });

  it("enrolls with day_of_month schedule", async () => {
    const request = new NextRequest("http://localhost/api/billing/autopay/enroll", {
      method: "POST",
      body: JSON.stringify({
        paymentMethodId: "pm-001",
        scheduleType: "day_of_month",
        dayOfMonth: 15,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.autopay.dayOfMonth).toBe(15);
  });

  it("enrolls with threshold schedule", async () => {
    const request = new NextRequest("http://localhost/api/billing/autopay/enroll", {
      method: "POST",
      body: JSON.stringify({
        paymentMethodId: "pm-001",
        scheduleType: "threshold",
        thresholdAmount: 100,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.autopay.thresholdAmount).toBe(100);
  });

  it("requires payment method ID", async () => {
    const request = new NextRequest("http://localhost/api/billing/autopay/enroll", {
      method: "POST",
      body: JSON.stringify({
        scheduleType: "due_date",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toMatch(/payment method/i);
  });

  it("requires schedule type", async () => {
    const request = new NextRequest("http://localhost/api/billing/autopay/enroll", {
      method: "POST",
      body: JSON.stringify({
        paymentMethodId: "pm-001",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toMatch(/schedule type/i);
  });

  it("validates day_of_month when schedule is day_of_month", async () => {
    const request = new NextRequest("http://localhost/api/billing/autopay/enroll", {
      method: "POST",
      body: JSON.stringify({
        paymentMethodId: "pm-001",
        scheduleType: "day_of_month",
        // Missing dayOfMonth
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toMatch(/day of month/i);
  });

  it("validates threshold when schedule is threshold", async () => {
    const request = new NextRequest("http://localhost/api/billing/autopay/enroll", {
      method: "POST",
      body: JSON.stringify({
        paymentMethodId: "pm-001",
        scheduleType: "threshold",
        // Missing thresholdAmount
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toMatch(/threshold/i);
  });

  it("includes max payment amount when provided", async () => {
    const request = new NextRequest("http://localhost/api/billing/autopay/enroll", {
      method: "POST",
      body: JSON.stringify({
        paymentMethodId: "pm-001",
        scheduleType: "due_date",
        maxPaymentAmount: 500,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.autopay.maxPaymentAmount).toBe(500);
  });
});
