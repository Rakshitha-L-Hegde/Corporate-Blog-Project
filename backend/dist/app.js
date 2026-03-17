"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_schema_1 = require("./schemas/auth.schema");
const validate_1 = require("./middleware/validate");
const errorHandler_1 = require("./middleware/errorHandler");
const prisma_1 = require("./lib/prisma");
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const author_routes_1 = __importDefault(require("./routes/author.routes"));
const express_rate_limit_1 = __importStar(require("express-rate-limit"));
console.log("App imported postRoutes");
const app = (0, express_1.default)();
app.set("trust proxy", 1);
app.use((0, helmet_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => (0, express_rate_limit_1.ipKeyGenerator)(req.ip ?? "127.0.0.1")
});
app.use(limiter);
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get("/", (req, res) => {
    res.send("Backend running 🚀");
});
app.get("/users", async (req, res) => {
    const users = await prisma_1.prisma.user.findMany();
    res.json(users);
});
app.post("/test", (0, validate_1.validate)(auth_schema_1.registerSchema), (req, res) => {
    res.json({
        success: true,
        message: "Validation passed",
    });
});
app.use("/api/posts", post_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/categories", category_routes_1.default);
app.use("/authors", author_routes_1.default);
app.get("/create-user", async (req, res) => {
    try {
        // 1️⃣ Hash the password
        const hashedPassword = await bcrypt_1.default.hash("123456", 10);
        // 2️⃣ Create user with hashed password
        const user = await prisma_1.prisma.user.create({
            data: {
                name: "Admin User",
                email: "admin@test.com",
                password: hashedPassword,
                role: "ADMIN",
            },
        });
        res.json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating user" });
    }
});
app.use(errorHandler_1.errorHandler);
exports.default = app;
