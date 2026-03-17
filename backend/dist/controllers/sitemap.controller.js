"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSitemap = void 0;
const prisma_1 = require("../lib/prisma");
const getSitemap = async (req, res) => {
    const SITE_URL = process.env.SITE_URL || "http://localhost:3000";
    const posts = await prisma_1.prisma.post.findMany({
        select: {
            slug: true,
            updatedAt: true,
        },
    });
    const urls = posts
        .map((post) => `
<url>
  <loc>${SITE_URL}/blog/${post.slug}</loc>
  <lastmod>${post.updatedAt.toISOString()}</lastmod>
</url>`)
        .join("");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

<url>
  <loc>${SITE_URL}</loc>
</url>

<url>
  <loc>${SITE_URL}/blog</loc>
</url>

${urls}

</urlset>`;
    res.header("Content-Type", "application/xml");
    res.send(xml);
};
exports.getSitemap = getSitemap;
