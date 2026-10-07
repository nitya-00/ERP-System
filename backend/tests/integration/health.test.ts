import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/app.js";

describe("GET /health", () => {
  it("reports a healthy API without a database connection", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { status: "ok", service: "school-erp-api" },
    });
    expect(response.headers["x-request-id"]).toBeDefined();
  });
});
