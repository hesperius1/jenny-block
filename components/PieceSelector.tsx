import React from 'react';
import { BlockShape } from '../types';
import { BlockPiece } from './BlockPiece';

interface PieceSelectorProps {
  pieces: (BlockShape | null)[];
  onPointerDown: (e: React.PointerEvent, index: number) => void;
}

export const PieceSelector: React.FC<PieceSelectorProps> = ({ pieces, onPointerDown }) => {
  return (
    <div className="w-full max-w-md mx-auto h-32 mt-8 flex justify-between items-center px-4">
      {pieces.map((piece, idx) => (
        <div
          key={idx}
          className="flex-1 flex justify-center items-center h-full relative"
          style={{ touchAction: 'none' }} // Crucial for preventing scroll while initiating drag
        >
          {piece ? (
            <div
              className="cursor-grab active:cursor-grabbing touch-none transform transition-transform hover:scale-105"
              onPointerDown={(e) => onPointerDown(e, idx)}
            >
              <BlockPiece piece={piece} cellSize={25} />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-800/30" />
          )}
        </div>
      ))}
    </div>
  );
};
