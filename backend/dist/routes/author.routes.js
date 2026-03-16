"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const author_controller_1 = require("../controllers/author.controller");
const router = (0, express_1.Router)();
/*
GET POSTS BY AUTHOR
*/
router.get("/:id/posts", author_controller_1.getPostsByAuthorId);
exports.default = router;
