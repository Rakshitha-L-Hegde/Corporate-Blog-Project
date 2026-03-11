import { Router } from "express";
import { login, refresh } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { loginSchema } from "../schemas/auth.schema";
import { googleLogin } from "../controllers/auth.controller";

const router = Router();

router.post("/login", validate(loginSchema), login);

// refresh token route
router.post("/refresh", refresh);

router.post("/google", googleLogin);

export default router;