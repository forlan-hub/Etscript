import type { DocumentTemplate } from "@/lib/templates";

interface PageProps {
  w: number;
  h: number;
}

function ClassicPage({ w, h }: PageProps) {
  const lines = [92, 80, 88, 72, 90, 76, 86, 68, 84];
  return (
    <svg viewBox="0 0 88 112" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
      <rect width="88" height="112" fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
      <text x="44" y="19" textAnchor="middle" fontFamily="Georgia,serif" fontSize="5.5" fontWeight="bold" fill="#1c1917">Chapter One</text>
      <line x1="24" y1="23" x2="64" y2="23" stroke="#d1d5db" strokeWidth="0.5" />
      {lines.map((pct, i) => (
        <rect key={i} x="6" y={28 + i * 7} width={pct * 0.76} height="2.5" rx="0.5" fill="#d1d5db" />
      ))}
      <text x="44" y="107" textAnchor="middle" fontFamily="Georgia,serif" fontSize="4" fill="#9ca3af">1</text>
    </svg>
  );
}

function ModernPage({ w, h }: PageProps) {
  const lines = [90, 78, 86, 70, 88, 74, 82, 66];
  return (
    <svg viewBox="0 0 88 112" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
      <rect width="88" height="112" fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
      <text x="6" y="15" fontFamily="Arial,sans-serif" fontSize="5" fontWeight="bold" fill="#374151" letterSpacing="1.8">CHAPTER 1</text>
      <line x1="6" y1="19" x2="52" y2="19" stroke="#374151" strokeWidth="1" />
      {lines.map((pct, i) => (
        <rect key={i} x="6" y={25 + i * 7} width={pct * 0.76} height="2.5" rx="0.5" fill="#d1d5db" />
      ))}
      <text x="82" y="107" textAnchor="end" fontFamily="Arial,sans-serif" fontSize="4" fill="#9ca3af">1</text>
    </svg>
  );
}

function PremiumPage({ w, h }: PageProps) {
  const lines = [92, 82, 88, 74, 90, 78, 86];
  return (
    <svg viewBox="0 0 88 112" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
      <rect width="88" height="112" fill="#fffbf4" stroke="#f0e6d3" strokeWidth="0.5" />
      <text x="44" y="18" textAnchor="middle" fontFamily="Georgia,serif" fontSize="5.5" fontWeight="bold" fill="#1c1917">Chapter One</text>
      <text x="44" y="26" textAnchor="middle" fontFamily="serif" fontSize="8" fill="#d97706">✦</text>
      {lines.map((pct, i) => (
        <rect key={i} x="6" y={32 + i * 7.5} width={pct * 0.76} height="2.5" rx="0.5" fill="#e9d5a8" />
      ))}
      <text x="44" y="107" textAnchor="middle" fontFamily="Georgia,serif" fontSize="4" fill="#d97706">1</text>
    </svg>
  );
}

function AcademicPage({ w, h }: PageProps) {
  const lines = [88, 76, 84, 70, 82, 74, 80, 66, 78];
  return (
    <svg viewBox="0 0 88 112" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
      <rect width="88" height="112" fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
      <rect width="88" height="9" fill="#f3f4f6" />
      <text x="6" y="6.5" fontFamily="Times New Roman,serif" fontSize="3.5" fill="#6b7280">RUNNING HEAD: TITLE</text>
      <text x="82" y="6.5" textAnchor="end" fontFamily="Times New Roman,serif" fontSize="3.5" fill="#6b7280">1</text>
      <text x="44" y="20" textAnchor="middle" fontFamily="Times New Roman,serif" fontSize="6" fontWeight="bold" fill="#111827">Chapter Title</text>
      {lines.map((pct, i) => (
        <rect key={i} x="6" y={26 + i * 8} width={pct * 0.76} height="2.5" rx="0.5" fill="#d1d5db" />
      ))}
      <line x1="6" y1="101" x2="38" y2="101" stroke="#d1d5db" strokeWidth="0.5" />
      <rect x="6" y="104" width="70" height="2" rx="0.5" fill="#e5e7eb" />
    </svg>
  );
}

