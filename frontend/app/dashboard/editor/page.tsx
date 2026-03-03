"use client";

import { useState } from "react";
import { EditorContent } from "@/types/editor";
import { v4 as uuid } from "uuid";

export default function EditorPage() {
  const [content, setContent] = useState<EditorContent>({
    blocks: [],
  });

  const addParagraph = () => {
    setContent((prev) => ({
      blocks: [
        ...prev.blocks,
        {
          id: uuid(),
          type: "paragraph",
          content: "",
        },
      ],
    }));
  };

  return (
    <div className="p-6">
      <button onClick={addParagraph}>Add Paragraph</button>

      {content.blocks.map((block) => (
        <div key={block.id}>
          {block.type === "paragraph" && (
            <textarea
              value={block.content}
              onChange={(e) => {
                setContent((prev) => ({
                  blocks: prev.blocks.map((b) =>
                    b.id === block.id
                      ? { ...b, content: e.target.value }
                      : b
                  ),
                }));
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}