import React from 'react';
import { Trophy, Star, User, Play, LayoutGrid } from 'lucide-react';

interface WelcomeScreenProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  difficulty: 'easy' | 'medium' | 'hard';
  setDifficulty: (diff: 'easy' | 'medium' | 'hard') => void;
  highScore: number;
  maxLevel: number;
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  playerName,
  setPlayerName,
  difficulty,
  setDifficulty,
  highScore,
  maxLevel,
  onStart
}) => {
  
  const getGridSize = (diff: string) => {
    switch(diff) {
        case 'easy': return '10x10';
        case 'medium': return '8x8';
        case 'hard': return '6x6';
        default: return '8x8';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="z-10 w-full max-w-sm space-y-8 animate-pop">
        {/* Header */}
        <div className="text-center space-y-2">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg tracking-tighter">
                JENNY BLOCKS
            </h1>
        </div>

        {/* Stats Card */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-4">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Top Player</span>
                    <span className="text-white font-bold text-lg">{playerName || 'Guest'}</span>
                </div>
                <div className="bg-slate-700/50 p-2 rounded-lg">
                    <User className="text-slate-400" size={24} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50 flex flex-col items-center justify-center">
                    <Trophy className="text-yellow-400 mb-1" size={24} />
                    <span className="text-2xl font-black text-white">{highScore}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">High Score</span>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50 flex flex-col items-center justify-center">
                    <Star className="text-blue-400 mb-1" size={24} />
                    <span className="text-2xl font-black text-white">{maxLevel}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Max Level</span>
                </div>
            </div>
        </div>

        {/* Configuration */}
        <div className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1">
                <label className="text-xs text-slate-400 font-bold uppercase ml-1">Player Name</label>
                <input 
                    type="text" 
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 outline-none transition-all font-bold"
                />
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
                <label className="text-xs text-slate-400 font-bold uppercase ml-1">Select Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                        <button
                            key={diff}
                            onClick={() => setDifficulty(diff)}
                            className={`relative overflow-hidden p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1 ${
                                difficulty === diff 
                                ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                                : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600'
                            }`}
                        >
                            <span className={`font-black uppercase text-sm ${difficulty === diff ? 'text-blue-400' : 'text-slate-400'}`}>
                                {diff}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{getGridSize(diff)}</span>
                        </button>
                    ))}
                </div>
                <p className="text-center text-xs text-slate-500 italic mt-2">
                    {difficulty === 'easy' && "Large grid (10x10). Plenty of space!"}
                    {difficulty === 'medium' && "Standard grid (8x8). The classic experience."}
                    {difficulty === 'hard' && "Small grid (6x6). Tight and challenging!"}
                </p>
            </div>
        </div>

        {/* Start Button */}
        <button 
            onClick={onStart}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 p-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95"
        >
            <div className="relative z-10 flex items-center justify-center gap-2">
                <span className="text-xl font-black text-white tracking-wide">START GAME</span>
                <Play className="fill-white text-white group-hover:translate-x-1 transition-transform" />
            </div>
            {/* Shine effect */}
            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-flash" />
        </button>
      </div>
    </div>
  );
};