import { Router } from "express";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { editorSchema } from "../schemas/editor.schema";

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
  //validate(editorSchema),
  async (req, res, next) => {
    try {
      const {
        title,
        slug,
        excerpt,
        content,
        seoTitle,
        seoDescription,
        coverImageId,
        categories,
        status
      } = req.body;

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
          authorId: "e8891281-510b-4b38-ab5e-d3eb888c1c87", // we replace later with auth
          coverImageId,
          categories: {
            create: categories?.map((categoryId: string) => ({
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