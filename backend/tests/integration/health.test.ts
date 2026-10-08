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

  it("rejects an invalid access token", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer placeholder-token");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("INVALID_TOKEN");
  });

  it("does not expose academic setup without authentication", async () => {
    const response = await request(app).get("/api/v1/academics/setup");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHENTICATED");
  });
});
