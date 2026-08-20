import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

// Op GitHub Pages draait de app onder /Kosten_Leerlingen_Malaga/ i.p.v. de root van het domein.
const base = process.env.GITHUB_PAGES ? '/Kosten_Leerlingen_Malaga/' : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],
      manifest: {
        name: 'Stagekosten Málaga',
        short_name: 'Stagekosten',
        description: 'Bonnetjes en budget bijhouden tijdens de buitenlandse stage.',
        theme_color: '#F7F6F3',
        background_color: '#F7F6F3',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
