import { Block } from "./blockTypes";
import React from "react";
import Image from "next/image";

function optimizeImage(url: string) {
  if (!url.includes("cloudinary")) return url;

  return url.replace(
    "/upload/",
    "/upload/f_auto,q_auto,w_800/"
  );
}

export function renderBlock(block: Block, index: number) {
  switch (block.type) {

    case "heading": {
  const Tag = `h${block.level}` as React.ElementType;

  return (
    <Tag key={index} className="font-bold mt-8 mb-4">
      {block.content}
    </Tag>
  );
}

    case "paragraph":
      return (
        <p key={index} className="mb-4">
          {block.content}
        </p>
      );

    case "list":
      if (block.ordered) {
        return (
          <ol key={index} className="list-decimal pl-6 mb-4">
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        );
      }

      return (
        <ul key={index} className="list-disc pl-6 mb-4">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case "image":
  return (
    <figure key={index} className="my-6">
      <div className="relative w-full">
      <Image
        src={optimizeImage(block.url)}
        alt={block.alt_text || "Blog image"}
        title={block.title || ""}
        width={block.width || 1200}
        height={block.height || 700}
        quality={70}
        priority={index === 0}
        loading={index === 0 ? "eager" : "lazy"}
        sizes="(max-width: 768px) 100vw, 1200px"
        className="rounded-lg"
      />
      </div>
      {block.caption && (
        <figcaption className="text-sm text-gray-500 mt-2 text-center">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );

    case "blockquote":
      return (
        <blockquote
          key={index}
          className="border-l-4 border-gray-400 pl-4 italic my-6"
        >
          {block.content}
        </blockquote>
      );

    case "table":
      return (
        <table key={index} className="table-auto border my-6 w-full">
          <thead>
            <tr>
              {block.headers.map((h, i) => (
                <th key={i} className="border px-3 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {block.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c} className="border px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );

    default:
      return null;
  }
}