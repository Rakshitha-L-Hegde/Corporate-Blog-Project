import { Block } from "./blockTypes";
import React from "react";

export function renderBlock(block: Block, index: number) {
  switch (block.type) {

    case "heading": {
  const Tag = `h${block.level}` as React.ElementType;

  return (
    <Tag key={index} className="font-bold mt-8 mb-4">
      {block.text}
    </Tag>
  );
}

    case "paragraph":
      return (
        <p key={index} className="mb-4">
          {block.text}
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
        <img
          key={index}
          src={block.url}
          alt={block.alt || ""}
          className="my-6 rounded-lg"
        />
      );

    case "blockquote":
      return (
        <blockquote
          key={index}
          className="border-l-4 border-gray-400 pl-4 italic my-6"
        >
          {block.text}
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