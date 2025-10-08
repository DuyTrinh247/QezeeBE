import { Router } from "express";
import { createUser, deleteUser, getUser, getUsers, updateUser } from "../controllers/usersController";
import { authenticateToken } from "../middleware/auth";
import { validateBody, validateParams } from "../middleware/validation";
import { createUserSchema, updateUserSchema, userIdSchema } from "../validation/schemas";

const router = Router();

// Tất cả routes users đều cần authentication
router.use(authenticateToken as any);

router.get("/", getUsers);
router.get("/:id", validateParams(userIdSchema), getUser);
router.post("/", validateBody(createUserSchema), createUser);
router.put("/:id", validateParams(userIdSchema), validateBody(updateUserSchema), updateUser);
router.delete("/:id", validateParams(userIdSchema), deleteUser);

export default router;


