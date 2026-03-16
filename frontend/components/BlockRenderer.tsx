import { Block } from "@/lib/blockTypes";
import { renderBlock } from "@/lib/blockRenderer";

type Props = {
  blocks: Block[];
};

export default function BlockRenderer({ blocks }: Props) {
  return (
    <div>
      {blocks.map((block, index) =>
        renderBlock(block, index)
      )}
    </div>
  );
}