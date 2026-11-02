export interface Position {
  x: number;
  y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type TreasureType = 
  | 'DATA_CORE'      // Standard golden core (+100 pts)
  | 'NEON_CRYSTAL'   // High value gem (+250 pts)
  | 'CHRONO_SPHERE'  // Slows down the snake for 5 seconds (+150 pts)
  | 'EMP_BLAST'      // Stuns the snake for 3.5 seconds (+200 pts)
  | 'SHIELD_POD';    // Gives 1 hit shield (+150 pts)

export interface Treasure {
  id: string;
  pos: Position;
  type: TreasureType;
  scoreVal: number;
  spawnTime: number;
  lifetimeMs?: number;
}

export interface SnakeSegment {
  id: string;
  x: number;
  y: number;
  isHead: boolean;
  isTail: boolean;
  order: number;
}

export interface Snake {
  id: string;
  name: string;
  color: string;
  segments: SnakeSegment[];
  direction: Direction;
  speedMs: number;
  baseSpeedMs: number;
  stunnedUntil: number;
  slowedUntil: number;
  targetTreasureId: string | null;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  type: 'WALL' | 'HAZARD_LASER' | 'PORTAL';
  active?: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  dir: Direction;
  distanceLeft: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  createdAt: number;
}

export interface LevelConfig {
  levelNumber: number;
  title: string;
  themeName: string;
  targetSegmentsToDestroy: number;
  initialSnakeLength: number; // 3 or 4
  initialSpeedMs: number;
  speedReductionPerHitMs: number; // Snake moves faster with every hit
  maxSimultaneousTreasures: number;
  treasureSpawnRateMs: number;
  snakeHuntAggression: number; // 0 to 1, probability of smart BFS vs roaming
  obstacles: Position[];
  loreKicker: string;
}

export interface PlayerStats {
  score: number;
  combo: number;
  maxCombo: number;
  treasuresCollected: number;
  treasuresLostToSnake: number;
  segmentsDestroyed: number;
  lives: number;
  shields: number;
  empCharges: number;
}

export type GameState = 
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_CLEARED'
  | 'GAME_OVER';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  level: number;
  treasuresCollected: number;
  segmentsDestroyed: number;
  timeElapsed: number;
  country: string;
  createdAt: string;
}
