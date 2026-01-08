import React from 'react';
import { BlockShape } from '../types';

interface BlockPieceProps {
  piece: BlockShape;
  cellSize?: number;
  className?: string;
}

export const BlockPiece: React.FC<BlockPieceProps> = ({ piece, cellSize = 20, className = '' }) => {
  const height = piece.matrix.length * cellSize;
  const width = piece.matrix[0].length * cellSize;

  return (
    <div
      className={`relative ${className}`}
      style={{ width, height }}
    >
      {piece.matrix.map((row, r) =>
        row.map((val, c) => {
          if (val === 0) return null;
          return (
            <div
              key={`${r}-${c}`}
              className={`absolute border border-white/20 rounded-sm ${piece.color} bg-opacity-100 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.2),inset_2px_2px_4px_rgba(255,255,255,0.3)]`}
              style={{
                width: cellSize,
                height: cellSize,
                top: r * cellSize,
                left: c * cellSize,
              }}
            />
          );
        })
      )}
    </div>
  );
};
