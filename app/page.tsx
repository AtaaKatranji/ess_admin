"use client";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Assuming you're using shadcn UI

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen space-y-4">
        <div className="absolute inset-0 z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="backgroundGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" style={{ stopColor: "#f3f4f7", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#e1e5ee", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#backgroundGradient)" />

          <circle cx="150" cy="150" r="120" fill="#5a9bd5" opacity="0.2" />
          <rect x="800" y="100" width="400" height="400" rx="100" ry="100" fill="#ffcc00" opacity="0.2" />

          <circle cx="300" cy="600" r="50" fill="#90caf9" />
          <rect x="270" y="650" width="60" height="100" fill="#90caf9" />

          <polygon points="500,50 650,150 500,250" fill="#7b9fd4" opacity="0.15" />
          <circle cx="950" cy="500" r="200" fill="#f95d6a" opacity="0.1"/>

          <circle cx="1400" cy="250" r="120" fill="#5a9bd5" opacity="0.2"/>
          <rect x="800" y="100" width="400" height="400" rx="100" ry="100" fill="#ffcc00" opacity="0.2"/>

          <polygon points="500,50 650,150 500,250" fill="#7b9fd4" opacity="0.15" />
          <circle cx="950" cy="500" r="200" fill="#f95d6a" opacity="0.1" />

          <path d="M0 700 Q400 800 800 700 Q1200 600 1600 700 V800 H0 Z" fill="#cfd8dc" />
        </svg>
      </div>
      <div className='absolute flex flex-col bg-slate-100 rounded-xl shadow-md font-bold font-mono text-xl  items-center justify-center w-full max-w-md p-4 space-y-4 '>
      <div>Welcome to the EES Admin Dashboard</div>
      <Button onClick={() => router.push('/login')}>Sign In</Button>
      </div>
    </div>
  );
}