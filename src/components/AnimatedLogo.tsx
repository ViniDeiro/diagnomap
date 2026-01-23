import React from 'react'
import { motion } from 'framer-motion'

export const AnimatedLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 425 231"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="paint0_linear_9_82" x1="8" y1="129.001" x2="412" y2="126.001" gradientUnits="userSpaceOnUse">
            <stop stopColor="#195AB9"/>
            <stop offset="0.0746577" stopColor="#186AC0"/>
            <stop offset="0.14447" stopColor="#1C8AD5"/>
            <stop offset="0.27989" stopColor="#24AED7"/>
            <stop offset="0.366537" stopColor="#22B3DA"/>
            <stop offset="0.428709" stopColor="#24BCDB"/>
            <stop offset="0.468127" stopColor="#28C2DB"/>
            <stop offset="0.539997" stopColor="#2CC9DF"/>
            <stop offset="0.718021" stopColor="#2DCCE2"/>
            <stop offset="1" stopColor="#2FD0E1"/>
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Linha do ECG que se desenha */}
        <motion.path
          d="M8 131.501H49.6401C50.4608 131.501 51.1982 130.999 51.5 130.236L67.7815 89.0534C67.8519 88.8752 68.1085 88.8885 68.1601 89.0731L87.7869 159.239C87.8428 159.439 88.1287 159.432 88.1745 159.229L104 89.2507L112.5 49.3757L121 9.50073M121.5 8.00073L146 221.001M146.5 222.501L175.921 94.3461C175.943 94.2478 176.081 94.241 176.113 94.3366L194.354 148.579C194.618 149.365 195.669 149.507 196.131 148.819L213.203 123.443C213.389 123.166 213.7 123.001 214.032 123.001H394"
          stroke="url(#paint0_linear_9_82)"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 2.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
            repeatDelay: 3
          }}
          filter="url(#glow)"
        />

        {/* Seta/Ponta final que pulsa */}
        <motion.path
          d="M381.492 145.307L386.45 123.222C386.483 123.076 386.483 122.925 386.449 122.78L381.499 101.179C381.306 100.337 382.2 99.663 382.957 100.081L422.929 122.134C423.615 122.513 423.619 123.497 422.937 123.881L382.959 146.397C382.204 146.823 381.303 146.152 381.492 145.307Z"
          fill="#2FD0E1"
          stroke="#2ECFE2"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 2.5, // Aparece logo após o traço terminar
            duration: 0.5,
            type: "spring",
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 5
          }}
        />
      </svg>
    </div>
  )
}
