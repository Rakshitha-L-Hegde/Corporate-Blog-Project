"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = exports.refresh = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const env_1 = require("../config/env");
const google_auth_library_1 = require("google-auth-library");
const googleClient = new google_auth_library_1.OAuth2Client(env_1.env.GOOGLE_CLIENT_ID);
const login = async (req, res) => {
    const { email, password } = req.body;
    // 1️⃣ Check if user exists
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    // 2️⃣ Compare password
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log("LOGIN JWT SECRET:", env_1.env.JWT_SECRET);
    // 3️⃣ Generate ACCESS token
    const accessToken = jsonwebtoken_1.default.sign({
        userId: user.id,
        role: user.role,
    }, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    });
    // 4️⃣ Generate REFRESH token
    const refreshToken = jsonwebtoken_1.default.sign({
        userId: user.id,
    }, env_1.env.JWT_REFRESH_SECRET, {
        expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN,
    });
    // 5️⃣ Store refresh token in DB
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
    });
    // 6️⃣ Send response
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/"
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/"
    });
    return res.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};
exports.login = login;
// 🔹 REFRESH TOKEN CONTROLLER
const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: payload.userId },
        });
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        const newAccessToken = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_EXPIRES_IN,
        });
        return res.json({ accessToken: newAccessToken });
    }
    catch {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
};
exports.refresh = refresh;
const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: env_1.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if (!payload?.email) {
            return res.status(400).json({ message: "Google login failed" });
        }
        const email = payload.email;
        const name = payload.name || "Google User";
        // Check if user exists
        let user = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        // Create user if not exists
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: {
                    name,
                    email,
                    password: "", // Google users don't need password
                    role: "WRITER"
                }
            });
        }
        // Generate access token
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_EXPIRES_IN,
        });
        // Generate refresh token
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.env.JWT_REFRESH_SECRET, {
            expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN,
        });
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken }
        });
        res.json({
            accessToken,
            refreshToken,
            user
        });
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ message: "Google authentication failed" });
    }
};
exports.googleLogin = googleLogin;
