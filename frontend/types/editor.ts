export type ParagraphBlock = {
  id: string;
  type: "paragraph";
  content: string;
};

export type HeadingBlock = {
  id: string;
  type: "heading";
  level: 1 | 2 | 3;
  content: string;
};

export type ImageBlock = {
  id: string;
  type: "image";
  url: string;
  caption?: string;
};

export type QuoteBlock = {
  id: string;
  type: "quote";
  content: string;
};

export type CodeBlock = {
  id: string;
  type: "code";
  language: string;
  content: string;
};

export type EditorBlock =
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | QuoteBlock
  | CodeBlock;

export type EditorContent = {
  blocks: EditorBlock[];
};