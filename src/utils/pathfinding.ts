import { Position, Direction } from '../types/game';

export const GRID_COLS = 10;
export const GRID_ROWS = 16;

const DIRECTIONS: { dir: Direction; dx: number; dy: number }[] = [
  { dir: 'UP', dx: 0, dy: -1 },
  { dir: 'RIGHT', dx: 1, dy: 0 },
  { dir: 'DOWN', dx: 0, dy: 1 },
  { dir: 'LEFT', dx: -1, dy: 0 },
];

export function isWithinBounds(x: number, y: number, cols = GRID_COLS, rows = GRID_ROWS): boolean {
  return x >= 0 && x < cols && y >= 0 && y < rows;
}

export function getManhattanDistance(p1: Position, p2: Position): number {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

// Find the best next direction for the snake head towards targetPos avoiding obstacles and snake body
export function findNextSnakeDirection(
  head: Position,
  currentDir: Direction,
  snakeBody: Position[], // excluding tail if tail moves next step
  obstacles: Position[],
  targetPos: Position | null,
  cols = GRID_COLS,
  rows = GRID_ROWS
): Direction {
  // Create occupied set for O(1) lookup
  const blocked = new Set<string>();
  
  // Body segments are blocked (except snake's own tail which will vacate next frame, unless it's growing)
  snakeBody.forEach((seg, idx) => {
    // don't include head itself
    if (idx !== 0) {
      blocked.add(`${seg.x},${seg.y}`);
    }
  });

  // Obstacles
  obstacles.forEach((obs) => {
    blocked.add(`${obs.x},${obs.y}`);
  });

  // Determine opposite direction to prevent instant 180 snap
  const oppositeDir: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };

  const validMoves: { dir: Direction; nextPos: Position }[] = [];

  for (const { dir, dx, dy } of DIRECTIONS) {
    if (dir === oppositeDir[currentDir] && snakeBody.length > 1) {
      continue; // cannot reverse into neck
    }
    const nx = head.x + dx;
    const ny = head.y + dy;

    if (isWithinBounds(nx, ny, cols, rows) && !blocked.has(`${nx},${ny}`)) {
      validMoves.push({ dir, nextPos: { x: nx, y: ny } });
    }
  }

  // If no valid moves without hitting body, allow any move that stays within bounds
  if (validMoves.length === 0) {
    for (const { dir, dx, dy } of DIRECTIONS) {
      const nx = head.x + dx;
      const ny = head.y + dy;
      if (isWithinBounds(nx, ny, cols, rows)) {
        return dir;
      }
    }
    return currentDir;
  }

  // If we have a target treasure, do BFS to find the shortest path
  if (targetPos) {
    const queue: { pos: Position; firstMove: Direction; dist: number }[] = [];
    const visited = new Set<string>();
    visited.add(`${head.x},${head.y}`);

    for (const move of validMoves) {
      const key = `${move.nextPos.x},${move.nextPos.y}`;
      visited.add(key);
      queue.push({ pos: move.nextPos, firstMove: move.dir, dist: 1 });
    }

    while (queue.length > 0) {
      const current = queue.shift()!;

      // Reached target?
      if (current.pos.x === targetPos.x && current.pos.y === targetPos.y) {
        return current.firstMove;
      }

      // Expand
      for (const { dx, dy } of DIRECTIONS) {
        const nx = current.pos.x + dx;
        const ny = current.pos.y + dy;
        const key = `${nx},${ny}`;

        if (
          isWithinBounds(nx, ny, cols, rows) &&
          !blocked.has(key) &&
          !visited.has(key)
        ) {
          visited.add(key);
          queue.push({
            pos: { x: nx, y: ny },
            firstMove: current.firstMove,
            dist: current.dist + 1,
          });
        }
      }
    }

    // Target unreachable via BFS? Pick the move with lowest Manhattan distance
    let bestMove = validMoves[0];
    let minManhattan = Infinity;

    for (const move of validMoves) {
      const dist = getManhattanDistance(move.nextPos, targetPos);
      if (dist < minManhattan) {
        minManhattan = dist;
        bestMove = move;
      }
    }
    return bestMove.dir;
  }

  // Fallback: Pick move with highest free space (flood fill count) or maintain momentum
  let bestMove = validMoves[0];
  let maxFreeSpaces = -1;

  for (const move of validMoves) {
    const freeCount = countReachableSpaces(move.nextPos, blocked, cols, rows, 15);
    // Prefer continuing in same direction if tied
    const bonus = move.dir === currentDir ? 1 : 0;
    if (freeCount + bonus > maxFreeSpaces) {
      maxFreeSpaces = freeCount + bonus;
      bestMove = move;
    }
  }

  return bestMove.dir;
}

function countReachableSpaces(
  start: Position,
  blocked: Set<string>,
  cols: number,
  rows: number,
  maxDepth = 15
): number {
  const visited = new Set<string>();
  const queue: Position[] = [start];
  visited.add(`${start.x},${start.y}`);
  let count = 0;

  while (queue.length > 0 && count < maxDepth) {
    const curr = queue.shift()!;
    count++;

    for (const { dx, dy } of DIRECTIONS) {
      const nx = curr.x + dx;
      const ny = curr.y + dy;
      const key = `${nx},${ny}`;
      if (
        isWithinBounds(nx, ny, cols, rows) &&
        !blocked.has(key) &&
        !visited.has(key)
      ) {
        visited.add(key);
        queue.push({ x: nx, y: ny });
      }
    }
  }
  return count;
}
