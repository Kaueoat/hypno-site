import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // caminhos relativos: funciona em usuario.github.io/repositorio e em domínio próprio
  base: './',
  plugins: [react(), tailwindcss()],
})
