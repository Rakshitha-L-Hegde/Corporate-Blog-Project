export type HeadingBlock = {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
};

export type ParagraphBlock = {
  type: "paragraph";
  text: string;
};

export type ListBlock = {
  type: "list";
  ordered: boolean;
  items: string[];
};

export type ImageBlock = {
  type: "image";
  url: string;
  alt?: string;
};

export type QuoteBlock = {
  type: "blockquote";
  text: string;
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