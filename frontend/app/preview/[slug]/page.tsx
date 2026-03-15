import { notFound } from "next/navigation";

async function getPost(slug: string) {
  const res = await fetch(`http://localhost:5000/api/posts?slug=${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;

  return res.json();
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {

  const { slug } = await params;

  const post = await getPost(slug);

  if (!post) return notFound();

  return (
    <div className="max-w-3xl mx-auto p-8">

      <h1 className="text-4xl font-bold mb-6">
        {post.title}
      </h1>

      {post.blocks?.map((block: any) => {
        if (block.type === "paragraph") {
          return <p key={block.id}>{block.content}</p>;
        }

        if (block.type === "heading") {
          const Tag = `h${block.level}` as any;
          return <Tag key={block.id}>{block.content}</Tag>;
        }

        if (block.type === "quote") {
          return (
            <blockquote key={block.id}>
              {block.content}
            </blockquote>
          );
        }

        if (block.type === "code") {
          return (
            <pre key={block.id}>
              <code>{block.content}</code>
            </pre>
          );
        }

        if (block.type === "image") {
          return (
            <img
              key={block.id}
              src={block.url}
              alt={block.caption || ""}
            />
          );
        }

        return null;
      })}
    </div>
  );
}