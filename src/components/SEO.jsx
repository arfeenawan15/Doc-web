import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, keywords, url }) {
  const siteName = "Dr. Waqas Ahmad Awan | Pediatric Surgeon";
  const fullTitle = title === siteName ? title : `${title} | Dr. Waqas Ahmad Awan`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content="https://drwaqasawan.com/assets/logo.png" />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      {url && <meta property="twitter:url" content={url} />}
      <meta property="twitter:title" content={fullTitle} />
      {description && <meta property="twitter:description" content={description} />}
      <meta property="twitter:image" content="https://drwaqasawan.com/assets/logo.png" />
      
      {/* Canonical Link */}
      {url && <link rel="canonical" href={url} />}
    </Helmet>
  );
}
