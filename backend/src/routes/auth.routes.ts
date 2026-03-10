import { Router } from "express";
import { login, refresh } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { loginSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/login", validate(loginSchema), login);

// refresh token route
router.post("/refresh", refresh);

export default router;