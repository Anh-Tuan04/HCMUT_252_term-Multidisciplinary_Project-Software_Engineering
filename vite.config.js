// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Ép Vite chạy ở cổng 5173 để Caddy biết đường mà tìm
    port: 5173,
    strictPort: true,
    // Cấu hình HMR để nó chạy qua cổng 443 của Caddy thay vì chạy trực tiếp
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
})