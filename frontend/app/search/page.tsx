import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams?.q || "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts/search?q=${query}`,
    { cache: "no-store" }
  );

  const results = await res.json();

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">
        Results for "{query}"
      </h1>

      {results.length === 0 ? (
        <p>No results found</p>
      ) : (
        <ul className="space-y-4">
          {results.map((post: any) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="text-blue-500"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}