"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const router = (0, express_1.Router)();
/*
GET POSTS BY CATEGORY
*/
router.get("/:slug/posts", category_controller_1.getPostsByCategorySlug);
exports.default = router;
