/**
 * tests/auth.test.js — Tests for the /api/auth endpoints
 */

const request = require("supertest");
const app = require("../app");

/* ── Register ───────────────────────────────────────────── */
describe("POST /api/auth/register", () => {
  it("creates a new user (201)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test Analyst", email: "analyst@test.com", password: "password123" });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/registered/i);
  });

  it("rejects duplicate email (400)", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "First", email: "dup@test.com", password: "pass123456" });
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Second", email: "dup@test.com", password: "pass123456" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/email already exists/i);
  });

  it("rejects short password (400)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Bad User", email: "bad@test.com", password: "123" });
    expect(res.statusCode).toBe(400);
  });

  it("rejects missing name (400)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "noname@test.com", password: "password123" });
    expect(res.statusCode).toBe(400);
  });
});

/* ── Login ──────────────────────────────────────────────── */
describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "SOC User", email: "user@soc.com", password: "secure123" });
  });

  it("returns accessToken and refreshToken on valid login (200)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@soc.com", password: "secure123" });
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.email).toBe("user@soc.com");
  });

  it("rejects wrong password (401)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@soc.com", password: "wrongpassword" });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it("rejects non-existent email (401)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@soc.com", password: "secure123" });
    expect(res.statusCode).toBe(401);
  });
});

/* ── Profile (protected route) ──────────────────────────── */
describe("GET /api/auth/profile", () => {
  let accessToken;

  beforeEach(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Profile User", email: "profile@soc.com", password: "secure123" });
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "profile@soc.com", password: "secure123" });
    accessToken = loginRes.body.accessToken;
  });

  it("returns profile with valid token (200)", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("profile@soc.com");
    expect(res.body.password).toBeUndefined(); // password must not be returned
    expect(res.body.refreshToken).toBeUndefined(); // refreshToken must not be returned
  });

  it("rejects request with no token (401)", async () => {
    const res = await request(app).get("/api/auth/profile");
    expect(res.statusCode).toBe(401);
  });
});

/* ── Refresh Token ──────────────────────────────────────── */
describe("POST /api/auth/refresh", () => {
  let refreshToken;

  beforeEach(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Refresh User", email: "refresh@soc.com", password: "secure123" });
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "refresh@soc.com", password: "secure123" });
    refreshToken = loginRes.body.refreshToken;
  });

  it("issues new accessToken with valid refreshToken (200)", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken });
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it("rejects missing refreshToken (401)", async () => {
    const res = await request(app).post("/api/auth/refresh").send({});
    expect(res.statusCode).toBe(401);
  });

  it("rejects invalid refreshToken (401)", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: "completely.wrong.token" });
    expect(res.statusCode).toBe(401);
  });
});
