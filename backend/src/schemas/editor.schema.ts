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
  caption: z.string().optional(),
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
  blocks: z.array(
    z.union([
      paragraphBlock,
      headingBlock,
      imageBlock,
      quoteBlock,
      codeBlock,
    ])
  ),
});