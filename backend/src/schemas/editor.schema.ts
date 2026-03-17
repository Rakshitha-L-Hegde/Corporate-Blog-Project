import { z } from "zod";

const paragraphBlock = z.object({
  id: z.string(),
  type: z.literal("paragraph"),
  content: z.string(),
});

const headingBlock = z.object({
  id: z.string(),
  type: z.literal("heading"),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  content: z.string(),
});

const imageBlock = z.object({
  id: z.string(),
  type: z.literal("image"),
  url: z.string().url(),

  alt_text: z.string().min(1),
  title: z.string().optional(),
  caption: z.string().optional(),

  width: z.number().optional(),
  height: z.number().optional(),
});

const quoteBlock = z.object({
  id: z.string(),
  type: z.literal("quote"),
  content: z.string(),
});

const codeBlock = z.object({
  id: z.string(),
  type: z.literal("code"),
  language: z.string(),
  content: z.string(),
});

export const editorSchema = z.object({
  title: z.string().min(1),

  blocks: z.array(
    z.union([
      paragraphBlock,
      headingBlock,
      imageBlock,
      quoteBlock,
      codeBlock,
    ])
  ),

  excerpt: z.string().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  canonicalUrl: z.string().url().optional(),
  coverImageId: z.string().nullable().optional(),
  categories: z.array(z.string()).optional(),
});