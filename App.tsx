import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createEmptyGrid, canPlacePiece, placePiece, checkLines, clearLines, checkGameOver } from './utils/gameLogic';
import { getRandomShapes } from './constants';
import { Grid } from './components/Grid';
import { PieceSelector } from './components/PieceSelector';
import { BlockPiece } from './components/BlockPiece';
import { LevelUpModal } from './components/LevelUpModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { BlockShape, DragState, Coordinate } from './types';
import { Trophy, RotateCcw, Coins, Star, Target, Timer as TimerIcon, Home, RefreshCw, AlertTriangle } from 'lucide-react';

// Progression Constants
const BASE_LEVEL_SCORE = 1000;
const BASE_COIN_REWARD = 50;
const TIME_EXPECTATION_PER_LEVEL = 45;

type Difficulty = 'easy' | 'medium' | 'hard';
type GameStatus = 'welcome' | 'playing';

const App: React.FC = () => {
  // App State
  const [gameStatus, setGameStatus] = useState<GameStatus>('welcome');
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gridSize, setGridSize] = useState(8);

  // Persistent Stats
  const [highScore, setHighScore] = useState(0);
  const [maxLevel, setMaxLevel] = useState(1);
  const [coins, setCoins] = useState(0);

  // Game State
  const [grid, setGrid] = useState<any[][]>([]);
  const [score, setScore] = useState(0);
  const [availablePieces, setAvailablePieces] = useState<(BlockShape | null)[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [clearingCols, setClearingCols] = useState<number[]>([]);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  // Session Progression
  const [level, setLevel] = useState(1);
  const [targetScore, setTargetScore] = useState(BASE_LEVEL_SCORE);
  const [levelStartTime, setLevelStartTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelRewards, setLevelRewards] = useState({ base: 0, time: 0, taken: 0 });

  // Drag State
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    pieceIndex: null,
    origin: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
    pieceOffset: { x: 0, y: 0 },
    validDrop: null,
  });

  // Refs
  const boardRectRef = useRef<DOMRect | null>(null);
  const timerRef = useRef<number | null>(null);

  // --- Persistence Loading ---
  useEffect(() => {
    const storedHigh = localStorage.getItem('block-blast-highscore');
    if (storedHigh) setHighScore(parseInt(storedHigh, 10));

    const storedCoins = localStorage.getItem('block-blast-coins');
    if (storedCoins) setCoins(parseInt(storedCoins, 10));

    const storedMaxLvl = localStorage.getItem('block-blast-max-level');
    if (storedMaxLvl) setMaxLevel(parseInt(storedMaxLvl, 10));

    const storedName = localStorage.getItem('block-blast-player-name');
    if (storedName) setPlayerName(storedName);

    const storedDiff = localStorage.getItem('block-blast-difficulty');
    if (storedDiff) setDifficulty(storedDiff as Difficulty);
  }, []);

  // --- Persistence Saving ---
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('block-blast-highscore', score.toString());
    }
  }, [score, highScore]);

  useEffect(() => {
    localStorage.setItem('block-blast-coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    if (level > maxLevel) {
      setMaxLevel(level);
      localStorage.setItem('block-blast-max-level', level.toString());
    }
  }, [level, maxLevel]);

  useEffect(() => {
    localStorage.setItem('block-blast-player-name', playerName);
  }, [playerName]);

  useEffect(() => {
    localStorage.setItem('block-blast-difficulty', difficulty);
  }, [difficulty]);


  // --- Game Lifecycle ---

  const handleStartGame = () => {
    // Determine grid size
    let size = 8;
    if (difficulty === 'easy') size = 10;
    if (difficulty === 'hard') size = 6;
    setGridSize(size);
    
    // Initialize Game
    setGrid(createEmptyGrid(size));
    setScore(0);
    setAvailablePieces(getRandomShapes(3));
    setIsGameOver(false);
    setClearingRows([]);
    setClearingCols([]);
    
    // Reset Session Stats
    setLevel(1);
    setTargetScore(BASE_LEVEL_SCORE);
    setLevelStartTime(Date.now());
    setCurrentTime(0);
    
    setGameStatus('playing');
  };

  const resetGame = () => {
    // Re-initialize with current settings
    setGrid(createEmptyGrid(gridSize));
    setScore(0);
    setAvailablePieces(getRandomShapes(3));
    setIsGameOver(false);
    setClearingRows([]);
    setClearingCols([]);
    setLevel(1);
    setTargetScore(BASE_LEVEL_SCORE);
    setLevelStartTime(Date.now());
    setCurrentTime(0);
    setShowLevelUp(false);
    setShowRestartConfirm(false);
  };

  const handleRestartRequest = () => {
    setShowRestartConfirm(true);
  };

  const handleGoHome = () => {
    setGameStatus('welcome');
    setShowRestartConfirm(false);
  };

  // --- Timer Logic ---
  useEffect(() => {
    if (gameStatus === 'playing' && !isGameOver && !showLevelUp && !showRestartConfirm) {
        timerRef.current = window.setInterval(() => {
            const now = Date.now();
            setCurrentTime(Math.floor((now - levelStartTime) / 1000));
        }, 1000);
    }
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [levelStartTime, isGameOver, showLevelUp, gameStatus, showRestartConfirm]);


  // --- Logic Helpers ---

  const replenishPieces = useCallback((currentPieces: (BlockShape | null)[]) => {
    if (currentPieces.every((p) => p === null)) {
      setAvailablePieces(getRandomShapes(3));
    }
  }, []);

  const handleLevelClaim = () => {
    setCoins(c => c + levelRewards.base + levelRewards.time);
    setShowLevelUp(false);
    
    const nextLevel = level + 1;
    setLevel(nextLevel);
    
    const delta = BASE_LEVEL_SCORE + (nextLevel * 500); 
    setTargetScore(s => s + delta);
    
    setLevelStartTime(Date.now());
    setCurrentTime(0);
  };

  // Check Game Over
  useEffect(() => {
    if (gameStatus === 'playing' && clearingRows.length === 0 && clearingCols.length === 0 && !dragState.isDragging && availablePieces.length > 0 && !showLevelUp && !showRestartConfirm) {
        const timer = setTimeout(() => {
             const gameOver = checkGameOver(grid, availablePieces);
             if (gameOver) setIsGameOver(true);
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [grid, availablePieces, clearingRows.length, clearingCols.length, dragState.isDragging, showLevelUp, gameStatus, showRestartConfirm]);


  // --- Input Handling ---

  const handlePointerDown = (e: React.PointerEvent, index: number) => {
    e.preventDefault();
    const piece = availablePieces[index];
    if (!piece) return;

    const touchYOffset = -60; 

    setDragState({
      isDragging: true,
      pieceIndex: index,
      origin: { x: e.clientX, y: e.clientY },
      current: { x: e.clientX, y: e.clientY },
      pieceOffset: { x: 0, y: touchYOffset },
      validDrop: null,
    });

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.isDragging || dragState.pieceIndex === null) return;
    
    const newCurrent = { x: e.clientX, y: e.clientY };
    let validDrop: Coordinate | null = null;
    
    if (boardRectRef.current) {
      const rect = boardRectRef.current;
      const piece = availablePieces[dragState.pieceIndex]!;
      const cellSize = rect.width / gridSize;
      
      const pointerX = e.clientX + dragState.pieceOffset.x;
      const pointerY = e.clientY + dragState.pieceOffset.y;
      
      const relativeX = pointerX - rect.left;
      const relativeY = pointerY - rect.top;
      
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
      
      // 2. Update pieces
      const newPieces = [...availablePieces];
      newPieces[dragState.pieceIndex] = null;
      setAvailablePieces(newPieces);

      // 3. Check Lines
      const { rowsToClear, colsToClear } = checkLines(newGrid);
      const linesCleared = rowsToClear.length + colsToClear.length;
      
      const totalMoveScore = linesCleared > 0 ? linesCleared * 100 * (linesCleared > 1 ? linesCleared : 1) : 0;
      const newTotalScore = score + totalMoveScore;
      setScore(newTotalScore);

      // 4. Check Level Up
      if (newTotalScore >= targetScore && !showLevelUp) {
          const timeTaken = (Date.now() - levelStartTime) / 1000;
          const expectedTime = TIME_EXPECTATION_PER_LEVEL + (level * 10);
          
          let bonus = 0;
          if (timeTaken < expectedTime) {
             const timeDiff = Math.max(0, expectedTime - timeTaken);
             bonus = Math.floor(timeDiff * 2); 
          }

          setLevelRewards({
              base: BASE_COIN_REWARD + (level * 10),
              time: bonus,
              taken: timeTaken
          });
          setShowLevelUp(true);
      }

      // 5. Handle Grid Updates
      if (linesCleared > 0) {
        setClearingRows(rowsToClear);
        setClearingCols(colsToClear);
        setGrid(newGrid);
        
        setTimeout(() => {
          const clearedGrid = clearLines(newGrid, rowsToClear, colsToClear);
          setGrid(clearedGrid);
          setClearingRows([]);
          setClearingCols([]);
          replenishPieces(newPieces);
        }, 400);
      } else {
        setGrid(newGrid);
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

  const renderDragLayer = () => {
    if (!dragState.isDragging || dragState.pieceIndex === null) return null;
    const piece = availablePieces[dragState.pieceIndex]!;
    // Approx cell size for drag preview 
    const dragCellSize = 300 / gridSize; 
    
    return (
      <div
        className="fixed z-50 pointer-events-none opacity-90"
        style={{
          left: dragState.current.x,
          top: dragState.current.y,
          transform: `translate(-50%, -50%) translate(${dragState.pieceOffset.x}px, ${dragState.pieceOffset.y}px) scale(1.2)`,
        }}
      >
        <BlockPiece piece={piece} cellSize={dragCellSize} />
      </div>
    );
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, (score / targetScore) * 100);

  // --- Render ---

  if (gameStatus === 'welcome') {
      return (
          <WelcomeScreen 
              playerName={playerName}
              setPlayerName={setPlayerName}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              highScore={highScore}
              maxLevel={maxLevel}
              onStart={handleStartGame}
          />
      );
  }

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

      {/* Header Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
         <button 
           onClick={handleRestartRequest}
           className="p-2 rounded-full bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all backdrop-blur-md border border-slate-700"
         >
            <RefreshCw size={20} />
         </button>
         <button 
           onClick={handleGoHome}
           className="p-2 rounded-full bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all backdrop-blur-md border border-slate-700"
         >
            <Home size={20} />
         </button>
      </div>

      {/* Top HUD */}
      <div className="w-full max-w-md flex flex-col gap-2 mb-4 z-10 px-1 mt-8">
          <div className="flex justify-between items-center text-white">
               <div className="flex items-center gap-2">
                   <div className="bg-blue-600 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 shadow-lg">
                       <Star size={10} className="fill-white" />
                       LVL {level}
                   </div>
                   <div className="flex items-center gap-1 text-slate-400 text-xs font-mono bg-slate-800/50 px-2 py-0.5 rounded-full">
                       <TimerIcon size={10} />
                       {formatTimer(currentTime)}
                   </div>
               </div>

               <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1 rounded-full border border-yellow-500/20 shadow-lg">
                   <Coins size={14} className="text-yellow-400 fill-yellow-400/20" />
                   <span className="font-bold text-sm">{coins}</span>
               </div>
          </div>

          <div className="relative h-6 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
               <div 
                   className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 ease-out flex items-center justify-end pr-2"
                   style={{ width: `${progressPercent}%` }}
               />
               <div className="absolute inset-0 flex items-center justify-center gap-2 text-[10px] font-bold tracking-wider text-white drop-shadow-md">
                   <span>TARGET</span>
                   <Target size={10} />
                   <span>{score} / {targetScore}</span>
               </div>
          </div>
      </div>

      {/* Score */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 z-10 bg-slate-800/40 p-3 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div className="flex flex-col">
           <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase">High Score</span>
           <div className="flex items-center gap-1.5 text-yellow-400">
             <Trophy size={16} />
             <span className="text-xl font-black tracking-tight">{highScore}</span>
           </div>
        </div>
        
        <div className="flex flex-col items-end">
           <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase">Score</span>
           <span className="text-3xl font-black text-white tracking-tight leading-none">{score}</span>
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

      {/* Pieces */}
      <div className="w-full max-w-md z-10">
         <PieceSelector 
            pieces={availablePieces} 
            onPointerDown={handlePointerDown}
         />
      </div>

      {renderDragLayer()}

      {/* Modals */}
      {showLevelUp && (
        <LevelUpModal 
          level={level} 
          baseReward={levelRewards.base}
          timeBonus={levelRewards.time}
          timeTaken={levelRewards.taken}
          onClaim={handleLevelClaim} 
        />
      )}

      {/* Restart Confirmation Modal */}
      {showRestartConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-pop">
           <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700 text-center max-w-sm w-full mx-4">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="text-yellow-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Restart Game?</h3>
              <p className="text-slate-400 mb-6 text-sm">Current progress for this level will be lost. Are you sure you want to start over?</p>
              
              <div className="flex gap-3">
                <button 
                    onClick={() => setShowRestartConfirm(false)}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl transition-all"
                >
                    CANCEL
                </button>
                <button 
                    onClick={resetGame}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all"
                >
                    RESTART
                </button>
              </div>
           </div>
        </div>
      )}

      {isGameOver && !showLevelUp && !showRestartConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-pop">
           <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center max-w-sm w-full mx-4">
              <h2 className="text-3xl font-black text-white mb-2">GAME OVER</h2>
              <p className="text-slate-400 mb-6">Run Complete</p>
              
              <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
                 <div className="text-sm text-slate-400 uppercase tracking-widest mb-1">Final Score</div>
                 <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {score}
                 </div>
              </div>

               <div className="flex justify-center gap-4 text-sm text-slate-400 mb-6">
                   <div className="flex flex-col items-center">
                       <span className="font-bold text-white">LVL {level}</span>
                       <span className="text-[10px]">REACHED</span>
                   </div>
                   <div className="w-[1px] bg-slate-700"></div>
                   <div className="flex flex-col items-center">
                       <span className="font-bold text-white">{coins}</span>
                       <span className="text-[10px]">TOTAL COINS</span>
                   </div>
               </div>

              <div className="flex flex-col gap-3">
                <button 
                    onClick={resetGame}
                    className="w-full py-4 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw size={24} />
                    PLAY AGAIN
                </button>
                <button 
                    onClick={handleGoHome}
                    className="w-full py-3 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-slate-200 font-bold rounded-xl transition-all"
                >
                    MAIN MENU
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;