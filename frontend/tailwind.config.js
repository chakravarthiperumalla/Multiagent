/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Space Grotesk', 'system-ui', 'sans-serif'],
            },
            colors: {
                dark: {
                    50: '#f8f8ff',
                    100: '#e8e8f8',
                    200: '#c8c8e8',
                    300: '#a8a8d8',
                    400: '#7878b8',
                    500: '#484898',
                    600: '#282878',
                    700: '#181858',
                    800: '#0e0e3a',
                    900: '#080820',
                    950: '#04040f',
                }
            },
            backgroundImage: {
                'radial-dark': 'radial-gradient(ellipse at top, #1a1035 0%, #0a0a0f 60%)',
                'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'slide-up': 'slideUp 0.4s ease-out',
                'fade-in': 'fadeIn 0.3s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                slideUp: {
                    '0%': { opacity: 0, transform: 'translateY(16px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
                scaleIn: {
                    '0%': { opacity: 0, transform: 'scale(0.95)' },
                    '100%': { opacity: 1, transform: 'scale(1)' },
                },
                bounceSubtle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-4px)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'glow-violet': '0 0 40px rgba(139,92,246,0.3)',
                'glow-sm': '0 0 20px rgba(139,92,246,0.15)',
                'card': '0 8px 32px rgba(0,0,0,0.4)',
            }
        },
    },
    plugins: [],
}
