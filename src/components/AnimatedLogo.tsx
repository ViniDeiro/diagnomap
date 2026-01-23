import React from 'react'
import { motion } from 'framer-motion'

export const AnimatedLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 200 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Símbolo Médico Estilizado (Cruz + Pulso) */}
        <g transform="translate(10, 10) scale(0.8)">
          <motion.path
            d="M10 20 H 20 L 25 5 L 35 35 L 40 20 H 50"
            stroke="url(#pulseGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: 1,
              strokeDashoffset: [0, -100] // Efeito de fluxo contínuo
            }}
            transition={{
              pathLength: { duration: 1.5, ease: "easeInOut" },
              opacity: { duration: 0.5 },
              strokeDashoffset: { duration: 3, repeat: Infinity, ease: "linear" } // Animação de fluxo
            }}
            filter="url(#glow)"
          />
          
          {/* Círculo Pulsante */}
          <motion.circle
            cx="30"
            cy="20"
            r="18"
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.9, 1.1, 0.9],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </g>

        {/* Texto "Diagno" */}
        <text
          x="60"
          y="38"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontWeight="800"
          fontSize="28"
          fill="#1e293b"
          letterSpacing="-0.5"
        >
          Diagno
        </text>

        {/* Texto "Map" com gradiente */}
        <text
          x="155"
          y="38"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontWeight="800"
          fontSize="28"
          fill="url(#pulseGradient)"
          letterSpacing="-0.5"
        >
          Map
        </text>
        
        {/* Ponto final decorativo */}
        <motion.circle
          cx="215"
          cy="38"
          r="3"
          fill="#06b6d4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
        />
      </svg>
    </div>
  )
}
