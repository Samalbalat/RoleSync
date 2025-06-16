export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        color: {
          primary: '#1E40AF', // Blue
          secondary: '#FBBF24', // Yellow
          accent: '#EF4444', // Red
          neutral: '#374151', // Gray
          'base-100': '#FFFFFF', // White
        },
        container: {
          center: true,
          padding: {
            default: '1rem',
            sm: '2rem',
            md: '3rem',
            lg: '4rem',
            xl: '5rem',
            '2xl': '6rem',
          },
        },
    },
  },
  plugins: [],
}