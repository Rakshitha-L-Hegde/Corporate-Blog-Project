import { Router } from "express";
import { getPostsByAuthorId } from "../controllers/author.controller";

const router = Router();

/*
GET POSTS BY AUTHOR
*/
router.get("/:id/posts", getPostsByAuthorId);

export default router;