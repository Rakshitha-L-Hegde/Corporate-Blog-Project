import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { publishedFilter } from "../lib/publishedFilter";
import { logQueryPerformance } from "../lib/queryLogger";
import { PostStatus } from "@prisma/client";

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

    const SITE_URL = process.env.SITE_URL || "http://localhost:3000";

    const canonical =
      post.canonicalUrl || `${SITE_URL}/blog/${post.slug}`;

    res.json({
      ...post,
      canonical
    });

  } catch (error) {
    next(error);
  }
};

export const publishPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { scheduledAt } = req.body;

    const post = await prisma.post.findUnique({
      where: { id }, // ✅ string (no change)
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // ✅ FIXED ENUM TYPE
    let status: PostStatus = PostStatus.PUBLISHED;
    let publishedAt: Date | null = new Date();

    if (scheduledAt) {
      const scheduleDate = new Date(scheduledAt);

      if (scheduleDate > new Date()) {
        status = PostStatus.SCHEDULED; // ✅ FIXED
        publishedAt = null;
      }
    }

    await prisma.$transaction([
      prisma.post.update({
        where: { id },
        data: {
          status, // ✅ enum correct
          publishedAt,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        },
      }),

      prisma.postPublishLog.create({
        data: {
          postId: id,           // ✅ FIXED (was post_id)
          action: status,
          performedBy: "admin", // ✅ FIXED (was performed_by)
        },
      }),
    ]);

    if (status === PostStatus.PUBLISHED) { // ✅ FIXED
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

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Publish failed" });
  }
};