"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostsByCategorySlug = void 0;
const prisma_1 = require("../lib/prisma");
const publishedFilter_1 = require("../lib/publishedFilter");
const queryLogger_1 = require("../lib/queryLogger");
const getPostsByCategorySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const start = Date.now();
        const posts = await prisma_1.prisma.post.findMany({
            where: {
                ...publishedFilter_1.publishedFilter,
                categories: {
                    some: {
                        category: {
                            slug
                        }
                    }
                }
            },
            include: {
                author: true,
                categories: {
                    include: {
                        category: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: {
                publishedAt: "desc"
            }
        });
        (0, queryLogger_1.logQueryPerformance)("getPostBySlug", start);
        res.json({
            page,
            limit,
            count: posts.length,
            posts
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPostsByCategorySlug = getPostsByCategorySlug;
