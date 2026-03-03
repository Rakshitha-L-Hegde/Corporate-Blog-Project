import { notFound } from "next/navigation";

async function getPost(slug: string) {
  const res = await fetch("http://localhost:5000/posts", { cache: "no-store" })

  const posts = await res.json();

  return posts.find((p: any) => p.slug === slug);
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