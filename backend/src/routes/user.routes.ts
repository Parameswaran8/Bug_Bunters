import { Router } from "express";
import UserController from "../controllers/user.controller";

const router = Router();

router.get("/update_user", UserController.UpdateUserWithToken);
router.get("/get_all_users", UserController.getAllUsers);
router.put("/update_user/:id", UserController.updateUser);
router.delete("/delete_user/:id", UserController.deleteUser);

export default router;
