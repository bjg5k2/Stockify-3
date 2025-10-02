
// Fix: Provide content for the vite.config.ts file.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This define block makes process.env available in the client-side code,
  // which is required by the @google/genai SDK guidelines to access process.env.API_KEY.
  // Your environment variables (e.g., in a .env file) will be exposed here.
  define: {
    'process.env': process.env
  }
})
