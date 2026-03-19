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
const sitemap_controller_1 = require("../controllers/sitemap.controller");
let cachedPosts = null;
let lastFetch = 0;
console.log("Post routes loaded");
const router = (0, express_1.Router)();
/*
GET POST BY SLUG (PUBLIC)
*/
router.get("/slug/:slug", post_controller_1.getPostBySlug);
/*
SITEMAP XML (PUBLIC)
*/
router.get("/sitemap.xml", sitemap_controller_1.getSitemap);
/*
PUBLIC POSTS
Only return published posts for the public website
*/
router.get("/", async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        // ✅ CACHE CHECK (5 seconds)
        if (Date.now() - lastFetch < 5000 && cachedPosts) {
            return res.json(cachedPosts);
        }
        const skip = (page - 1) * limit;
        const posts = await prisma_1.prisma.post.findMany({
            where: {
                status: "PUBLISHED",
                publishedAt: { not: null }
            },
            skip,
            take: Math.min(limit, 20),
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                coverImageId: true,
            }
        });
        const result = {
            page,
            limit,
            data: posts,
        };
        // ✅ SAVE TO CACHE
        cachedPosts = result;
        lastFetch = Date.now();
        res.json(result);
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
        const start = Date.now();
        const { id } = req.params;
        const { scheduledAt } = req.body;
        const post = await prisma_1.prisma.post.findUnique({
            where: { id }
        });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (!post.title) {
            return res.status(400).json({ message: "Title required" });
        }
        if (!post.slug) {
            return res.status(400).json({ message: "Slug required" });
        }
        //if (!post.coverImageId) {
        //  return res.status(400).json({ message: "Banner required" });
        //}
        if (!post.excerpt && !post.seoDescription) {
            return res.status(400).json({
                message: "Excerpt or meta required"
            });
        }
        // default → publish immediately
        let status = "PUBLISHED";
        let publishedAt = new Date();
        let scheduleDate = null;
        // scheduling logic
        if (scheduledAt && new Date(scheduledAt) > new Date()) {
            status = "SCHEDULED";
            publishedAt = null;
            scheduleDate = new Date(scheduledAt);
        }
        // 🔥 TRANSACTION (atomic)
        const [updatedPost] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.post.update({
                where: { id },
                data: {
                    status,
                    publishedAt,
                    scheduledAt: scheduleDate
                }
            }),
            // 🔥 AUDIT LOG
            prisma_1.prisma.postPublishLog.create({
                data: {
                    postId: id,
                    action: status,
                    performedBy: req.user.userId
                }
            })
        ]);
        // 🔥 ISR TRIGGER (only when published immediately)
        if (status === "PUBLISHED") {
            await fetch(`${process.env.FRONTEND_URL}/api/revalidate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.REVALIDATE_SECRET}`
                },
                body: JSON.stringify({
                    path: `/blog/${updatedPost.slug}`
                })
            });
        }
        const end = Date.now();
        console.log(`Publish latency: ${end - start} ms`);
        res.json({
            message: `Post ${status} successfully`,
            post: updatedPost
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
