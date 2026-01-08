import React, { useRef, useLayoutEffect } from 'react';
import { GridType, BlockShape, Coordinate } from '../types';

interface GridProps {
  grid: GridType;
  previewDrop?: { coord: Coordinate; piece: BlockShape } | null;
  clearingRows: number[];
  clearingCols: number[];
  onBoardMount: (rect: DOMRect) => void;
}

export const Grid: React.FC<GridProps> = ({
  grid,
  previewDrop,
  clearingRows,
  clearingCols,
  onBoardMount
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const size = grid.length;

  useLayoutEffect(() => {
    if (boardRef.current) {
      onBoardMount(boardRef.current.getBoundingClientRect());
    }
    const handleResize = () => {
      if (boardRef.current) {
        onBoardMount(boardRef.current.getBoundingClientRect());
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onBoardMount]);

  return (
    <div
      ref={boardRef}
      className="relative bg-slate-800/80 rounded-xl p-2 shadow-2xl backdrop-blur-sm border border-slate-700 select-none touch-none aspect-square w-full max-w-md mx-auto"
    >
      <div 
        className="grid gap-1 h-full w-full"
        style={{ 
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`
        }}
      >
        {grid.map((row, r) =>
          row.map((cellColor, c) => {
            const isClearing = clearingRows.includes(r) || clearingCols.includes(c);
            return (
              <div
                key={`${r}-${c}`}
                className={`w-full h-full rounded-md relative ${
                  cellColor ? '' : 'bg-slate-900/50'
                } ${isClearing ? 'animate-flash brightness-150' : ''} transition-all duration-300`}
              >
                {/* Background Grid Cell (Empty) */}
                {!cellColor && <div className="absolute inset-0 rounded-md opacity-30" />}

                {/* Filled Cell */}
                {cellColor && (
                  <div
                    className={`w-full h-full rounded-md ${cellColor} shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.2)] ${
                      isClearing ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                    } transition-all duration-500`}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Ghost Piece Overlay */}
      {previewDrop && (
         <div 
            className="absolute inset-0 p-2 pointer-events-none z-10 grid gap-1"
            style={{ 
                gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`
            }}
         >
             {Array(size * size).fill(0).map((_, idx) => {
                 const r = Math.floor(idx / size);
                 const c = idx % size;
                 
                 // check if this cell is part of the preview
                 const localR = r - previewDrop.coord.r;
                 const localC = c - previewDrop.coord.c;
                 
                 let isPreview = false;
                 if (localR >= 0 && localR < previewDrop.piece.matrix.length &&
                     localC >= 0 && localC < previewDrop.piece.matrix[0].length) {
                         if (previewDrop.piece.matrix[localR][localC] === 1) {
                             isPreview = true;
                         }
                 }
                 
                 if (!isPreview) return <div key={idx} />;

                 return (
                     <div key={idx} className={`w-full h-full rounded-md bg-white/30 border-2 border-white/50`} />
                 )
             })}
         </div>
      )}
    </div>
  );
};