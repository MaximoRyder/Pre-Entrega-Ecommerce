import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// export default {
//   plugins: [react()],
//   // config options
// }
export default defineConfig({
  plugins: [react()],
  base: '/Entrega-Ecommerce',
})
