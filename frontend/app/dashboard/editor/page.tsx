"use client";

import { useState, useEffect } from "react";
import { EditorContent } from "@/types/editor";
import { v4 as uuid } from "uuid";
import slugify from "slugify";


export default function EditorPage() {

  const [title, setTitle] = useState("");

  const [content, setContent] = useState<EditorContent>({
    blocks: [],
  });

  const slug = slugify(title, { lower: true, strict: true });

  const saveDraft = async () => {
  if (!title && content.blocks.length === 0) return;

  try {
    await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  title,
  excerpt: "",
  content: content,
  blocks: content.blocks,
  seoTitle: title,
  seoDescription: "",
  coverImageId: null,
  categories: [],
}),
    });

    console.log("Draft auto-saved");
  } catch (err) {
    console.error("Auto-save failed", err);
  }
};

  useEffect(() => {
  const timer = setTimeout(() => {
    saveDraft();
  }, 3000);

  return () => clearTimeout(timer);
}, [title, content]);

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

    <input
      type="text"
      placeholder="Post title..."
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className="w-full text-3xl font-bold border-b mb-6 outline-none"
    />

    <p className="text-sm text-gray-500 mb-4">
      Slug: {slug}
    </p>

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