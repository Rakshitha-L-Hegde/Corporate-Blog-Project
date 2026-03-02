"use client";

import { useState } from "react";
import { EditorContent } from "@/types/editor";

export default function EditorPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [blocks, setBlocks] = useState<EditorContent>([]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">CMS Editor</h1>

      {/* Title */}
      <input
        className="w-full border p-3 mb-4 rounded"
        placeholder="Post Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Slug */}
      <input
        className="w-full border p-3 mb-6 rounded"
        placeholder="post-slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />

      {/* Blocks Preview */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">Editor State Preview</h2>
        <pre>{JSON.stringify(blocks, null, 2)}</pre>
      </div>

      <button
        onClick={() =>
          setBlocks([
            ...blocks,
            { type: "paragraph", content: "New paragraph block" },
          ])
        }
        className="bg-black text-white px-4 py-2 rounded"
      >
        Add Paragraph Block
      </button>
    </div>
  );
}