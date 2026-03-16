"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editorSchema = void 0;
const zod_1 = require("zod");
const paragraphBlock = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.literal("paragraph"),
    content: zod_1.z.string(),
});
const headingBlock = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.literal("heading"),
    level: zod_1.z.union([zod_1.z.literal(1), zod_1.z.literal(2), zod_1.z.literal(3)]),
    content: zod_1.z.string(),
});
const imageBlock = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.literal("image"),
    url: zod_1.z.string().url(),
    caption: zod_1.z.string().optional(),
});
const quoteBlock = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.literal("quote"),
    content: zod_1.z.string(),
});
const codeBlock = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.literal("code"),
    language: zod_1.z.string(),
    content: zod_1.z.string(),
});
exports.editorSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    blocks: zod_1.z.array(zod_1.z.union([
        paragraphBlock,
        headingBlock,
        imageBlock,
        quoteBlock,
        codeBlock,
    ])),
    excerpt: zod_1.z.string().optional(),
    seoTitle: zod_1.z.string().optional(),
    seoDescription: zod_1.z.string().optional(),
    coverImageId: zod_1.z.string().nullable().optional(),
    categories: zod_1.z.array(zod_1.z.string()).optional(),
});
