"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostBySlug = void 0;
const prisma_1 = require("../lib/prisma");
const publishedFilter_1 = require("../lib/publishedFilter");
const queryLogger_1 = require("../lib/queryLogger");
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
