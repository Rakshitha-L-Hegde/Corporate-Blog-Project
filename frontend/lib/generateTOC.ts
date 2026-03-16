import { Block, HeadingBlock } from "./blockTypes";

export function generateTOC(blocks: Block[]) {
  return blocks
    .filter(
      (block): block is HeadingBlock =>
        block.type === "heading" &&
        (block.level === 2 || block.level === 3)
    )
    .map((block) => ({
      text: block.text,
      level: block.level
    }));
}