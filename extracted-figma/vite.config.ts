import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { handleExtractLabsRequest } from './api/extract-labs.js'
import { handleLabInsightsRequest } from './api/lab-insights.js'
import { handleLabSummaryRequest } from './api/lab-summary.js'
import { handleTranslateRequest } from './api/translate.js'


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

function openAiLabSummaryApi(apiKey: string | undefined, model: string, insightsModel: string) {
  return {
    name: 'openai-lab-summary-api',
    configureServer(server) {
      server.middlewares.use('/api/extract-labs', async (req, res) => {
        await handleExtractLabsRequest(req, res, { apiKey, model })
      })
      server.middlewares.use('/api/lab-summary', async (req, res) => {
        await handleLabSummaryRequest(req, res, { apiKey, model })
      })
      server.middlewares.use('/api/lab-insights', async (req, res) => {
        await handleLabInsightsRequest(req, res, { apiKey, model: insightsModel })
      })
    },
  }
}

function googleTranslateApi(apiKey: string | undefined) {
  return {
    name: 'google-translate-api',
    configureServer(server) {
      server.middlewares.use('/api/translate', async (req, res) => {
        await handleTranslateRequest(req, res, { apiKey })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      openAiLabSummaryApi(
        env.OPENAI_API_KEY,
        env.OPENAI_MODEL || 'gpt-4.1-mini',
        env.OPENAI_INSIGHTS_MODEL || 'gpt-4.1-nano',
      ),
      googleTranslateApi(env.GOOGLE_TRANSLATE_API_KEY),
      figmaAssetResolver(),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/app'),
      },
    },
  }
})
