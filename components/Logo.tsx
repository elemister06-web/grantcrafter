import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
}

export default function Logo({ size = "md", href = "/" }: LogoProps) {
  const scales = { sm: 0.7, md: 1, lg: 1.4 };
  const s = scales[size];
  const w = Math.round(44 * s);
  const h = Math.round(44 * s);

  const icon = (
    <svg
      width={w}
      height={h}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Magnifying glass — dark green outer ring */}
      <circle cx="19" cy="19" r="14.5" fill="#166534" />
      {/* Magnifying glass — medium green ring */}
      <circle cx="19" cy="19" r="11.5" fill="#16a34a" />
      {/* Magnifying glass — light green lens */}
      <circle cx="19" cy="19" r="9" fill="#dcfce7" />
      {/* Dollar sign */}
      <text x="19" y="24" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontSize="15" fontWeight="900" fill="#166534">$</text>
      {/* Handle */}
      <rect x="27.5" y="27" width="12.5" height="4.5" rx="2.25" fill="#166534" transform="rotate(45 27.5 27)" />
    </svg>
  );

  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-xl";

  const content = (
    <div className="flex items-center gap-2.5">
      <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100">
        {icon}
      </div>
      <div className={`flex items-baseline gap-0 ${textSize} font-black tracking-tight`}>
        <span className="text-green-700">Grant</span>
        <span className="text-gray-900">Crafter</span>
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="flex items-center group">
      {content}
    </Link>
  );
}
