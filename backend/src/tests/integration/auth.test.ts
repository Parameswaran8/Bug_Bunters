import request from "supertest";
import app from "../../app";
import User from "../../models/user.model";

// Mock the User model to avoid database connection issues during tests
jest.mock("../../models/user.model");

describe("Auth API Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock behavior for findOne: return null (user not found)
    (User.findOne as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(null)
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return 400 or 401 for invalid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          username_email: "nonexistent@example.com",
          password: "wrongpassword"
        });

      // We expect a failure because the user doesn't exist
      expect([400, 401, 404]).toContain(res.status);
      expect(res.body).toHaveProperty("message");
    });

    it("should return error for missing credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("required");
    });
  });
});
