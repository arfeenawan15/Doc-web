import { Helmet } from 'react-helmet-async';

const DEFAULT_TITLE = "Dr. Waqas Ahmad Awan | Best Child Surgeon & Child Specialist in Mian Channu (بچوں کا ڈاکٹر اور سرجن)";
const DEFAULT_DESC = "Dr. Waqas Ahmad Awan (MBBS, MS) is the top Child Surgeon & Child Specialist in Mian Channu and Multan. Leading Bachon Ka Doctor & Bachon Ka Surgeon at Al Manzoor Hospital Mian Channu every Sunday. Specialized in neonatal surgery, pediatric urology, hernia, hydrocephalus, and circumcision. Call: +92 309 8683232.";
const DEFAULT_KEYWORDS = "Dr Waqas Ahmad Awan, dr waqas awan, child surgeon in mian channu, child specialist in mian channu, bachon ka doctor mian channu, bachon ka surgeon mian channu, bachon ka doctor mian chanuu, bachon ka surgeon mian chanuu, best child specialist in mian channu, best pediatric surgeon in mian channu, pediatric surgeon near me, al manzoor hospital mian channu child specialist, sughran wazeer hospital multan child surgeon, neonatal surgeon mian channu, pediatric urologist mian channu, bachon ke amraz ke doctor, bachon ka mahir jarah, بچوں کا ڈاکٹر میاں چنوں, بچوں کا سرجن میاں چنوں";
const BASE_URL = "https://drwaqasahmadawan.vercel.app";

export default function SEO({ 
  title = DEFAULT_TITLE, 
  description = DEFAULT_DESC, 
  keywords = DEFAULT_KEYWORDS, 
  url = BASE_URL, 
  noIndex = false 
}) {
  const fullTitle = title.includes("Dr. Waqas") ? title : `${title} | Dr. Waqas Ahmad Awan`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${BASE_URL}/assets/pic1.png`} />
      <meta property="og:site_name" content="Dr. Waqas Ahmad Awan Clinic" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${BASE_URL}/assets/pic1.png`} />
      
      {/* Canonical Link */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
