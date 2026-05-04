import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { handleLabSummaryRequest } from './api/lab-summary.js'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

function openAiLabSummaryApi(apiKey: string | undefined, model: string) {
  return {
    name: 'openai-lab-summary-api',
    configureServer(server) {
      server.middlewares.use('/api/lab-summary', async (req, res) => {
        await handleLabSummaryRequest(req, res, { apiKey, model })
      })
    },
<<<<<<< HEAD
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      openAiLabSummaryApi(env.OPENAI_API_KEY, env.OPENAI_MODEL || 'gpt-4.1-mini'),
      figmaAssetResolver(),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/app'),
      },
    },
  }
=======
  },
  server: {
    proxy: {
      '/api/translate': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
>>>>>>> 6ea11a1 (translation service)
})
