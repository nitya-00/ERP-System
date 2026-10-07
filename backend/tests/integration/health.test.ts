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

  it("does not permit configured authentication routes without auth setup", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer placeholder-token");

    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe("AUTH_NOT_CONFIGURED");
  });
});