function BusinessPage({ w, h }: PageProps) {
  const lines = [86, 74, 82, 68, 80, 72, 78, 64];
  return (
    <svg viewBox="0 0 88 112" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
      <rect width="88" height="112" fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
      <rect width="88" height="16" fill="#1e293b" />
      <text x="44" y="9" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="5.5" fontWeight="bold" fill="white">SECTION TITLE</text>
      <text x="44" y="14" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="3.5" fill="#94a3b8">Business Report</text>
      <line x1="6" y1="22" x2="82" y2="22" stroke="#e2e8f0" strokeWidth="0.5" />
      {lines.map((pct, i) => (
        <rect key={i} x="6" y={26 + i * 7} width={pct * 0.76} height="2.5" rx="0.5" fill="#d1d5db" />
      ))}
      <text x="82" y="107" textAnchor="end" fontFamily="Arial,sans-serif" fontSize="3.5" fill="#94a3b8">2</text>
    </svg>
  );
}

function LetterPage({ w, h }: PageProps) {
  return (
    <svg viewBox="0 0 88 112" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
      <rect width="88" height="112" fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
      <text x="6" y="11" fontFamily="Arial,sans-serif" fontSize="5.5" fontWeight="bold" fill="#1e293b">COMPANY NAME</text>
      <text x="6" y="16" fontFamily="Arial,sans-serif" fontSize="3" fill="#6b7280">info@company.com · +234 800 000 0000</text>
      <line x1="6" y1="19" x2="82" y2="19" stroke="#d1d5db" strokeWidth="0.5" />
      <text x="6" y="26" fontFamily="Arial,sans-serif" fontSize="3.5" fill="#6b7280">June 17, 2026</text>
      <rect x="6" y="30" width="46" height="2.5" rx="0.5" fill="#e5e7eb" />
      <rect x="6" y="35" width="36" height="2" rx="0.5" fill="#e5e7eb" />
      <text x="6" y="44" fontFamily="Arial,sans-serif" fontSize="3.5" fill="#374151">Dear [Recipient Name],</text>
      {[88, 78, 84, 72, 80].map((pct, i) => (
        <rect key={i} x="6" y={49 + i * 7} width={pct * 0.76} height="2.5" rx="0.5" fill="#d1d5db" />
      ))}
      <text x="6" y="93" fontFamily="Arial,sans-serif" fontSize="3.5" fill="#374151">Sincerely,</text>
      <rect x="6" y="101" width="38" height="1.5" rx="0.5" fill="#e5e7eb" />
      <rect x="6" y="105" width="28" height="2" rx="0.5" fill="#e5e7eb" />
    </svg>
  );
}

type ThumbnailSize = "sm" | "md" | "lg";
const SIZES: Record<ThumbnailSize, [number, number]> = {
  sm: [88, 112],
  md: [110, 140],
  lg: [176, 224],
};

interface Props {
  template: DocumentTemplate;
  size?: ThumbnailSize;
  className?: string;
}

export function TemplateThumbnail({ template, size = "sm", className = "" }: Props) {
  const [w, h] = SIZES[size];
  const { suite, defaultTheme } = template;

  const pageProps = { w, h };

  let page: React.ReactNode;
  if (suite === "letters") {
    page = <LetterPage {...pageProps} />;
  } else if (suite === "academic") {
    page = <AcademicPage {...pageProps} />;
  } else if (suite === "business") {
    page = <BusinessPage {...pageProps} />;
  } else if (defaultTheme === "premium") {
    page = <PremiumPage {...pageProps} />;
  } else if (defaultTheme === "modern") {
    page = <ModernPage {...pageProps} />;
  } else {
    page = <ClassicPage {...pageProps} />;
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ width: w, height: h }}>
      {page}
    </div>
  );
}
