export type HeadingBlock = {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
};

export type ParagraphBlock = {
  type: "paragraph";
  content: string;
};

export type ListBlock = {
  type: "list";
  ordered: boolean;
  items: string[];
};

export type ImageBlock = {
  type: "image";
  url: string;

  alt_text: string;     // required
  title?: string;
  caption?: string;

  width?: number;
  height?: number;
};

export type QuoteBlock = {
  type: "blockquote";
  content: string;
};

export type TableBlock = {
  type: "table";
  headers: string[];
  rows: string[][];
};

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | ImageBlock
  | QuoteBlock
  | TableBlock;