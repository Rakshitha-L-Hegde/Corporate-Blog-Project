"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_1 = require("../middleware/validate");
const auth_schema_1 = require("../schemas/auth.schema");
const auth_controller_2 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/login", (0, validate_1.validate)(auth_schema_1.loginSchema), auth_controller_1.login);
// refresh token route
router.post("/refresh", auth_controller_1.refresh);
router.post("/google", auth_controller_2.googleLogin);
router.get("/me", auth_1.authenticate, (req, res) => {
    res.json({
        user: req.user
    });
});
exports.default = router;
