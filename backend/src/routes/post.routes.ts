import { Router } from "express";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { editorSchema } from "../schemas/editor.schema";
import slugify from "slugify";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

console.log("Post routes loaded");

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
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


router.post(
  "/",
  authenticate,                 // 🔐 must be logged in
  authorize("ADMIN", "EDITOR"), // 🔐 role check
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
        categories,
        status
      } = req.body;

      // 🔥 Generate slug
      let slug = slugify(title, {
        lower: true,
        strict: true
      });

      // 1️⃣ Check slug uniqueness
      const existing = await prisma.post.findUnique({
        where: { slug }
      });

      if (existing) {
        return res.status(400).json({
          message: "Slug already exists"
        });
      }

      // 2️⃣ Create post
      const post = await prisma.post.create({
        data: {
          title,
          slug,
          excerpt,
          content,
          seoTitle,
          seoDescription,
          status,

          // 🔥 Use logged-in user
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

export default router;