import { BlockShape, GridType } from '../types';

export const createEmptyGrid = (size: number): GridType => {
  return Array(size).fill(null).map(() => Array(size).fill(null));
};

export const canPlacePiece = (
  grid: GridType,
  matrix: number[][],
  row: number,
  col: number
): boolean => {
  const size = grid.length;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === 1) {
        const gridR = row + r;
        const gridC = col + c;

        // Check boundaries
        if (gridR < 0 || gridR >= size || gridC < 0 || gridC >= size) {
          return false;
        }

        // Check collision
        if (grid[gridR][gridC] !== null) {
          return false;
        }
      }
    }
  }
  return true;
};

export const placePiece = (
  grid: GridType,
  piece: BlockShape,
  row: number,
  col: number
): GridType => {
  const newGrid = grid.map((r) => [...r]);
  for (let r = 0; r < piece.matrix.length; r++) {
    for (let c = 0; c < piece.matrix[r].length; c++) {
      if (piece.matrix[r][c] === 1) {
        newGrid[row + r][col + c] = piece.color;
      }
    }
  }
  return newGrid;
};

export const checkLines = (grid: GridType) => {
  const size = grid.length;
  const rowsToClear: number[] = [];
  const colsToClear: number[] = [];

  // Check rows
  for (let r = 0; r < size; r++) {
    if (grid[r].every((cell) => cell !== null)) {
      rowsToClear.push(r);
    }
  }

  // Check cols
  for (let c = 0; c < size; c++) {
    let full = true;
    for (let r = 0; r < size; r++) {
      if (grid[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) {
      colsToClear.push(c);
    }
  }

  return { rowsToClear, colsToClear };
};

export const clearLines = (grid: GridType, rows: number[], cols: number[]): GridType => {
  const size = grid.length;
  const newGrid = grid.map((r) => [...r]);

  rows.forEach((r) => {
    for (let c = 0; c < size; c++) {
      newGrid[r][c] = null;
    }
  });

  cols.forEach((c) => {
    for (let r = 0; r < size; r++) {
      newGrid[r][c] = null;
    }
  });

  return newGrid;
};

export const checkGameOver = (grid: GridType, availablePieces: (BlockShape | null)[]): boolean => {
  const size = grid.length;
  // If no pieces are left (rare state before refresh), it's not game over
  const activePieces = availablePieces.filter((p) => p !== null) as BlockShape[];
  if (activePieces.length === 0) return false;

  // Check if ANY piece can fit ANYWHERE
  for (const piece of activePieces) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (canPlacePiece(grid, piece.matrix, r, c)) {
          return false; // Found a valid move
        }
      }
    }
  }

  return true; // No valid moves found
};