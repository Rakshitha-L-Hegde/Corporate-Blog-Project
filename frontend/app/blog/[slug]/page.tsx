import { notFound } from "next/navigation";

async function getPost(slug: string) {
  const res = await fetch("http://localhost:5000/api/posts", { cache: "no-store" })

  const posts = await res.json();

  return posts.find((p: any) => p.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {

  const { slug } = await params;

  const res = await fetch("http://localhost:5000/api/posts", {
    cache: "no-store",
  });

  const posts = await res.json();

  const post = posts.find((p: any) => p.slug === slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,

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

  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
      <p>{post.excerpt}</p>
    </div>
  );
}