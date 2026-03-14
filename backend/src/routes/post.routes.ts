import { Router } from "express";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { editorSchema } from "../schemas/editor.schema";
import slugify from "slugify";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

console.log("Post routes loaded");

const router = Router();

/*
PUBLIC POSTS
Only return published posts for the public website
*/
router.get("/", async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED"
      },
      include: {
        author: true,
        categories: true
      }
    });

    res.json(posts);
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
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const post = await prisma.post.update({
        where: { id },
        data: {
          status: "PUBLISHED"
        }
      });

      res.json({
        message: "Post published successfully",
        post
      });

    } catch (err) {
      next(err);
    }
  }
);

export default router;