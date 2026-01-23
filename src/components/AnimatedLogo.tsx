import React from 'react'
import { motion } from 'framer-motion'

export const AnimatedLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center ${className || ''}`}>
      {/* Símbolo (ECG + Seta) */}
      <div className="relative w-full max-w-[160px] sm:max-w-[200px] h-auto aspect-[2/1] mr-4">
      <svg
        viewBox="0 0 425 231"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="paint0_linear_final" x1="8" y1="129.001" x2="412" y2="126.001" gradientUnits="userSpaceOnUse">
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
          <filter id="glow_final" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grupo de Elementos Estáticos (Texto, Ícones) - Fade In Suave */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1.0 }}
        >
          {/* Olho/Símbolo Superior */}
          <path d="M306.543 75.4784C309.583 72.4513 317.278 72.0228 328.999 72.0016C329.551 72.0006 330 72.4484 330 73.0007V79.5877C330 79.8522 329.892 80.1095 329.705 80.2969C323.222 86.8058 321.382 88.6513 316.937 89.694C313.81 90.4274 307.443 89.3013 305.5 85.5007C303.557 81.7001 304.188 77.8232 306.543 75.4784Z" fill="#0F437D" stroke="#0F437D"/>
          <path d="M313 77.3308C314.592 75.7541 319.142 75.5171 325.278 75.5016C325.709 75.5005 326.092 75.7762 326.228 76.1845L326.804 77.9139C326.924 78.2735 326.83 78.671 326.561 78.9376C323.23 82.2332 320.788 84.2778 318.5 84.8115C316.845 85.1975 313.849 84.7998 312.5 83.0007C311 81.0007 311.754 78.5647 313 77.3308Z" fill="#F5F5F5" stroke="#F5F5F5"/>
          
          {/* Letras "Diagno" e Ícones */}
          <path d="M237 55C214.5 47 211.966 57.9899 212.5 62C212.839 64.5427 215.952 67.6928 223 69.5C232.75 72 236.318 74.2725 235.5 80C235 83.5 227.5 92 208.5 83M251.5 59.5V89M292 59.5V89C292 94 285.972 97.2206 282 97.826C277.917 98.4482 273 97.5 266 94M328.5 89.5V71C328.5 68.2701 327.702 66.4423 326.5 65.2127M307.5 159V176.501M307.5 188.5V176.501M267 147.5V189M229.5 189V171.5M229.5 148.501V153M255.5 153H229.5M229.5 153V171.5M253 171.5H229.5M285 159C285 175.501 283.5 182.501 289.5 184.786C296.208 187.341 305.5 180.501 307.5 176.501M356.491 173.914C356.491 163.914 365.728 161.195 369.491 161.433C373.055 161.659 381.491 163.414 381.491 173.914C381.491 184.414 373.055 186.169 369.491 186.395C365.728 186.633 356.491 183.914 356.491 173.914ZM359.491 74.0199C359.491 64.0199 368.728 61.3012 372.491 61.5392C376.055 61.7647 384.491 63.5199 384.491 74.0199C384.491 84.5199 376.055 86.2753 372.491 86.5007C368.728 86.7388 359.491 84.0199 359.491 74.0199Z" stroke="#0F437D" strokeWidth="9"/>
          <path d="M252.2 54.9957C250.695 55.0814 247 54.1022 247 50.5007C247 46.8992 250.695 45.9201 252.2 46.0058C253.625 46.087 257 46.7192 257 50.5007C257 54.2823 253.625 54.9145 252.2 54.9957Z" fill="#0F437D" stroke="#0F437D"/>
          <path d="M306.564 64.5966C307.188 65.5327 307.812 66.4688 308.436 67.4048C308.731 67.2643 309.024 67.1349 309.322 67.0103C313.199 65.3366 318.407 65.01 321.082 66.1321C321.382 66.3945 322.528 67.2796 323.146 68.0827C323.295 68.2664 323.427 68.4507 323.507 68.5978C325.638 66.4861 327.768 64.3743 329.899 62.2625C329.491 61.9179 329.103 61.636 328.718 61.3761C326.988 60.2787 325.549 59.4333 322.918 58.8694C316.215 58.4555 311.681 60.7688 307.442 63.875C307.141 64.1099 306.852 64.3482 306.564 64.5966Z" fill="#0F437D"/>
          <path d="M277 63.0126C280.136 62.8126 287 65.0973 287 73.5007C287 81.9041 280.136 84.1889 277 83.9889C274.03 83.7995 267 82.3243 267 73.5007C267 64.6772 274.03 63.202 277 63.0126Z" stroke="#0F437D" strokeWidth="9"/>
          <circle cx="279.5" cy="73.5007" r="8.5" fill="#F5F5F5"/>
          <path d="M303 172.001C303 180.001 303.5 181.232 300.5 183.001C296.984 185.074 292.201 183.385 290.5 180.501C288.799 177.616 290.271 173.597 293.787 171.524C297.304 169.45 301.299 169.116 303 172.001Z" fill="#F5F5F5"/>
          <path d="M305.242 63.2544C305.945 64.1323 306.649 65.0102 307.352 65.888C307.631 65.7247 307.91 65.5792 308.198 65.4447C312.22 63.5899 316.88 64.4259 321.073 66.1709C321.358 66.4157 322.492 67.2726 323.116 68.0576C323.276 68.2499 323.421 68.444 323.507 68.5978C325.638 66.486 327.768 64.3743 329.899 62.2625C329.47 61.8967 329.063 61.6002 328.658 61.3266C326.956 60.2446 325.536 59.3998 322.927 58.8305C317.376 58.0503 310.838 58.5142 306.176 62.3981C305.85 62.6712 305.542 62.9542 305.242 63.2544Z" fill="#0F437D"/>
          <path d="M327.5 159.001H318L329 173.501L318 189.001H327.5L334 180.001L340.5 189.001H350L339 173.501L350 159.001H340.5L334 168.001L327.5 159.001Z" fill="#0F437D" stroke="#0F437D"/>
        </motion.g>

        {/* Linha do ECG - Animação de Desenho */}
        <motion.path
          d="M8 131.501H49.6401C50.4608 131.501 51.1982 130.999 51.5 130.236L67.7815 89.0534C67.8519 88.8752 68.1085 88.8885 68.1601 89.0731L87.7869 159.239C87.8428 159.439 88.1287 159.432 88.1745 159.229L104 89.2507L112.5 49.3757L121 9.50073M121.5 8.00073L146 221.001M146.5 222.501L175.921 94.3461C175.943 94.2478 176.081 94.241 176.113 94.3366L194.354 148.579C194.618 149.365 195.669 149.507 196.131 148.819L213.203 123.443C213.389 123.166 213.7 123.001 214.032 123.001H394"
          stroke="url(#paint0_linear_final)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 1.8,
            ease: "easeInOut",
            repeat: 0 // Uma vez só
          }}
          filter="url(#glow_final)"
        />

        {/* Seta/Ponta final - Sincronizada com o traço */}
        <motion.path
          d="M381.492 145.307L386.45 123.222C386.483 123.076 386.483 122.925 386.449 122.78L381.499 101.179C381.306 100.337 382.2 99.663 382.957 100.081L422.929 122.134C423.615 122.513 423.619 123.497 422.937 123.881L382.959 146.397C382.204 146.823 381.303 146.152 381.492 145.307Z"
          fill="#2FD0E1"
          stroke="#2ECFE2"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ opacity: 0, scale: 0.5, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{
            delay: 1.7, // Aparece logo quando o traço chega no fim
            duration: 0.4,
            type: "spring",
            bounce: 0.4,
            repeat: 0
          }}
        />
      </svg>
      </div>

      {/* Texto "Siga o Fluxo" */}
      <motion.div
        className="flex flex-col justify-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 leading-none">
          Siga o
        </h1>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 leading-none">
          Fluxo
        </h1>
      </motion.div>
    </div>
  )
}
