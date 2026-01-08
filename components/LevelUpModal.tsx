import React from 'react';
import { Trophy, Coins, Clock, Zap } from 'lucide-react';

interface LevelUpModalProps {
  level: number;
  baseReward: number;
  timeBonus: number;
  timeTaken: number; // in seconds
  onClaim: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ 
  level, 
  baseReward, 
  timeBonus, 
  timeTaken,
  onClaim 
}) => {
  const totalReward = baseReward + timeBonus;
  
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-pop">
       <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl border border-yellow-500/30 text-center max-w-sm w-full mx-4 relative overflow-hidden">
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500" />
          
          <div className="mb-4 inline-flex p-3 rounded-full bg-yellow-400/10 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
            <Trophy size={40} className="animate-bounce" />
          </div>

          <h2 className="text-3xl font-black text-white mb-1">LEVEL COMPLETED!</h2>
          <p className="text-yellow-400 font-bold text-lg mb-6">LEVEL {level} &rarr; {level + 1}</p>
          
          <div className="bg-slate-900/60 rounded-xl p-4 mb-6 border border-slate-700/50 space-y-3">
             
             {/* Time Stats */}
             <div className="flex justify-between items-center text-slate-300 text-sm border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-blue-400" />
                    <span>Time Taken</span>
                </div>
                <span className="font-mono font-bold text-white">{formatTime(timeTaken)}</span>
             </div>

             {/* Base Reward */}
             <div className="flex justify-between items-center text-slate-300 text-sm">
                <div className="flex items-center gap-2">
                    <Coins size={14} className="text-yellow-500" />
                    <span>Stage Cleared</span>
                </div>
                <span className="font-bold text-white">+{baseReward}</span>
             </div>

             {/* Speed Bonus */}
             {timeBonus > 0 && (
                 <div className="flex justify-between items-center text-emerald-400 text-sm animate-pulse">
                    <div className="flex items-center gap-2">
                        <Zap size={14} />
                        <span>Speed Bonus</span>
                    </div>
                    <span className="font-bold">+{timeBonus}</span>
                 </div>
             )}

             {/* Total */}
             <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Total Earned</span>
                <div className="flex items-center gap-1 text-2xl font-black text-yellow-400">
                    <Coins size={20} className="fill-yellow-400/20" />
                    <span>{totalReward}</span>
                </div>
             </div>
          </div>

          <button 
            onClick={onClaim}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-900 font-black text-lg rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            NEXT LEVEL
          </button>
       </div>
    </div>
  );
};