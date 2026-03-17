import { notFound } from "next/navigation";
import BlockRenderer from "@/components/BlockRenderer";
import { generateTOC } from "@/lib/generateTOC";

export const revalidate = 900;
export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`);

    if (!res.ok) return [];

    const posts = await res.json();

    // ✅ safety check
    if (!Array.isArray(posts)) return [];

    return posts.map((post: any) => ({
      slug: post.slug,
    }));

  } catch (error) {
    return []; // prevent build crash
  }
}

async function getPost(slug: string) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const res = await fetch(`${BASE_URL}/api/posts/slug/${slug}`, {
  next: { revalidate: 900 },
});

  if (!res.ok) return null;

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

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;

  return {
    title,
    description,

    alternates: {
      canonical: `http://localhost:3000/blog/${post.slug}`,
    },

    openGraph: {
      title,
      description,
      type: "article",
      url: `http://localhost:3000/blog/${post.slug}`,
      images: [
        {
          url: post.coverImage || "/default.jpg",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.coverImage || "/default.jpg"],
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

  const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.excerpt,
  author: {
    "@type": "Person",
    name: post.author?.name || "Admin",
  },
  datePublished: post.createdAt,
  mainEntityOfPage: `http://localhost:3000/blog/${post.slug}`,
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "http://localhost:3000",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: "http://localhost:3000/blog",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: post.title,
      item: `http://localhost:3000/blog/${post.slug}`,
    },
  ],
};

  const toc = generateTOC(post.content);

  return (
    <div className="max-w-3xl mx-auto py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
/>

<script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(breadcrumbData),
    }}
  />
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