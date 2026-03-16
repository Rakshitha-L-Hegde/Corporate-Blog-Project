import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 900;

async function getAuthorPosts(slug: string) {
  const res = await fetch(
    `http://localhost:5000/authors/${slug}/posts`,
    { next: { revalidate: 900 } }
  );

  if (!res.ok) return null;

  return res.json();
}

export default async function AuthorPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getAuthorPosts(params.slug);

  if (!data) return notFound();

  const posts = data.posts;

  return (
    <main className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">
        Author: {params.slug}
      </h1>

      {posts.length === 0 && (
        <p className="text-gray-500">No posts by this author.</p>
      )}

      <div className="space-y-6">
        {posts.map((post: any) => (
          <div key={post.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{post.title}</h2>

            <p className="text-gray-600 mt-2">{post.excerpt}</p>

            <Link
              href={`/blog/${post.slug}`}
              className="text-blue-600 mt-2 inline-block"
            >
              Read →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}