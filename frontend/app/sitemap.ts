import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const res = await fetch("http://localhost:5000/api/posts");

  const posts = await res.json();

  const postUrls = posts.map((post: any) => ({
    url: `http://localhost:3000/blog/${post.slug}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: "http://localhost:3000",
      lastModified: new Date(),
    },
    ...postUrls,
  ];
}