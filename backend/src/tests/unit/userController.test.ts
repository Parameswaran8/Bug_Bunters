import UserController from "../../controllers/user.controller";
import { HttpStatusCodes } from "../../utils/errorCodes";

describe("UserController.getUserDataWithToken", () => {
  it("should return user data from the request object", async () => {
    // Mock user data
    const mockUser = { id: "user123", name: "Test User", email: "test@example.com" };
    
    // Mock Request and Response objects
    const req = {
      user: mockUser
    } as any;
    
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    } as any;

    // Call the controller method
    // Note: Since it's wrapped in asyncHandler, we call the returned function
    const controllerFn = UserController.getUserDataWithToken;
    await controllerFn(req, res, () => {});

    // Assertions
    expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(mockUser);
  });
});
