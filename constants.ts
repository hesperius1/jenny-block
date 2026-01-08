import { BlockShape } from './types';

export const GRID_SIZE = 8;
export const BOARD_PADDING = 8; // px

// Block Colors based on Block Blast aesthetic
export const COLORS = {
  blue: 'bg-blue-500 shadow-blue-700',
  green: 'bg-emerald-500 shadow-emerald-700',
  red: 'bg-rose-500 shadow-rose-700',
  yellow: 'bg-amber-400 shadow-amber-600',
  purple: 'bg-violet-500 shadow-violet-700',
  orange: 'bg-orange-500 shadow-orange-700',
  cyan: 'bg-cyan-400 shadow-cyan-600',
  pink: 'bg-fuchsia-400 shadow-fuchsia-600',
};

// Raw definitions of shapes
const SHAPE_DEFS: Partial<BlockShape>[] = [
  { type: 'single', matrix: [[1]], color: COLORS.yellow },
  { type: 'line2', matrix: [[1, 1]], color: COLORS.blue },
  { type: 'line2', matrix: [[1], [1]], color: COLORS.blue },
  { type: 'line3', matrix: [[1, 1, 1]], color: COLORS.red },
  { type: 'line3', matrix: [[1], [1], [1]], color: COLORS.red },
  { type: 'line4', matrix: [[1, 1, 1, 1]], color: COLORS.cyan },
  { type: 'line4', matrix: [[1], [1], [1], [1]], color: COLORS.cyan },
  { type: 'line5', matrix: [[1, 1, 1, 1, 1]], color: COLORS.orange },
  { type: 'line5', matrix: [[1], [1], [1], [1], [1]], color: COLORS.orange },
  { type: 'square', matrix: [[1, 1], [1, 1]], color: COLORS.green },
  { type: 'square', matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: COLORS.green },
  { type: 'L', matrix: [[1, 0], [1, 0], [1, 1]], color: COLORS.purple },
  { type: 'J', matrix: [[0, 1], [0, 1], [1, 1]], color: COLORS.purple },
  { type: 'L', matrix: [[1, 1, 1], [1, 0, 0]], color: COLORS.purple },
  { type: 'J', matrix: [[1, 0, 0], [1, 1, 1]], color: COLORS.purple },
  { type: 'T', matrix: [[1, 1, 1], [0, 1, 0]], color: COLORS.pink },
  { type: 'T', matrix: [[0, 1, 0], [1, 1, 1]], color: COLORS.pink },
  { type: 'T', matrix: [[1, 0], [1, 1], [1, 0]], color: COLORS.pink },
  { type: 'T', matrix: [[0, 1], [1, 1], [0, 1]], color: COLORS.pink },
  { type: 'S', matrix: [[0, 1, 1], [1, 1, 0]], color: COLORS.green },
  { type: 'Z', matrix: [[1, 1, 0], [0, 1, 1]], color: COLORS.red },
  { type: 'cross', matrix: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], color: COLORS.blue },
];

export const getRandomShapes = (count: number): BlockShape[] => {
  const shapes: BlockShape[] = [];
  for (let i = 0; i < count; i++) {
    const def = SHAPE_DEFS[Math.floor(Math.random() * SHAPE_DEFS.length)];
    shapes.push({
      ...def,
      id: Math.random().toString(36).substr(2, 9),
    } as BlockShape);
  }
  return shapes;
};
