import { Router } from "express";
import { login, register, googleLogin } from "../controllers/authController";
import { validateBody } from "../middleware/validation";
import { loginSchema, registerSchema, googleLoginSchema } from "../validation/schemas";

const router = Router();

router.post("/login", validateBody(loginSchema), login);
router.post("/register", validateBody(registerSchema), register);
router.post("/google-login", validateBody(googleLoginSchema), googleLogin);

export default router;

