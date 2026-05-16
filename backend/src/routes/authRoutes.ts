import { Router } from "express";
import { login, me, register } from "../controllers/authController";
import { protect } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validators/authValidators";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.get("/me", protect, me);

export default router;
