export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts/search?q=${q}`
  );

  const data = await res.json();

  return Response.json(data);
}