import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Persistent leaderboard data storage
const DATA_DIR = path.join(__dirname, 'data');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  level: number;
  treasuresCollected: number;
  segmentsDestroyed: number;
  timeElapsed: number; // in seconds
  country: string;
  createdAt: string;
}

const DEFAULT_GLOBAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    name: 'CyberPhantom_99',
    score: 14850,
    level: 7,
    treasuresCollected: 48,
    segmentsDestroyed: 24,
    timeElapsed: 285,
    country: 'JP',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'seed-2',
    name: 'ViperSniper_X',
    score: 12400,
    level: 6,
    treasuresCollected: 42,
    segmentsDestroyed: 21,
    timeElapsed: 240,
    country: 'US',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'seed-3',
    name: 'NeonStride',
    score: 10920,
    level: 5,
    treasuresCollected: 36,
    segmentsDestroyed: 18,
    timeElapsed: 210,
    country: 'DE',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'seed-4',
    name: 'Kira_Grid',
    score: 9350,
    level: 5,
    treasuresCollected: 31,
    segmentsDestroyed: 17,
    timeElapsed: 195,
    country: 'KR',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'seed-5',
    name: 'SolarPulse',
    score: 8100,
    level: 4,
    treasuresCollected: 27,
    segmentsDestroyed: 14,
    timeElapsed: 160,
    country: 'CA',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'seed-6',
    name: 'ApexRunner',
    score: 6850,
    level: 4,
    treasuresCollected: 23,
    segmentsDestroyed: 13,
    timeElapsed: 142,
    country: 'BR',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: 'seed-7',
    name: 'ByteChaser',
    score: 5400,
    level: 3,
    treasuresCollected: 19,
    segmentsDestroyed: 10,
    timeElapsed: 118,
    country: 'GB',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'seed-8',
    name: 'GlitchBreaker',
    score: 4200,
    level: 3,
    treasuresCollected: 15,
    segmentsDestroyed: 8,
    timeElapsed: 95,
    country: 'FR',
    createdAt: new Date(Date.now() - 3600000 * 60).toISOString(),
  },
  {
    id: 'seed-9',
    name: 'NovaStrike',
    score: 3150,
    level: 2,
    treasuresCollected: 11,
    segmentsDestroyed: 6,
    timeElapsed: 72,
    country: 'AU',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: 'seed-10',
    name: 'EchoRider',
    score: 2200,
    level: 2,
    treasuresCollected: 8,
    segmentsDestroyed: 5,
    timeElapsed: 54,
    country: 'SE',
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
  },
];

function initLeaderboard(): LeaderboardEntry[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(LEADERBOARD_FILE)) {
      const content = fs.readFileSync(LEADERBOARD_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // write default
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(DEFAULT_GLOBAL_LEADERBOARD, null, 2));
    return DEFAULT_GLOBAL_LEADERBOARD;
  } catch (err) {
    console.error('Failed to read leaderboard file:', err);
    return DEFAULT_GLOBAL_LEADERBOARD;
  }
}

let leaderboardState: LeaderboardEntry[] = initLeaderboard();

function saveLeaderboard(entries: LeaderboardEntry[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(entries, null, 2));
  } catch (err) {
    console.error('Failed to save leaderboard file:', err);
  }
}

// REST endpoints
app.get('/api/leaderboard', (_req, res) => {
  // Sort descending by score, tie-break by level then timeElapsed (lower time is better)
  const sorted = [...leaderboardState].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.level !== a.level) return b.level - a.level;
    return a.timeElapsed - b.timeElapsed;
  });
  res.json({
    success: true,
    count: sorted.length,
    leaderboard: sorted.slice(0, 50),
  });
});

app.post('/api/leaderboard', (req, res) => {
  const { name, score, level, treasuresCollected, segmentsDestroyed, timeElapsed, country } = req.body;

  if (typeof score !== 'number' || score < 0) {
    return res.status(400).json({ success: false, error: 'Invalid score' });
  }

  const cleanName = (typeof name === 'string' && name.trim()) 
    ? name.trim().slice(0, 16) 
    : 'AnonRunner';

  const newEntry: LeaderboardEntry = {
    id: 'entry-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    name: cleanName,
    score: Math.floor(score),
    level: Math.max(1, Math.floor(Number(level) || 1)),
    treasuresCollected: Math.max(0, Math.floor(Number(treasuresCollected) || 0)),
    segmentsDestroyed: Math.max(0, Math.floor(Number(segmentsDestroyed) || 0)),
    timeElapsed: Math.max(0, Math.floor(Number(timeElapsed) || 0)),
    country: (typeof country === 'string' && country.length === 2) ? country.toUpperCase() : 'GL',
    createdAt: new Date().toISOString(),
  };

  leaderboardState.push(newEntry);
  leaderboardState.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.level !== a.level) return b.level - a.level;
    return a.timeElapsed - b.timeElapsed;
  });

  // Limit to top 100 entries
  if (leaderboardState.length > 100) {
    leaderboardState = leaderboardState.slice(0, 100);
  }

  saveLeaderboard(leaderboardState);

  const rank = leaderboardState.findIndex((item) => item.id === newEntry.id) + 1;

  res.json({
    success: true,
    entry: newEntry,
    rank,
    leaderboard: leaderboardState.slice(0, 50),
  });
});

// Vite dev server mounting or static file serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
