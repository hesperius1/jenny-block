import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createEmptyGrid, canPlacePiece, placePiece, checkLines, clearLines, checkGameOver } from './utils/gameLogic';
import { getRandomShapes, GRID_SIZE } from './constants';
import { Grid } from './components/Grid';
import { PieceSelector } from './components/PieceSelector';
import { BlockPiece } from './components/BlockPiece';
import { BlockShape, GameState, DragState, Coordinate } from './types';
import { Trophy, RotateCcw } from 'lucide-react';

// Sound effects (dummy URLs or standard bleeps - using empty strings to disable for now, can implement WebAudio later)
// Keeping it simple visual only.

const App: React.FC = () => {
  // Game State
  const [grid, setGrid] = useState(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [availablePieces, setAvailablePieces] = useState<(BlockShape | null)[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [clearingCols, setClearingCols] = useState<number[]>([]);

  // Drag State
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    pieceIndex: null,
    origin: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
    pieceOffset: { x: 0, y: 0 },
    validDrop: null,
  });

  // Refs for board measurements
  const boardRectRef = useRef<DOMRect | null>(null);

  // Initialize Game
  useEffect(() => {
    startNewGame();
    const stored = localStorage.getItem('block-blast-highscore');
    if (stored) setHighScore(parseInt(stored, 10));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('block-blast-highscore', score.toString());
    }
  }, [score, highScore]);

  const startNewGame = () => {
    setGrid(createEmptyGrid());
    setScore(0);
    setAvailablePieces(getRandomShapes(3));
    setIsGameOver(false);
    setClearingRows([]);
    setClearingCols([]);
  };

  const replenishPieces = useCallback((currentPieces: (BlockShape | null)[]) => {
    if (currentPieces.every((p) => p === null)) {
      setAvailablePieces(getRandomShapes(3));
    }
  }, []);

  // Check Game Over whenever grid or pieces change
  useEffect(() => {
    // We only check if we are NOT currently clearing lines (animation state) and NOT dragging
    if (clearingRows.length === 0 && clearingCols.length === 0 && !dragState.isDragging && availablePieces.length > 0) {
        // Small delay to let React state settle
        const timer = setTimeout(() => {
             const gameOver = checkGameOver(grid, availablePieces);
             if (gameOver) setIsGameOver(true);
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [grid, availablePieces, clearingRows.length, clearingCols.length, dragState.isDragging]);


  // --- Input Handling ---

  const handlePointerDown = (e: React.PointerEvent, index: number) => {
    e.preventDefault(); // Stop default touch actions
    const piece = availablePieces[index];
    if (!piece) return;

    // Calculate offset to center the piece under finger/cursor
    // Or slightly above for visibility (especially on mobile)
    const touchYOffset = -60; 

    setDragState({
      isDragging: true,
      pieceIndex: index,
      origin: { x: e.clientX, y: e.clientY },
      current: { x: e.clientX, y: e.clientY },
      pieceOffset: { x: 0, y: touchYOffset },
      validDrop: null,
    });

    // Capture pointer to handle moves outside the element
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.isDragging || dragState.pieceIndex === null) return;
    
    // Update current position
    const newCurrent = { x: e.clientX, y: e.clientY };
    
    // Calculate grid position
    let validDrop: Coordinate | null = null;
    
    if (boardRectRef.current) {
      const rect = boardRectRef.current;
      const piece = availablePieces[dragState.pieceIndex]!;
      
      // Calculate where the TOP-LEFT of the piece is, relative to screen
      // We are dragging the 'center' or touch point. 
      // We need to approximate which cell the top-left of the piece is hovering over.
      
      // To improve UX: We treat the pointer as the center of the piece roughly.
      const pieceWidthPx = piece.matrix[0].length * 30; // approx
      const pieceHeightPx = piece.matrix.length * 30;
      
      const pointerX = e.clientX + dragState.pieceOffset.x;
      const pointerY = e.clientY + dragState.pieceOffset.y;
      
      // Relative to board
      const relativeX = pointerX - rect.left;
      const relativeY = pointerY - rect.top;
      
      const cellSize = rect.width / GRID_SIZE;
      
      // Center the piece on the pointer
      const colFloat = (relativeX - (pieceWidthPx / 2) + (cellSize * 1.5)) / cellSize; 
      const rowFloat = (relativeY - (pieceHeightPx / 2) + (cellSize * 1.5)) / cellSize;

      // Simplification: Direct mapping from pointer to cell
      // Let's assume the user is dragging the "center" of the shape.
      // We want to find the top-left cell index.
      const centerR = Math.floor(relativeY / cellSize);
      const centerC = Math.floor(relativeX / cellSize);

      // Adjust to find top-left based on shape dimensions
      const r = Math.round((relativeY / cellSize) - (piece.matrix.length / 2));
      const c = Math.round((relativeX / cellSize) - (piece.matrix[0].length / 2));
      
      if (canPlacePiece(grid, piece.matrix, r, c)) {
        validDrop = { r, c };
      }
    }

    setDragState((prev) => ({
      ...prev,
      current: newCurrent,
      validDrop,
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragState.isDragging || dragState.pieceIndex === null) return;

    const piece = availablePieces[dragState.pieceIndex]!;
    
    if (dragState.validDrop) {
      // 1. Place Piece
      const newGrid = placePiece(grid, piece, dragState.validDrop.r, dragState.validDrop.c);
      
      // 2. Calculate Score (Base score for placement)
      const placementScore = piece.matrix.flat().filter(x => x === 1).length * 10;
      
      // 3. Remove piece from hand
      const newPieces = [...availablePieces];
      newPieces[dragState.pieceIndex] = null;
      setAvailablePieces(newPieces);

      // 4. Check Lines
      const { rowsToClear, colsToClear } = checkLines(newGrid);
      
      if (rowsToClear.length > 0 || colsToClear.length > 0) {
        // Handle clearing animation and logic
        setClearingRows(rowsToClear);
        setClearingCols(colsToClear);
        
        // Update Grid (temporarily full, animation plays via CSS on Board)
        setGrid(newGrid);
        
        // Wait for animation then clear
        setTimeout(() => {
          const clearedGrid = clearLines(newGrid, rowsToClear, colsToClear);
          setGrid(clearedGrid);
          setClearingRows([]);
          setClearingCols([]);
          
          // Add clearing score
          const linesCleared = rowsToClear.length + colsToClear.length;
          // Simple combo formula
          const clearScore = linesCleared * 100 * (linesCleared > 1 ? linesCleared : 1); 
          setScore(s => s + placementScore + clearScore);

          replenishPieces(newPieces);
        }, 400); // 400ms matches CSS transition
      } else {
        setGrid(newGrid);
        setScore(s => s + placementScore);
        replenishPieces(newPieces);
      }
      
    }

    setDragState({
      isDragging: false,
      pieceIndex: null,
      origin: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
      pieceOffset: { x: 0, y: 0 },
      validDrop: null,
    });
  };

  // Helper for rendering the dragged piece following cursor
  const renderDragLayer = () => {
    if (!dragState.isDragging || dragState.pieceIndex === null) return null;
    const piece = availablePieces[dragState.pieceIndex]!;
    
    return (
      <div
        className="fixed z-50 pointer-events-none opacity-90"
        style={{
          left: dragState.current.x,
          top: dragState.current.y,
          transform: `translate(-50%, -50%) translate(${dragState.pieceOffset.x}px, ${dragState.pieceOffset.y}px) scale(1.2)`, // Scale up slightly for feedback
        }}
      >
        <BlockPiece piece={piece} cellSize={30} />
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-8 z-10">
        <div className="flex flex-col">
           <span className="text-slate-400 text-sm font-bold tracking-wider">HIGHSCORE</span>
           <div className="flex items-center gap-2 text-yellow-400">
             <Trophy size={20} />
             <span className="text-2xl font-black">{highScore}</span>
           </div>
        </div>
        
        <div className="flex flex-col items-end">
           <span className="text-slate-400 text-sm font-bold tracking-wider">SCORE</span>
           <span className="text-4xl font-black text-white">{score}</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="w-full max-w-md z-10">
        <Grid 
          grid={grid}
          onBoardMount={(rect) => boardRectRef.current = rect}
          previewDrop={dragState.isDragging && dragState.validDrop && dragState.pieceIndex !== null ? { 
            coord: dragState.validDrop, 
            piece: availablePieces[dragState.pieceIndex]! 
          } : null}
          clearingRows={clearingRows}
          clearingCols={clearingCols}
        />
      </div>

      {/* Controls / Pieces */}
      <div className="w-full max-w-md z-10">
         <PieceSelector 
            pieces={availablePieces} 
            onPointerDown={handlePointerDown}
         />
      </div>

      {/* Drag Layer */}
      {renderDragLayer()}

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-pop">
           <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center max-w-sm w-full mx-4">
              <h2 className="text-3xl font-black text-white mb-2">NO MOVES!</h2>
              <p className="text-slate-400 mb-6">Your blocks have no place to go.</p>
              
              <div className="bg-slate-900/50 rounded-xl p-4 mb-8">
                 <div className="text-sm text-slate-400 uppercase tracking-widest mb-1">Final Score</div>
                 <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {score}
                 </div>
              </div>

              <button 
                onClick={startNewGame}
                className="w-full py-4 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={24} />
                PLAY AGAIN
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
