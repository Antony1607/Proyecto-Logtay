import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://proyecto-logtay-2.onrender.com';

export default async function handler(req, res) {
  try {
    // URLs estáticas
    const staticUrls = [
      '/',
      '/login',
      '/productos',
      '/ubicaciones',
      '/conteos'
    ];

    // Obtener productos desde Supabase
    const { data: items, error } = await supabase
      .from('products')
      .select('product_code');

    if (error) {
      console.error('Error obteniendo productos:', error);
    }

    // URLs dinámicas
    const dynamicUrls = items
      ? items.map(item => `/productos/${item.product_code}`)
      : [];

    // Combinar todas las URLs
    const allUrls = [...staticUrls, ...dynamicUrls];

    // Generar XML del sitemap
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `
  <url>
    <loc>${BASE_URL}${url}</loc>
    <changefreq>daily</changefreq>
    <priority>${url === '/' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('')}
</urlset>`;

    // Headers correctos
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    return res.status(200).send(sitemapXml);

  } catch (error) {
    console.error('Error generando sitemap:', error);

    return res.status(500).json({
      error: 'Error interno al generar sitemap'
    });
  }
}