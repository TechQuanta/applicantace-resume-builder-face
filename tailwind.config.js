/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}', // Your project files to scan for Tailwind classes
  ],
  darkMode: 'class', // Enable dark mode based on 'class'
  theme: {
    extend: {
      colors: {
        primary: '#1DA1F2',
        secondary: '#14171A',
        // --- Add astonishing theme colors ---
        'cosmic-purple': '#7C3AED',
        'stellar-blue': '#4F46E5',
        'nebula-pink': '#EC4899',
        'galaxy-green': '#10B981',
        'void-black': '#0A0A0A',
        'starlight-white': '#E5E7EB',
        // --- End astonishing theme colors ---
      },
      fontFamily: {
        // --- ASTONISHING FONT ALIASES ---
        headline: ['Oxygen', 'sans-serif'], // Elegant sans-serif for titles, as you preferred
        body: ['Lato', 'sans-serif'],           // Clean sans-serif for main text
        label: ['Montserrat', 'sans-serif'],    // Modern sans-serif for UI/labels
        // --- END ASTONISHING FONT ALIASES ---

        // Your existing individual font definitions (keeping them for completeness,
        // but now 'headline', 'body', 'label' are your primary aliases)
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        'open-sans': ['"Open Sans"', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
        'source-sans-3': ['"Source Sans 3"', 'sans-serif'],
        raleway: ['Raleway', 'sans-serif'],
        merriweather: ['Merriweather', 'serif'],
        lora: ['Lora', 'serif'],
        'noto-sans': ['"Noto Sans"', 'sans-serif'],
        'playfair-display': ['"Playfair Display"', 'serif'],
        ubuntu: ['Ubuntu', 'sans-serif'],
        'crimson-text': ['"Crimson Text"', 'serif'],
        pacifico: ['Pacifico', 'cursive'],
        comfortaa: ['Comfortaa', 'cursive'],
        quicksand: ['Quicksand', 'sans-serif'],
        'indie-flower': ['"Indie Flower"', 'cursive'],
        'bebas-neue': ['"Bebas Neue"', 'sans-serif'],
        'cormorant-garamond': ['"Cormorant Garamond"', 'serif'],
        'fira-sans': ['"Fira Sans"', 'sans-serif'],
        kanit: ['Kanit', 'sans-serif'],
        'josefin-sans': ['"Josefin Sans"', 'sans-serif'],
        lobster: ['Lobster', 'cursive'],
        'abril-fatface': ['"Abril Fatface"', 'cursive'],
        'exo-2': ['"Exo 2"', 'sans-serif'],
        'dancing-script': ['"Dancing Script"', 'cursive'],
        rubik: ['Rubik', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
        vollkorn: ['Vollkorn', 'serif'],
        'pt-sans': ['"PT Sans"', 'sans-serif'],
        'frank-ruhl-libre': ['"Frank Ruhl Libre"', 'serif'],
        'work-sans': ['"Work Sans"', 'sans-serif'],
        bitter: ['Bitter', 'serif'],
        anton: ['Anton', 'sans-serif'],
        archivo: ['Archivo', 'sans-serif'],
        dosis: ['Dosis', 'sans-serif'],
        oxygen: ['Oxygen', 'sans-serif'],
        karla: ['Karla', 'sans-serif'],
        'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
        'encode-sans-condensed': ['"Encode Sans Condensed"', 'sans-serif'],
        muli: ['Muli', 'sans-serif'],
        cabin: ['Cabin', 'sans-serif'],
        'permanent-marker': ['"Permanent Marker"', 'cursive'],
        'shadows-into-light': ['"Shadows Into Light"', 'cursive'],
        'amatic-sc': ['"Amatic SC"', 'cursive'],
        'josefin-slab': ['"Josefin Slab"', 'serif'],
        caveat: ['Caveat', 'cursive'],
        courgette: ['Courgette', 'cursive'],
        satisfy: ['Satisfy', 'cursive'],
        handlee: ['Handlee', 'cursive'],
        arimo: ['Arimo', 'sans-serif'],
        prompt: ['Prompt', 'sans-serif'],
        'ibm-plex-sans': ['"IBM Plex Sans"', 'sans-serif'],
        'slabo-27px': ['"Slabo 27px"', 'serif'],
        'quattrocento-sans': ['"Quattrocento Sans"', 'sans-serif'],
        'rubik-mono-one': ['"Rubik Mono One"', 'sans-serif'],
        'special-elite': ['"Special Elite"', 'cursive'],
        // General sans-serif fallback, prioritizing Google fonts from your existing list
        sans: [
          'Lato', // Primary choice for general sans-serif text (matches 'body')
          'Montserrat', // Good alternative (matches 'label')
          'Roboto',
          '"Open Sans"',
          'Poppins',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        serif: [
          '"Playfair Display"', // Primary choice for general serif text (matches 'headline')
          'Merriweather',
          'Lora',
          'Crimson Text',
          'Cormorant Garamond',
          'Vollkorn',
          'Frank Ruhl Libre',
          'Bitter',
          'Slabo 27px',
          'ui-serif',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'Times',
          'serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      // --- ASTONISHING SHADOWS ---
      boxShadow: {
        'bottom-sm': '0 2px 4px rgba(0, 0, 0, 0.15)',
        'bottom-md': '0 4px 8px rgba(0, 0, 0, 0.25)',
        'bottom-lg': '0 6px 12px rgba(0, 0, 0, 0.35)',
        'dark-bottom-md': '0 4px 8px rgba(0, 0, 0, 0.4)',
        'dark-bottom-lg': '0 6px 16px rgba(0, 0, 0, 0.5)',
        'white-right': '4px 10px 8px rgba(255, 255, 255, 0.5)',
        'purple-right': '4px 10px 8px rgba(57, 57, 57, 0.5)',
        // New glow shadows for astonishing effect
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.7), 0 0 40px rgba(124, 58, 237, 0.4)',
        'glow-purple-lg': '0 0 30px rgba(124, 58, 237, 0.8), 0 0 60px rgba(124, 58, 237, 0.5)',
        'glow-blue': '0 0 20px rgba(79, 70, 229, 0.7), 0 0 40px rgba(79, 70, 229, 0.4)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.7), 0 0 40px rgba(236, 72, 153, 0.4)',
        'glow-teal': '0 0 20px rgba(45, 212, 191, 0.7), 0 0 40px rgba(45, 212, 191, 0.4)',
        'glow-accent': '0 0 15px var(--glow-color-1, #8B5CF6), 0 0 30px var(--glow-color-2, #C084FC)', // Dynamic glow using CSS variables
      },
      // --- ASTONISHING ANIMATIONS ---
      animation: {
        fadeInSlow: 'fadeIn 1.5s ease-out',
        fadeInUp: 'fadeInUp 0.8s ease-out forwards', // Added forwards to keep the final state
        bounceIn: 'bounceIn 0.5s ease-in-out',
        'loading-bar-full': 'loadingBarFull 1.5s linear infinite',
        'spin-slow': 'spin 3s linear infinite', // Slower spin for spinner
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite', // Slower, more subtle pulse for text
        'fade-in-pulse': 'fadeInPulse 1.5s ease-out forwards', // For status messages
        'shake-strong': 'shakeStrong 0.5s cubic-bezier(.36,.07,.19,.97) both', // Stronger shake for errors, `both` to persist
        'float': 'float 3s ease-in-out infinite', // For floating icons
        'ping-light': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite', // Lighter ping for subtle highlights
        'border-pulse': 'borderPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', // Pulsating border effect
        'bg-pan': 'bgPan 10s ease infinite alternate', // Gentle background panning
        'text-glow': 'textGlow 2s ease-in-out infinite alternate', // Text glow
        'scale-pop': 'scalePop 0.4s ease-out forwards', // Quick scale pop
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%, 100%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1)' },
        },
        loadingBarFull: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        // New keyframes for astonishing effects
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.85 }, // Less dramatic pulse
        },
        fadeInPulse: {
          '0%': { opacity: 0, transform: 'scale(0.9)' },
          '50%': { opacity: 1, transform: 'scale(1.02)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        shakeStrong: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-8px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(8px)' },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        borderPulse: {
          '0%, 100%': { boxShadow: '0 0 0px 0px rgba(124, 58, 237, 0.7)' },
          '50%': { boxShadow: '0 0 0px 4px rgba(124, 58, 237, 0.2)' },
        },
        bgPan: {
            '0%': { backgroundPosition: '0% 50%' },
            '100%': { backgroundPosition: '100% 50%' },
        },
        textGlow: {
            '0%, 100%': { textShadow: '0 0 5px rgba(255,255,255,0.4)' },
            '50%': { textShadow: '0 0 15px rgba(255,255,255,0.8), 0 0 20px rgba(124, 58, 237, 0.6)' },
        },
        scalePop: {
            '0%': { transform: 'scale(0.8)', opacity: 0 },
            '100%': { transform: 'scale(1)', opacity: 1 },
        }
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.backdrop-filter-none': {
          backdropFilter: 'none',
        },
        '.backdrop-blur-sm': {
          backdropFilter: 'blur(4px)',
        },
        '.backdrop-blur-md': {
          backdropFilter: 'blur(8px)',
        },
        '.backdrop-blur-lg': {
          backdropFilter: 'blur(12px)',
        },
        '.backdrop-blur-xl': {
          backdropFilter: 'blur(16px)',
        },
        // --- Custom astonishing utilities ---
        '.no-border': {
          border: 'none !important',
        },
        '.bg-glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)', // Very subtle white for transparency
          backdropFilter: 'blur(10px)', // A common blur for glassmorphism
          border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border
        },
        '.dark\\:bg-glass': {
          backgroundColor: 'rgba(0, 0, 0, 0.05)', // Very subtle black for transparency in dark mode
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
        '.shadow-neumorphic': {
            boxShadow: '10px 10px 20px rgba(0,0,0,0.1), -10px -10px 20px rgba(255,255,255,0.8)',
        },
        '.dark\\:shadow-neumorphic': {
            boxShadow: '10px 10px 20px rgba(0,0,0,0.8), -10px -10px 20px rgba(50,50,50,0.1)',
        },
        '.text-gradient-purple-blue': {
            background: 'linear-gradient(to right, #7C3AED, #4F46E5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },
        '.text-gradient-pink-purple': {
            background: 'linear-gradient(to right, #EC4899, #7C3AED)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },
        // --- End custom astonishing utilities ---
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
};