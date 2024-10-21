// components/BackgroundSVG.js
const BackgroundSVG = () => (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
        {/* Background Gradient */}
        <defs>
          <linearGradient id="backgroundGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: '#f3f4f7', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#e1e5ee', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#backgroundGradient)" />
  
        {/* Abstract Shapes */}
        <circle cx="150" cy="150" r="120" fill="#5a9bd5" opacity="0.2"/>
        <rect x="800" y="100" width="400" height="400" rx="100" ry="100" fill="#ffcc00" opacity="0.2"/>
  
        {/* Shapes for Professional Touch */}
        <polygon points="500,50 650,150 500,250" fill="#7b9fd4" opacity="0.15" />
        <circle cx="950" cy="500" r="200" fill="#f95d6a" opacity="0.1"/>
  
       
  
        {/* Employee Icon (Abstract) */}
        <circle cx="300" cy="600" r="50" fill="#90caf9" />
        <rect x="270" y="650" width="60" height="100" fill="#90caf9" />
  
        {/* Additional Abstract Lines */}
        <line x1="1200" y1="50" x2="1400" y2="200" stroke="#ffcc80" strokeWidth="8" opacity="0.5" />
        <line x1="1100" y1="500" x2="1300" y2="600" stroke="#4fc3f7" strokeWidth="6" opacity="0.5" />
      </svg>
      {/* Your other components can go here */}
      <div style={{ position: 'relative', zIndex: 1 }}>
      </div>
    </div>
  );
  
  export default BackgroundSVG;
  