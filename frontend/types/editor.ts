export type HeadingBlock = {
  type: "heading";
  level: 1 | 2 | 3 | 4;
  content: string;
};

export type ParagraphBlock = {
  type: "paragraph";
  content: string;
};

export type ImageBlock = {
  type: "image";
  url: string;
  alt: string;
  caption?: string;
};

export type QuoteBlock = {
  type: "quote";
  content: string;
  author?: string;
};

export type CodeBlock = {
  type: "code";
  language: string;
  content: string;
};

export type EditorBlock =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | QuoteBlock
  | CodeBlock;

export type EditorContent = EditorBlock[];