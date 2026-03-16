import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { publishedFilter } from "../lib/publishedFilter";
import { logQueryPerformance } from "../lib/queryLogger";
export const getPostBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const start = Date.now();

    const post = await prisma.post.findFirst({
      where: {
        slug,
        ...publishedFilter
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

logQueryPerformance("getPostBySlug", start);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);

  } catch (error) {
    next(error);
  }
};