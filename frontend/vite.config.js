import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
  },
  server: {
    port: 4000
  },
  build: {
    // تعطيل الضغط يمنع خطأ "missing ) after argument list" عند الرفع على الاستضافة
    minify: false
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg'],
  publicDir: 'public'
})

