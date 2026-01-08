export type CellColor = string | null;

export type GridType = CellColor[][];

export interface Coordinate {
  r: number;
  c: number;
}

export interface BlockShape {
  id: string;
  matrix: number[][]; // 0 or 1
  color: string;
  type: 'single' | 'line2' | 'line3' | 'line4' | 'line5' | 'square' | 'L' | 'J' | 'T' | 'S' | 'Z' | 'cross' | 'bigL';
}

export interface GameState {
  grid: GridType;
  score: number;
  highScore: number;
  combo: number;
  availablePieces: (BlockShape | null)[];
  isGameOver: boolean;
  clearingRows: number[];
  clearingCols: number[];
}

export interface DragState {
  isDragging: boolean;
  pieceIndex: number | null;
  origin: { x: number; y: number }; // where the pointer started
  current: { x: number; y: number }; // current pointer pos
  pieceOffset: { x: number; y: number }; // offset from pointer to piece center
  validDrop?: Coordinate | null; // Top-left grid coordinate if drop is valid
}
