import { AdminDashboard } from "@/app/components/admin-dashboard"

export default function HomePage() {
  return (
    <div className="min-h-screen h-screen overflow-y-auto">
      {/* SVG background code */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            {/* Soft diagonal gradient */}
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#eef3f8" />
              <stop offset="100%" stopColor="#dbe6f3" />
            </linearGradient>

            {/* Very subtle grid */}
            <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M64 0H0V64" fill="none" stroke="#1e3a8a" strokeOpacity="0.04" strokeWidth="1" />
            </pattern>

            {/* Gentle wave gradient */}
            <linearGradient id="wave" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>

            {/* Glow blobs */}
            <radialGradient id="blobBlue" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="blobTeal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Base gradient */}
          <rect x="0" y="0" width="100%" height="100%" fill="url(#bg)" />

          {/* Subtle grid overlay */}
          <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />

          {/* Soft blobs (top-right / bottom-left) */}
          <circle cx="82%" cy="18%" r="280" fill="url(#blobBlue)" />
          <circle cx="12%" cy="78%" r="220" fill="url(#blobTeal)" />

          {/* Abstract waves (bottom) */}
          <path d="M0,70% C20%,66% 32%,76% 50%,72% C68%,68% 80%,76% 100%,72% L100%,100% L0,100% Z" fill="url(#wave)" />
          <path d="M0,78% C18%,74% 36%,86% 52%,82% C70%,78% 86%,88% 100%,82% L100%,100% L0,100% Z" fill="url(#wave)" />

          {/* Faint, relevant icons */}
          <g opacity="0.06" fill="none" stroke="#0f172a" strokeWidth="2">
            {/* Calendar (top-left) */}
            <rect x="7%" y="12%" rx="10" ry="10" width="140" height="110" />
            <line x1="7%" y1="18%" x2="16.5%" y2="18%" />
            <line x1="9%" y1="12%" x2="9%" y2="18%" />
            <line x1="14%" y1="12%" x2="14%" y2="18%" />
            <rect x="8.5%" y="21%" width="18" height="14" rx="3" />
            <rect x="11.5%" y="21%" width="18" height="14" rx="3" />
            <rect x="14.5%" y="21%" width="18" height="14" rx="3" />
            <rect x="8.5%" y="24%" width="18" height="14" rx="3" />
            <rect x="11.5%" y="24%" width="18" height="14" rx="3" />

            {/* Clock (right side) */}
            <circle cx="88%" cy="36%" r="70" />
            <line x1="88%" y1="36%" x2="88%" y2="26%" />
            <line x1="88%" y1="36%" x2="94%" y2="36%" />

            {/* Building (bottom-right) */}
            <rect x="78%" y="68%" width="220" height="140" rx="8" />
            <rect x="80%" y="72%" width="28" height="28" rx="4" />
            <rect x="84%" y="72%" width="28" height="28" rx="4" />
            <rect x="88%" y="72%" width="28" height="28" rx="4" />
            <rect x="80%" y="78%" width="28" height="28" rx="4" />
            <rect x="84%" y="78%" width="28" height="28" rx="4" />
            <rect x="88%" y="78%" width="28" height="28" rx="4" />
            <rect x="92%" y="78%" width="28" height="60" rx="4" />
          </g>
        </svg>
      </div>
      <AdminDashboard />
    </div>
  )
}
