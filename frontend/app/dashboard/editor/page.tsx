"use client";

import { useState, useEffect } from "react";
import { EditorContent } from "@/types/editor";
import { v4 as uuid } from "uuid";
import slugify from "slugify";


export default function EditorPage() {

  const [title, setTitle] = useState("");
  const [postId, setPostId] = useState<string | null>(null);
  const [excerpt, setExcerpt] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState("DRAFT");
  const [user, setUser] = useState<any>(null);
  const [content, setContent] = useState<EditorContent>({
    blocks: [],
  });

  const slug = slugify(title, { lower: true, strict: true });

const saveDraft = async () => {
  if (!title && content.blocks.length === 0) return;

  try {
    let res;

    if (!postId) {
      // CREATE (first time)
      res = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        title,
        excerpt: excerpt,
        content: content,
        blocks: content.blocks,
        seoTitle: title,
        seoDescription: "",
        coverImageId: bannerUrl,
        categories: [],
      }),
      });

      const data = await res.json();
      setPostId(data.id); // IMPORTANT
    } else {
      // UPDATE
      res = await fetch(
        `http://localhost:5000/api/posts/${postId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
          title,
          excerpt: excerpt,
          content: content,
          blocks: content.blocks,
          seoTitle: title,
          seoDescription: "",
          coverImageId: bannerUrl,
          categories: [],
        }),
        }
      );
    }

    console.log("Draft saved");
  } catch (err) {
    console.error("Auto-save failed", err);
  }
};

  useEffect(() => {
  const timer = setTimeout(() => {
    saveDraft();
  }, 3000);

  return () => clearTimeout(timer);
}, [title, content, excerpt, bannerUrl]);

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        credentials: "include",
      });

      if (!res.ok) return;

      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error("Failed to fetch user");
    }
  };

  fetchUser();
}, []);


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

const handleConfirmPublish = async () => {
  if (!title.trim()) {
    alert("Title is required");
    return;
  }

  if (!slug) {
    alert("Slug is required");
    return;
  }

  if (!bannerUrl.trim()) {
    alert("Banner image is required");
    return;
  }

  if (!excerpt.trim()) {
    alert("Excerpt or meta description is required");
    return;
  }

  if (!postId) {
    alert("Post not saved yet");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:5000/api/posts/${postId}/publish`,
      {
        method: "PATCH", // ✅ FIXED
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}) // (optional for now)
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert(data.message); // "Post PUBLISHED successfully"
    setStatus("PUBLISHED");
  } catch (err) {
    console.error(err);
    alert("Publish failed");
  }

  setShowModal(false);
};

  return (
  <>
    <div className="p-6">

      <input
        type="text"
        placeholder="Post title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-3xl font-bold border-b mb-6 outline-none"
      />

      <textarea
        placeholder="Write excerpt or meta description..."
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        className="w-full border p-2 mb-4"
      />

      <input
        type="text"
        placeholder="Banner Image URL..."
        value={bannerUrl}
        onChange={(e) => setBannerUrl(e.target.value)}
        className="w-full border p-2 mb-4"
      />

      <p className="text-sm text-gray-500 mb-4">
        Slug: {slug}
      </p>

    <a
  href={`http://localhost:3000/blog/${slug}`}
  target="_blank"
  className="text-blue-600 underline block mb-4"
>
  Preview: /blog/{slug}
</a>
      <span
  className={`px-2 py-1 text-sm rounded ${
    status === "PUBLISHED"
      ? "bg-green-200 text-green-800"
      : "bg-gray-200 text-gray-800"
  }`}
>
  {status}
</span>

 {(!user || user.role === "ADMIN" || user.role === "EDITOR") && (
  <button
    onClick={() => setShowModal(true)}
    disabled={status === "PUBLISHED"}
    className={`px-4 py-2 rounded mb-4 ${
      status === "PUBLISHED"
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-600 text-white"
    }`}
  >
    {status === "PUBLISHED" ? "Published" : "Publish"}
  </button>
)}

      <button onClick={addParagraph} className="mb-4">
        Add Paragraph
      </button>

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
              className="w-full border p-2 mb-2"
            />
          )}
        </div>
      ))}

    </div>

    {/* ✅ MODAL OUTSIDE MAIN DIV */}
    {showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow-lg w-96">

          <h2 className="text-lg font-bold mb-4">
            Confirm Publish
          </h2>

          <p className="mb-6">
            Are you sure you want to publish this post?
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmPublish}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Yes, Publish
            </button>
          </div>

        </div>
      </div>
    )}
  </>
);
}