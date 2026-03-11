import { Router } from "express";
import { login, refresh } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { loginSchema } from "../schemas/auth.schema";
import { googleLogin } from "../controllers/auth.controller";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/login", validate(loginSchema), login);

// refresh token route
router.post("/refresh", refresh);

router.post("/google", googleLogin);

router.get("/me", authenticate, (req: AuthRequest, res) => {
  res.json({
    user: req.user
  });
});

export default router;