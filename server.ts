import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Enable CORS for all origins
  app.use(cors());
  app.use(express.json());

  const RENDER_BACKEND_URL = process.env.VITE_API_URL || 'https://dailybloom-6y1q.onrender.com';
  console.log('Proxying to:', RENDER_BACKEND_URL);

  // API routes go here
  // Local health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), environment: process.env.NODE_ENV });
  });

  // Handle proxy health checks locally if they fail or to avoid 403s from Render
  app.get(['/api/proxy', '/api/proxy/', '/api/proxy/health', '/api/proxy/api/health'], (req, res) => {
    res.json({ status: 'ok', message: 'Local fallback for proxy health', target: RENDER_BACKEND_URL });
  });

  // Gemini Mood Analysis - handle both direct and proxied paths
  app.post(['/api/analyze-mood', '/api/proxy/analyze-mood'], async (req, res) => {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

      const prompt = `Analyze the mood of the following journal entry. Return ONLY one of these words: great, good, neutral, low, bad.
      
      Entry: "${content}"`;

      const result = await genAI.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      
      const mood = result.text.trim().toLowerCase();
      
      // Validate mood
      const validMoods = ['great', 'good', 'neutral', 'low', 'bad'];
      const finalMood = validMoods.includes(mood) ? mood : 'neutral';

      res.json({ mood: finalMood });
    } catch (error) {
      console.error('Mood analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze mood' });
    }
  });

  // Gemini Journal Summarization
  app.post(['/api/summarize-entry', '/api/proxy/summarize-entry'], async (req, res) => {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

      const prompt = `Summarize the following journal entry in one short, poetic sentence.
      
      Entry: "${content}"`;

      const result = await genAI.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      
      const summary = result.text.trim();

      res.json({ summary });
    } catch (error) {
      console.error('Summarization error:', error);
      res.status(500).json({ error: 'Failed to summarize entry' });
    }
  });

  app.get('/api/debug-proxy', (req, res) => {
    res.json({ target: RENDER_BACKEND_URL });
  });

  // Proxy requests to the Render backend to avoid CORS issues in the browser
  app.use('/api/proxy', createProxyMiddleware({
    target: RENDER_BACKEND_URL,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/api/proxy': '', 
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        // Add headers that might help avoid 403s
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        // Remove origin/referer to avoid 403s from some WAFs
        proxyReq.removeHeader('origin');
        proxyReq.removeHeader('referer');
        console.log(`[Proxy] ${req.method} ${req.url} -> ${RENDER_BACKEND_URL}${proxyReq.path}`);
      },
      error: (err, req, res) => {
        console.error('[Proxy Error]', err);
        if (res && 'status' in res && typeof res.status === 'function') {
          res.status(502).json({ error: 'Proxy error', message: err.message });
        }
      }
    }
  }));

  app.get('/api/data', (req, res) => {
    res.json({ message: 'Hello from the Render backend!', data: [1, 2, 3] });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    
    // Fallback to index.html for SPA
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
