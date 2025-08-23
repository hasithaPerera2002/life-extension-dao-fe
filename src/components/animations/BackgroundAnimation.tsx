
import React from 'react';

export const BackgroundAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Animated data points */}
      <div className="data-points">
        {Array.from({ length: 15 }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-dao-primary rounded-full" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.3 + (Math.random() * 0.4),
              animation: `pulse 3s infinite ${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Connection lines between data points */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0, 255, 148, 0)" />
            <stop offset="50%" stopColor="rgba(0, 255, 148, 0.2)" />
            <stop offset="100%" stopColor="rgba(0, 255, 148, 0)" />
          </linearGradient>
        </defs>
        <path 
          d="M0,50 Q25,25 50,50 T100,50" 
          fill="none" 
          stroke="url(#line-gradient)" 
          strokeWidth="0.5" 
          className="moving-path"
        />
        <path 
          d="M0,70 Q40,40 60,80 T100,60" 
          fill="none" 
          stroke="url(#line-gradient)" 
          strokeWidth="0.5" 
          className="moving-path"
          style={{ animationDelay: '1s' }}
        />
        <path 
          d="M20,20 Q40,60 70,30 T90,40" 
          fill="none" 
          stroke="url(#line-gradient)" 
          strokeWidth="0.5" 
          className="moving-path"
          style={{ animationDelay: '2s' }}
        />
      </svg>

      {/* Ambient glow effects */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-dao-primary/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-dao-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-dao-tertiary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
  );
};
