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
      {/* Warehouse body */}
      <rect x="4" y="22" width="36" height="18" rx="1.5" fill="#15803d" />
      {/* Warehouse roof — angled like a classic warehouse */}
      <path d="M2 23 L22 10 L42 23" stroke="#15803d" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      {/* Loading dock door */}
      <rect x="16" y="30" width="12" height="10" rx="1" fill="white" opacity="0.9" />
      {/* Door lines — detail */}
      <line x1="22" y1="30" x2="22" y2="40" stroke="#15803d" strokeWidth="0.8" opacity="0.5" />
      <line x1="16" y1="35" x2="28" y2="35" stroke="#15803d" strokeWidth="0.8" opacity="0.5" />

      {/* DMB Fire Dancer — stylized figure rising from the roofline */}
      {/* Head */}
      <circle cx="22" cy="5.5" r="2" fill="#f59e0b" />
      {/* Body — arched, dancing feel */}
      <path
        d="M22 7.5 C20 9 19 11 20 13"
        stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" fill="none"
      />
      {/* Left arm — raised, flame-like */}
      <path
        d="M21 9.5 C18 8 16 6 17 4 C17.5 5.5 19 6 20 8"
        stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" fill="none"
      />
      {/* Right arm — raised other side */}
      <path
        d="M22 9.5 C25 8 27 6 26 4 C25.5 5.5 24 6 23 8"
        stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" fill="none"
      />
      {/* Left leg — spread, dancer pose */}
      <path
        d="M20 13 C18.5 15.5 17 17 15.5 17.5"
        stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" fill="none"
      />
      {/* Right leg */}
      <path
        d="M20 13 C21 15.5 22.5 17 24 17"
        stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" fill="none"
      />
      {/* Small windows — warehouse detail */}
      <rect x="7" y="26" width="5" height="4" rx="0.5" fill="white" opacity="0.6" />
      <rect x="32" y="26" width="5" height="4" rx="0.5" fill="white" opacity="0.6" />
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
