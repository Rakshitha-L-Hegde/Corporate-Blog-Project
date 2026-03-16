import { Router } from "express";
import { getPostsByCategorySlug } from "../controllers/category.controller";

const router = Router();

/*
GET POSTS BY CATEGORY
*/
router.get("/:slug/posts", getPostsByCategorySlug);

export default router;