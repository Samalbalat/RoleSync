import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import eslintPlugin from 'vite-plugin-eslint'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    eslintPlugin({
      cache: false,
      include: ['./src//*.js', './src//*.jsx']
    }),
  ],
  test: {
    globals: true,          
    environment: 'jsdom',   
    setupFiles: './src/test/setup.js',  
    css: true,
    coverage: {
      exclude: [
        'src/test/mocks/**', 
        'node_modules/**',
        'dist/**'
      ]
    },              
  },
})
