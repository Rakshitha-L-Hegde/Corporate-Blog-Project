import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { publishedFilter } from "../lib/publishedFilter";
import { logQueryPerformance } from "../lib/queryLogger";
export const getPostsByAuthorId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const start = Date.now();

    const posts = await prisma.post.findMany({
      where: {
  ...publishedFilter,
  authorId: id
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

    logQueryPerformance("getPostBySlug", start);

    res.json({
      page,
      limit,
      count: posts.length,
      posts
    });

  } catch (error) {
    next(error);
  }
};