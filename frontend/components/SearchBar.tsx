"use client";

import { useState } from "react";
import debounce from "lodash.debounce";

export default function SearchBar() {
    const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = debounce(async (value: string) => {
    if (!value) {
      setResults([]);
      return;
    }

    const res = await fetch(`/api/search?q=${value}`);
    const data = await res.json();

    setResults(data);
  }, 300);

  return (
    <div className="relative max-w-xl mx-auto mb-6">
      <input
  type="text"
  placeholder="Search posts..."
  value={query}
  onChange={(e) => {
    setQuery(e.target.value);
    handleSearch(e.target.value);
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter" && query) {
      window.location.href = `/search?q=${query}`;
    }
  }}
  className="border p-2 w-full rounded"
/>

      {results.length > 0 && (
        <div className="absolute bg-white shadow w-full mt-1 rounded z-50">
          {results.map((post) => (
            <a
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block p-2 hover:bg-gray-100"
            >
              {post.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}