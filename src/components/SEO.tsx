import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEO({ 
  title = "温州云浠包装有限公司 - 专业3D滴胶贴纸、不干胶标签生产批发厂商", 
  description = "温州云浠包装有限公司专业生产批发3D滴胶贴纸、不干胶标签、纸袋及各类定制包装。拥有10年行业经验，提供一站式高品质印刷包装解决方案。", 
  keywords = "温州云浠包装, 3D滴胶贴纸, 不干胶标签, 包装定制, 印刷厂, 滴胶贴纸批发, 温州包装厂",
  image = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200",
  url = "https://ais-dev-suqcj7eg77xsgwkxiau2ou-110970341243.us-west2.run.app",
  type = "website"
}: SEOProps) {
  const siteTitle = title.includes("温州云浠包装") ? title : `${title} - 温州云浠包装有限公司`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "温州云浠包装有限公司",
          "image": image,
          "@id": url,
          "url": url,
          "telephone": "+86-123-4567-8900",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "浙江省温州市龙港市印刷产业园 A 区 88 号",
            "addressLocality": "温州",
            "addressRegion": "浙江",
            "postalCode": "325802",
            "addressCountry": "CN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 27.51,
            "longitude": 120.55
          },
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday"
            ],
            "opens": "08:00",
            "closes": "18:00"
          },
          "sameAs": [
            "https://www.facebook.com/yunxipackaging",
            "https://www.linkedin.com/company/yunxipackaging"
          ]
        })}
      </script>
    </Helmet>
  );
}
