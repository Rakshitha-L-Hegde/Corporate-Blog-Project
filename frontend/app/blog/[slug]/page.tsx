import { notFound } from "next/navigation";
import BlockRenderer from "@/components/BlockRenderer";
import { generateTOC } from "@/lib/generateTOC";

export const revalidate = 900;
export async function generateStaticParams() {
  const res = await fetch("http://localhost:5000/api/posts");

  const posts = await res.json();

  return posts.map((post: any) => ({
    slug: post.slug,
  }));
}

async function getPost(slug: string) {
 const res = await fetch(`http://localhost:5000/api/posts/slug/${slug}`, {
  next: { revalidate: 900 },
});

if (!res.ok) {
  return null;
}

const data = await res.json();
return data;

  if (res.status === 404) {
    return null;
  }

  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
  title: post.seoTitle || post.title,
  description: post.seoDescription || post.excerpt,

  alternates: {
    canonical: `http://localhost:3000/blog/${post.slug}`,
  },

  openGraph: {
    title: post.title,
    description: post.excerpt,
    type: "article",
    url: `http://localhost:3000/blog/${post.slug}`,
  },
};
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await getPost(slug);

  if (!post) return notFound();

  const toc = generateTOC(post.content);

  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-6">{post.title}</h1>

      {/* Table of Contents */}
      {toc.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">Table of Contents</h2>

          <ul className="space-y-1">
            {toc.map((item, i) => (
              <li
                key={i}
                className={item.level === 3 ? "ml-4 text-sm" : ""}
              >
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Render Blocks */}
      <BlockRenderer blocks={post.content} />
    </div>
  );
}