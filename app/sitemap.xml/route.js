// Dynamic sitemap.xml for Next.js App Router
export async function GET() {
  const baseUrl = 'https://hossame-front.vercel.app'; // Change to your actual domain
  const pages = [
    '',
    'admin',
    'book-order',
    'Courses',
    'payment',
    'profile',
    'quiz',
    'sign-in',
    'sign-up',
  ];

  const urls = pages.map(
    (page) => `  <url>\n    <loc>${baseUrl}/${page}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
  ).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
