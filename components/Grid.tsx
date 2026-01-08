import React, { useRef, useLayoutEffect } from 'react';
import { GridType, BlockShape, Coordinate } from '../types';
import { BlockPiece } from './BlockPiece';

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
      <div className="grid grid-cols-8 grid-rows-8 gap-1 h-full w-full">
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

      {/* Preview Ghost Piece */}
      {previewDrop && (
        <div
          className="absolute pointer-events-none opacity-40 top-2 left-2 right-2 bottom-2" // matches grid padding/gap offset context essentially
        >
          {/* We need to render the ghost piece relative to the grid container.
              However, the grid uses CSS grid gap.
              It's easier to overlay the piece using absolute positioning relative to the container size.
          */}
           <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-1">
             {/* Invisible placeholder to maintain grid structure, then we place pieces absolute?
                 Actually simpler: render the specific cells of the preview piece.
             */}
              {previewDrop.piece.matrix.map((row, r) =>
                row.map((val, c) => {
                  if (val === 0) return null;
                  const gridR = previewDrop.coord.r + r;
                  const gridC = previewDrop.coord.c + c;
                  // Only render if within bounds (logic handles this but safe to check)
                  if(gridR >= 8 || gridC >= 8) return null;
                  
                  return (
                    <div 
                        key={`ghost-${r}-${c}`}
                        className="absolute rounded-md bg-white z-10"
                        style={{
                            width: `calc(100% / 8 - 4px)`, // approx logic, simplified below
                            height: `calc(100% / 8 - 4px)`,
                            left: `calc(${gridC} * (100% / 8) + 2px)`, // Adjust for gap
                            top: `calc(${gridR} * (100% / 8) + 2px)`
                        }}
                    />
                  )
                })
              )}
           </div>
        </div>
      )}
      
      {/* Better Ghost Implementation relying on Grid layout directly */}
      {previewDrop && (
         <div className="absolute inset-0 p-2 pointer-events-none z-10 grid grid-cols-8 grid-rows-8 gap-1">
             {Array(64).fill(0).map((_, idx) => {
                 const r = Math.floor(idx / 8);
                 const c = idx % 8;
                 
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
