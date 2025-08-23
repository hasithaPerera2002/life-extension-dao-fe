
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export const InsuranceBotAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create bots with random positions
  const bots = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    size: Math.random() * 8 + 4,
    duration: Math.random() * 2 + 1,
    delay: Math.random() * 0.5,
  }));

  return (
    <div className="relative w-full h-60 overflow-hidden rounded-lg" ref={containerRef}>
      {/* Blood vessel background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-900/30 to-rose-950/50">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full opacity-20"
        >
          <path
            d="M0,50 Q25,30 50,50 T100,50"
            stroke="rgba(220, 38, 38, 0.6)"
            strokeWidth="8"
            fill="none"
          />
          <path
            d="M0,30 Q35,70 70,30 T100,30"
            stroke="rgba(220, 38, 38, 0.4)"
            strokeWidth="6"
            fill="none"
          />
          <path
            d="M0,70 Q45,20 75,70 T100,70" 
            stroke="rgba(220, 38, 38, 0.5)"
            strokeWidth="7"
            fill="none"
          />
        </svg>
      </div>

      {/* Microscopic bots */}
      <div className="absolute inset-0">
        {bots.map((bot) => (
          <motion.div
            key={bot.id}
            className="absolute rounded-md bg-dao-primary shadow-lg shadow-dao-primary/30"
            style={{
              left: `${bot.initialX}%`,
              top: `${bot.initialY}%`,
              width: `${bot.size}px`,
              height: `${bot.size}px`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0],
              x: [0, -10, 10, 0],
              y: [0, 10, -10, 0],
            }}
            transition={{
              duration: bot.duration,
              delay: bot.delay,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        ))}

        {/* Hexagonal bots */}
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`hex-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{
              duration: Math.random() * 3 + 2,
              delay: Math.random() * 1,
              repeat: Infinity,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <polygon
                points="10,1 17,5.5 17,14.5 10,19 3,14.5 3,5.5"
                fill="none"
                stroke="rgba(0, 255, 148, 0.7)"
                strokeWidth="1"
              />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Morphing to policy document animation */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatDelay: 2 }}
      >
        <motion.div 
          className="w-32 h-40 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex flex-col items-center justify-center p-4 shadow-xl"
          initial={{ scale: 0.2, rotateY: 90 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ duration: 1, delay: 4.5, repeat: Infinity, repeatDelay: 7 }}
        >
          <div className="w-full border-b border-white/20 mb-2">
            <div className="w-full h-3 bg-dao-primary/30 rounded mb-1"></div>
            <div className="w-3/4 h-3 bg-dao-primary/30 rounded mb-1"></div>
            <div className="w-1/2 h-3 bg-dao-primary/30 rounded mb-2"></div>
          </div>
          
          <div className="w-full flex-1 flex flex-col space-y-1">
            <div className="w-full h-2 bg-white/20 rounded"></div>
            <div className="w-3/4 h-2 bg-white/20 rounded"></div>
            <div className="w-5/6 h-2 bg-white/20 rounded"></div>
          </div>
          
          <motion.div 
            className="mt-4 h-10 w-10 rounded-full bg-dao-primary/20 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 5, repeat: Infinity, repeatDelay: 7 }}
          >
            <Check className="text-dao-primary" size={24} />
          </motion.div>
          
          <motion.div 
            className="text-xs text-dao-primary font-medium mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 5.2, repeat: Infinity, repeatDelay: 7 }}
          >
            COVERED
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
