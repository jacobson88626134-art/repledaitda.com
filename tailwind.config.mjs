import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Apple SD Gothic Neo"',
          '"Malgun Gothic"',
          'system-ui',
          'sans-serif',
        ],
        serif: ['Georgia', '"Times New Roman"', 'serif'],
      },
      colors: {
        ink: '#111111',
        paper: '#FAFAFA',
        muted: '#666666',
        line: '#E5E5E5',
      },
    },
  },
  plugins: [typography],
};