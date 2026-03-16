"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const validate_1 = require("../middleware/validate");
const editor_schema_1 = require("../schemas/editor.schema");
const slugify_1 = __importDefault(require("slugify"));
const auth_1 = require("../middleware/auth");
const post_controller_1 = require("../controllers/post.controller");
console.log("Post routes loaded");
const router = (0, express_1.Router)();
/*
GET POST BY SLUG (PUBLIC)
*/
router.get("/slug/:slug", post_controller_1.getPostBySlug);
/*
PUBLIC POSTS
Only return published posts for the public website
*/
router.get("/", async (req, res, next) => {
    try {
        const posts = await prisma_1.prisma.post.findMany({
            where: {
                status: "PUBLISHED",
                publishedAt: {
                    not: null
                }
            },
            include: {
                author: true,
                categories: true,
            },
        });
        res.json(posts);
    }
    catch (err) {
        next(err);
    }
});
/*
CREATE POST
Admin + Editor can create posts
Editor -> always draft
Admin -> can publish
*/
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "EDITOR"), (0, validate_1.validate)(editor_schema_1.editorSchema), async (req, res, next) => {
    try {
        const { title, excerpt, content, seoTitle, seoDescription, coverImageId, categories } = req.body;
        // Generate slug
        const slug = (0, slugify_1.default)(title, {
            lower: true,
            strict: true
        });
        // Check slug uniqueness
        const existing = await prisma_1.prisma.post.findUnique({
            where: { slug }
        });
        if (existing) {
            return res.status(400).json({
                message: "Slug already exists"
            });
        }
        /*
        Role-based publish control
        Editor -> Draft only
        Admin -> Can publish
        */
        let status = "DRAFT";
        if (req.user.role === "ADMIN") {
            status = req.body.status || "DRAFT";
        }
        const post = await prisma_1.prisma.post.create({
            data: {
                title,
                slug,
                excerpt,
                content,
                seoTitle,
                seoDescription,
                status,
                authorId: req.user.userId,
                coverImageId,
                categories: {
                    create: categories?.map((categoryId) => ({
                        categoryId
                    })) || []
                }
            }
        });
        console.log(`[DRAFT CREATED] user=${req.user?.userId} slug=${slug} status=${status}`);
        res.status(201).json(post);
    }
    catch (err) {
        next(err);
    }
});
/*
UPDATE POST
Admin + Editor can update posts
*/
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "EDITOR"), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, excerpt, content, seoTitle, seoDescription, coverImageId } = req.body;
        const updatedPost = await prisma_1.prisma.post.update({
            where: { id },
            data: {
                title,
                excerpt,
                content,
                seoTitle,
                seoDescription,
                coverImageId
            }
        });
        console.log(`[DRAFT UPDATED] user=${req.user?.userId} postId=${id}`);
        res.json(updatedPost);
    }
    catch (err) {
        next(err);
    }
});
/*
PUBLISH POST
Only ADMIN can publish
*/
router.patch("/:id/publish", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await prisma_1.prisma.post.update({
            where: { id },
            data: {
                status: "PUBLISHED"
            }
        });
        console.log(`[DRAFT PUBLISHED] user=${req.user?.userId} postId=${id}`);
        res.json({
            message: "Post published successfully",
            post
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
