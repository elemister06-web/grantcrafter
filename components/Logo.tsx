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
      {/* Warehouse main roof — wide flat industrial style */}
      <path d="M2 20 L4 14 L40 14 L42 20 Z" fill="#166534" />
      {/* Roof ridge cap */}
      <rect x="4" y="13" width="36" height="3" rx="1" fill="#15803d" />
      {/* Rooftop vents — industrial detail */}
      <rect x="10" y="10" width="4" height="4" rx="0.5" fill="#166534" />
      <rect x="20" y="9" width="4" height="5" rx="0.5" fill="#166534" />
      <rect x="30" y="10" width="4" height="4" rx="0.5" fill="#166534" />
      {/* Warehouse body */}
      <rect x="2" y="20" width="40" height="22" rx="1" fill="#15803d" />
      {/* Large loading dock door — center */}
      <rect x="14" y="28" width="16" height="14" rx="1.5" fill="white" opacity="0.95" />
      {/* Dock door horizontal panels */}
      <line x1="14" y1="32" x2="30" y2="32" stroke="#d1fae5" strokeWidth="1" />
      <line x1="14" y1="36" x2="30" y2="36" stroke="#d1fae5" strokeWidth="1" />
      <line x1="14" y1="40" x2="30" y2="40" stroke="#d1fae5" strokeWidth="1" />
      {/* Dock bumper */}
      <rect x="13" y="40" width="18" height="2" rx="0.5" fill="#bbf7d0" opacity="0.6" />
      {/* Left window */}
      <rect x="5" y="24" width="6" height="5" rx="0.5" fill="white" opacity="0.7" />
      <line x1="8" y1="24" x2="8" y2="29" stroke="#d1fae5" strokeWidth="0.8" />
      {/* Right window */}
      <rect x="33" y="24" width="6" height="5" rx="0.5" fill="white" opacity="0.7" />
      <line x1="36" y1="24" x2="36" y2="29" stroke="#d1fae5" strokeWidth="0.8" />
      {/* Ground line */}
      <rect x="0" y="41" width="44" height="2" rx="1" fill="#166534" opacity="0.5" />
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
