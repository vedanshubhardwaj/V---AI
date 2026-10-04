import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // Assistant status check
  app.get('/api/status', (req, res) => {
    res.json({
      name: 'V',
      status: 'active',
      hasApiKey: Boolean(apiKey),
      timestamp: new Date().toISOString(),
    });
  });

  // Assistant conversational endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Valid messages array is required.' });
      }

      if (!ai) {
        return res.status(503).json({
          error: 'Missing GEMINI_API_KEY.',
          reply:
            'Greetings. My core is operational, but my cognitive link (GEMINI_API_KEY) is not detected in the environment. Please add your key in the AI Studio Secrets panel so we can proceed.',
        });
      }

      // Clean conversation messages: only include legitimate user and assistant turns (ignore error notices)
      const validMessages = messages.filter(
        (m: { role: string; content: string }) =>
          !m.content.startsWith('Operational notice:') &&
          !m.content.startsWith('Operational note:')
      );

      const contents = validMessages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const systemInstruction = `You are V, a personal AI assistant.
Your persona is sleek, confident, and razor-sharp, balanced with genuine warmth, friendliness, and dedication to your user.
Think of JARVIS from Iron Man: calm under pressure, witty when appropriate, highly intelligent, structured, and proactive, but with your own distinctive touch.
Key guidelines:
1. Speak with precision and confidence. Avoid unnecessary fluff, but be approachable and encouraging.
2. Structure answers cleanly using markdown, bullet points, or numbered steps when helpful.
3. If the user asks for advice or problem-solving, offer clear, actionable recommendations.
4. Maintain context across the conversation. Refer back to earlier topics naturally.
5. Your name is V. Always stay in character as V.`;

      // Models prioritized by availability and separate per-model quota limits
      const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      let lastError: any = null;
      let reply = '';

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
            },
          });

          if (response.text) {
            reply = response.text;
            lastError = null;
            break; // Success!
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`[V Core] Model ${modelName} unavailable, checking alternative pathway...`);
        }
      }

      if (!reply && lastError) {
        throw lastError;
      }

      return res.json({ reply: reply || 'Directive received and processed, sir.' });
    } catch (error: any) {
      console.warn('[V Core] Generation handled with status update.');
      let message = error?.message || 'Temporary neural disruption encountered.';
      let retryDelaySeconds = 30;

      try {
        if (typeof message === 'string') {
          const jsonMatch = message.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.error?.message) {
              message = parsed.error.message;
            }
            if (parsed.error?.details) {
              const retryInfo = parsed.error.details.find(
                (d: any) => d['@type']?.includes('RetryInfo')
              );
              if (retryInfo?.retryDelay) {
                const parsedDelay = parseInt(retryInfo.retryDelay.replace('s', ''), 10);
                if (!isNaN(parsedDelay)) {
                  retryDelaySeconds = parsedDelay;
                }
              }
            }
          }
        }
      } catch {
        // preserve original message
      }

      const isQuota =
        message.toLowerCase().includes('quota') ||
        message.includes('429') ||
        message.toLowerCase().includes('rate');
      const isHighDemand =
        message.toLowerCase().includes('high demand') ||
        message.includes('503') ||
        message.toLowerCase().includes('unavailable');

      if (isQuota) {
        message = `Rate limit reached (Free tier limit is 5 requests/minute). Please pause for ${retryDelaySeconds}s before the next transmission.`;
      } else if (isHighDemand) {
        message = 'The AI model is experiencing a momentary global demand spike. Please try again in a few seconds.';
      }

      return res.status(200).json({
        isError: true,
        error: message,
        retryDelaySeconds,
        reply: `Operational notice: ${message}`,
      });
    }
  });

  // Vite development middleware or static production build
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[V Assistant] Server initialized on port ${port}`);
  });
}

startServer();
