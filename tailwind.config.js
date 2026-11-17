/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#10233F',
          dark: '#0A172A',
          light: '#172B4D',
          hover: '#1B3158',
        },
        deepNavy: '#172B4D',
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          DEFAULT: '#2563EB',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          DEFAULT: '#0D9488',
        },
        surface: {
          DEFAULT: '#F5F7FB',
          card: '#FFFFFF',
          border: '#E2E8F0',
          hover: '#F8FAFC',
        },
        content: {
          main: '#172033',
          muted: '#64748B',
          light: '#94A3B8',
        },
        status: {
          success: '#16A34A',
          'success-bg': '#F0FDF4',
          'success-border': '#BBF7D0',
          warning: '#F59E0B',
          'warning-bg': '#FFFBEB',
          'warning-border': '#FDE68A',
          error: '#DC2626',
          'error-bg': '#FEF2F2',
          'error-border': '#FECACA',
          info: '#2563EB',
          'info-bg': '#EFF6FF',
          'info-border': '#BFDBFE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 2px 6px -1px rgba(16, 35, 63, 0.06), 0 2px 4px -2px rgba(16, 35, 63, 0.04)',
        elevated: '0 10px 15px -3px rgba(16, 35, 63, 0.08), 0 4px 6px -4px rgba(16, 35, 63, 0.04)',
        dropdown: '0 10px 25px -5px rgba(16, 35, 63, 0.12), 0 8px 10px -6px rgba(16, 35, 63, 0.08)',
      },
    },
  },
  plugins: [],
}
