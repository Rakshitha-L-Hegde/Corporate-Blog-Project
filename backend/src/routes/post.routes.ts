import { Router } from "express";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { editorSchema } from "../schemas/editor.schema";
import slugify from "slugify";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { getPostBySlug, searchPosts } from "../controllers/post.controller";
import { getSitemap } from "../controllers/sitemap.controller";
import { publishPost } from "../controllers/post.controller";
import { logQueryPerformance } from "../lib/queryLogger";

let cachedPosts: any = null;
let lastFetch = 0;

console.log("Post routes loaded");

const router = Router();

/*
GET POST BY SLUG (PUBLIC)
*/
router.get("/slug/:slug", getPostBySlug);


router.get("/search", searchPosts);

/*
SITEMAP XML (PUBLIC)
*/
router.get("/sitemap.xml", getSitemap);

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

    const posts = await prisma.post.findMany({
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

  } catch (err) {
    next(err);
  }
});
/*
CREATE POST
Admin + Editor can create posts
Editor -> always draft
Admin -> can publish
*/
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "EDITOR"),
  validate(editorSchema),

  async (req: AuthRequest, res, next) => {
    try {
      const {
        title,
        excerpt,
        content,
        seoTitle,
        seoDescription,
        coverImageId,
        categories
      } = req.body;

      // Generate slug
      const slug = slugify(title, {
        lower: true,
        strict: true
      });

      // Check slug uniqueness
      const existing = await prisma.post.findUnique({
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
      let status: "DRAFT" | "PUBLISHED" = "DRAFT";

      if (req.user!.role === "ADMIN") {
        status = req.body.status || "DRAFT";
      }

      const post = await prisma.post.create({
        data: {
          title,
          slug,
          excerpt,
          content,
          seoTitle,
          seoDescription,
          status,
          authorId: req.user!.userId,
          coverImageId,

          categories: {
            create:
              categories?.map((categoryId: string) => ({
                categoryId
              })) || []
          }
        }
      });

      console.log(
  `[DRAFT CREATED] user=${req.user?.userId} slug=${slug} status=${status}`
);

      res.status(201).json(post);

    } catch (err) {
      next(err);
    }
  }
);

/*
UPDATE POST
Admin + Editor can update posts
*/
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "EDITOR"),
  async (req: AuthRequest, res, next) => {
    try {

      const { id } = req.params;

      const {
        title,
        excerpt,
        content,
        seoTitle,
        seoDescription,
        coverImageId
      } = req.body;

      const updatedPost = await prisma.post.update({
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

      console.log(
  `[DRAFT UPDATED] user=${req.user?.userId} postId=${id}`
);

      res.json(updatedPost);

    } catch (err) {
      next(err);
    }
  }
);

/*
PUBLISH POST
Only ADMIN can publish
*/
router.patch(
  "/:id/publish",
  authenticate,
  authorize("ADMIN"),
  async (req: AuthRequest, res, next) => {
    try {
      const start = Date.now();
      const { id } = req.params;
      const { scheduledAt } = req.body;

      const post = await prisma.post.findUnique({
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
      let status: "PUBLISHED" | "SCHEDULED" = "PUBLISHED";
      let publishedAt: Date | null = new Date();
      let scheduleDate: Date | null = null;

      // scheduling logic
      if (scheduledAt && new Date(scheduledAt) > new Date()) {
        status = "SCHEDULED";
        publishedAt = null;
        scheduleDate = new Date(scheduledAt);
      }

      // 🔥 TRANSACTION (atomic)
      const [updatedPost] = await prisma.$transaction([
        prisma.post.update({
          where: { id },
          data: {
            status,
            publishedAt,
            scheduledAt: scheduleDate
          }
        }),

        // 🔥 AUDIT LOG
        prisma.postPublishLog.create({
          data: {
            postId: id,
            action: status,
            performedBy: req.user!.userId
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

    } catch (err) {
      next(err);
    }
  }
);

export default router;