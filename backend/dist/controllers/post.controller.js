"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPosts = exports.publishPost = exports.getPostBySlug = void 0;
const prisma_1 = require("../lib/prisma");
const publishedFilter_1 = require("../lib/publishedFilter");
const queryLogger_1 = require("../lib/queryLogger");
const client_1 = require("@prisma/client");
const getPostBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const start = Date.now();
        const post = await prisma_1.prisma.post.findFirst({
            where: {
                slug,
                ...publishedFilter_1.publishedFilter
            },
            include: {
                author: true,
                categories: {
                    include: {
                        category: true
                    }
                },
            }
        });
        (0, queryLogger_1.logQueryPerformance)("getPostBySlug", start);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        const SITE_URL = process.env.SITE_URL || "http://localhost:3000";
        const canonical = post.canonicalUrl || `${SITE_URL}/blog/${post.slug}`;
        res.json({
            ...post,
            canonical
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPostBySlug = getPostBySlug;
const publishPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { scheduledAt } = req.body;
        const post = await prisma_1.prisma.post.findUnique({
            where: { id }, // ✅ string (no change)
        });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        // ✅ FIXED ENUM TYPE
        let status = client_1.PostStatus.PUBLISHED;
        let publishedAt = new Date();
        if (scheduledAt) {
            const scheduleDate = new Date(scheduledAt);
            if (scheduleDate > new Date()) {
                status = client_1.PostStatus.SCHEDULED; // ✅ FIXED
                publishedAt = null;
            }
        }
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.post.update({
                where: { id },
                data: {
                    status, // ✅ enum correct
                    publishedAt,
                    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                },
            }),
            prisma_1.prisma.postPublishLog.create({
                data: {
                    postId: id, // ✅ FIXED (was post_id)
                    action: status,
                    performedBy: "admin", // ✅ FIXED (was performed_by)
                },
            }),
        ]);
        if (status === client_1.PostStatus.PUBLISHED) { // ✅ FIXED
            await fetch(`${process.env.FRONTEND_URL}/api/revalidate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.REVALIDATE_SECRET}`,
                },
                body: JSON.stringify({
                    path: `/blog/${post.slug}`,
                }),
            });
        }
        res.json({ message: `Post ${status} successfully` });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Publish failed" });
    }
};
exports.publishPost = publishPost;
const getPosts = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const start = Date.now();
        const posts = await prisma_1.prisma.post.findMany({
            where: {
                ...publishedFilter_1.publishedFilter
            },
            skip,
            take: limit,
            include: {
                author: true,
                categories: {
                    include: {
                        category: true
                    }
                }
            }
        });
        (0, queryLogger_1.logQueryPerformance)("getPosts", start);
        res.json({
            page,
            limit,
            data: posts,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPosts = getPosts;
