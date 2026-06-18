import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = "https://proyecto-logtay-2.onrender.com"; 

export default async function handler(req, res) {
  try {
   
    const staticUrls = ["/", "/login", "/productos", "/ubicaciones", "/conteos"];

    const { data: items, error } = await supabase
      .from('products') 
      .select('product_code');

    let dynamicUrls = [];
    if (items && !error) {
    
      dynamicUrls = items.map(item => `/productos/${item.product_code}`);
    }

    const allUrls = [...staticUrls, ...dynamicUrls];

    
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://sitemaps.org">
      ${allUrls
        .map((url) => {
          return `
            <url>
              <loc>${BASE_URL}${url}</loc>
              <changefreq>daily</changefreq>
              <priority>${url === "/" ? "1.0" : "0.8"}</priority>
            </url>
          `;
        })
        .join("")}
    </urlset>`;

    res.setHeader("Content-Type", "text/xml");
    res.write(sitemapXml);
    res.end();

  } catch (error) {
    console.error("Error generando sitemap dinámico:", error);
    res.status(500).end();
  }
}
