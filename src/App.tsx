import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, ChevronUp, ChevronDown, Trophy, Sparkles, History, Zap, AlertCircle } from 'lucide-react';

// Symbols configuration
const SYMBOLS = [
  { id: 0, name: 'Cherry', multiplier: 2, color: 'text-red-500', icon: '🍒' },
  { id: 1, name: 'Lemon', multiplier: 3, color: 'text-yellow-400', icon: '🍋' },
  { id: 2, name: 'Seven', multiplier: 5, color: 'text-red-600', icon: '7️⃣' },
  { id: 3, name: 'Diamond', multiplier: 10, color: 'text-blue-400', icon: '💎' },
  { id: 4, name: 'Bonus', multiplier: 50, color: 'text-amber-400', icon: '👑' },
];

const REEL_COUNT = 3;
const MIN_BET = 10;
const MAX_BET = 100;

// simple Sound Engine using Web Audio API
class SlotAudio {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  playSpin() {
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx!.currentTime + 0.5);
    gain.gain.setValueAtTime(0.05, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.5);
  }

  playStop() {
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.frequency.setValueAtTime(220, this.ctx!.currentTime);
    gain.gain.setValueAtTime(0.1, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.1);
  }

  playWin() {
    this.init();
    [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.1, this.ctx!.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.1 + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(this.ctx!.currentTime + i * 0.1);
      osc.stop(this.ctx!.currentTime + i * 0.1 + 0.5);
    });
  }

  playCoin() {
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.frequency.setValueAtTime(987.77, this.ctx!.currentTime);
    gain.gain.setValueAtTime(0.1, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.2);
  }
}

const audio = new SlotAudio();

const Particle = ({ x, y }: { x: number; y: number, key?: any }) => (
  <motion.div
    initial={{ x, y, opacity: 1, scale: 1 }}
    animate={{ 
      x: x + (Math.random() - 0.5) * 400, 
      y: y + (Math.random() - 0.5) * 400 - 200, 
      opacity: 0,
      scale: 0,
      rotate: Math.random() * 360
    }}
    transition={{ duration: 1.5, ease: "easeOut" }}
    className="absolute text-2xl pointer-events-none z-50"
  >
    {['✨', '🪙', '💎', '💰', '🔥'][Math.floor(Math.random() * 5)]}
  </motion.div>
);

export default function App() {
  const [balance, setBalance] = useState(1000);
  const [displayBalance, setDisplayBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState(Array(REEL_COUNT).fill(0));
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [spinningReels, setSpinningReels] = useState(Array(REEL_COUNT).fill(false));
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<{ symbols: number[], win: number }[]>([]);
  const [showParticles, setShowParticles] = useState(false);

  // Smooth balance counter
  useEffect(() => {
    if (displayBalance === balance) return;
    const step = Math.ceil(Math.abs(balance - displayBalance) / 20);
    const timer = setTimeout(() => {
      setDisplayBalance(prev => {
        if (prev < balance) return Math.min(prev + step, balance);
        return Math.max(prev - step, balance);
      });
    }, 30);
    return () => clearTimeout(timer);
  }, [balance, displayBalance]);

  const adjustBet = (amount: number) => {
    if (isSpinning) return;
    setBet(prev => Math.min(Math.max(prev + amount, MIN_BET), MAX_BET));
    audio.playCoin();
  };

  const spin = async () => {
    if (isSpinning || balance < bet) return;

    setIsSpinning(true);
    setWinAmount(null);
    setShowParticles(false);
    setBalance(prev => prev - bet);

    const newResults = Array(REEL_COUNT).fill(0).map(() => Math.floor(Math.random() * SYMBOLS.length));
    
    // Start staggered spin
    for (let i = 0; i < REEL_COUNT; i++) {
      setTimeout(() => {
        setSpinningReels(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        audio.playSpin();
      }, i * 200);
    }

    // Stop staggered spin
    for (let i = 0; i < REEL_COUNT; i++) {
      await new Promise(resolve => setTimeout(resolve, 800 + i * 400));
      audio.playStop();
      setSpinningReels(prev => {
        const next = [...prev];
        next[i] = false;
        return next;
      });
      setReels(prev => {
        const next = [...prev];
        next[i] = newResults[i];
        return next;
      });
    }

    // Check win
    const isWin = newResults[0] === newResults[1] && newResults[1] === newResults[2];
    if (isWin) {
      const multiplier = SYMBOLS[newResults[0]].multiplier;
      const won = bet * multiplier;
      setStreak(prev => prev + 1);
      setTimeout(() => {
        audio.playWin();
        setWinAmount(won);
        setBalance(prev => prev + won);
        if (multiplier >= 10) setShowParticles(true);
      }, 300);
    } else {
      setStreak(0);
    }

    // Add to history
    setHistory(prev => [{ symbols: newResults, win: isWin ? (bet * SYMBOLS[newResults[0]].multiplier) : 0 }, ...prev].slice(0, 5));
    setIsSpinning(false);
  };

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white flex flex-col font-sans select-none overflow-hidden relative">
      {/* Particles Source */}
      {showParticles && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
          {[...Array(30)].map((_, i) => (
            <Particle key={i} x={typeof window !== 'undefined' ? window.innerWidth / 2 : 0} y={typeof window !== 'undefined' ? window.innerHeight / 2 : 0} />
          ))}
        </div>
      )}

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.15)_0%,rgba(0,0,0,0)_70%)]" />
      </div>

      {/* Header Section */}
      <header className="z-20 flex flex-col sm:flex-row justify-between items-center px-6 sm:px-10 py-4 sm:py-6 bg-black/40 border-b border-indigo-500/30 backdrop-blur-md gap-4 sm:gap-0">
        <div className="flex flex-col items-center sm:items-start">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            LUCKY REELS
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-indigo-300/60 uppercase tracking-[0.2em]">v2.0 Premium</span>
            {streak > 1 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 bg-orange-500/20 px-2 py-0.5 rounded-full border border-orange-500/50">
                <Zap size={10} className="fill-orange-500 text-orange-500" />
                <span className="text-[10px] font-bold text-orange-500">{streak}X STREAK</span>
              </motion.div>
            )}
          </div>
        </div>
        <div className="flex gap-4 sm:gap-8 items-center">
          <div className="text-right">
            <p className="text-[10px] uppercase text-indigo-300/50 mb-1 font-bold tracking-wider">Balance</p>
            <div className="flex flex-col items-end">
              <p className="text-2xl sm:text-3xl font-mono text-white leading-none flex items-center justify-end gap-2">
                {displayBalance.toLocaleString()} <span className="text-indigo-400 text-sm">CR</span>
              </p>
              {balance < 100 && (
                <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="flex items-center gap-1 text-[10px] text-red-500 font-bold mt-1">
                  <AlertCircle size={10} />
                  LOW BALANCE
                </motion.div>
              )}
            </div>
          </div>
          <div className="h-10 w-[1px] bg-indigo-500/20 self-center"></div>
          <div className="text-right">
            <p className="text-[10px] uppercase text-amber-400/50 mb-1 font-bold tracking-wider">Current Bet</p>
            <p className="text-2xl sm:text-3xl font-mono text-amber-400 leading-none flex items-center justify-end gap-2">
              {bet} <span className="text-sm">CR</span>
            </p>
          </div>
        </div>
      </header>

      <main className="z-10 flex-grow flex flex-col lg:flex-row items-center justify-center p-4 sm:p-12 gap-6 sm:gap-12 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Payout Table (Left) */}
        <aside className="hidden lg:flex w-72 bg-black/30 rounded-3xl border border-indigo-500/20 p-8 flex-col gap-4 backdrop-blur-sm self-center">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300 border-b border-indigo-500/20 pb-3 mb-1">Payout Multipliers</h2>
          {SYMBOLS.map((s) => (
            <div key={s.id} className="flex justify-between items-center text-sm group">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center text-lg shadow-inner`}>
                  {s.icon}
                </div>
                <span className="text-white/80 font-medium">{s.name}</span>
              </div>
              <span className={`font-bold font-mono ${s.id === 4 ? 'text-amber-400' : 'text-indigo-300'}`}>
                {s.multiplier}x
              </span>
            </div>
          )).reverse()}
        </aside>

        {/* The Reels Section */}
        <div className="flex flex-col gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[540px] h-[300px] sm:h-[400px] bg-slate-900/40 rounded-[30px] sm:rounded-[40px] border-4 border-indigo-900/50 p-4 sm:p-6 shadow-[0_0_100px_rgba(49,46,129,0.3)] flex gap-2 sm:gap-4 overflow-hidden backdrop-blur-sm">
            {/* Payline Indicator */}
            <div className="absolute top-1/2 left-0 right-0 h-[100px] sm:h-[120px] -translate-y-1/2 bg-indigo-500/5 border-y border-indigo-400/30 z-20 pointer-events-none shadow-[0_0_30px_rgba(129,140,248,0.1)]"></div>
            
            {reels.map((symbolIndex, i) => (
              <div key={i} className="flex-grow h-full bg-[#16213e] rounded-xl sm:rounded-2xl border border-white/5 relative overflow-hidden shadow-inner">
                <motion.div
                  animate={spinningReels[i] ? {
                    y: [-2000, 0],
                    transition: {
                      repeat: Infinity,
                      duration: 0.15,
                      ease: "linear"
                    }
                  } : {
                    y: 0
                  }}
                  className="flex flex-col items-center"
                >
                  {spinningReels[i] ? (
                     [...Array(15)].map((_, j) => (
                      <div key={j} className="h-[100px] sm:h-[120px] flex items-center justify-center text-3xl sm:text-5xl blur-[1px] opacity-20 filter grayscale">
                        {SYMBOLS[j % SYMBOLS.length].icon}
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-24 sm:py-24">
                      <motion.div 
                        initial={{ scale: 0.8, filter: 'blur(10px)', opacity: 0 }}
                        animate={{ scale: 1, filter: 'blur(0px)', opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="h-[100px] sm:h-[120px] flex items-center justify-center text-4xl sm:text-7xl select-none"
                      >
                        {SYMBOLS[symbolIndex].icon}
                      </motion.div>
                    </div>
                  )}
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center px-4 font-mono">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isSpinning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-[10px] text-white/40 uppercase tracking-widest">
                {isSpinning ? 'Rolling...' : 'Ready to Spin'}
              </span>
            </div>
            <div className="hidden sm:block text-[10px] text-white/20 uppercase tracking-widest">
              Live RTP: 96.5%
            </div>
          </div>
        </div>

        {/* History Panel (Right) */}
        <aside className="w-full sm:w-auto lg:w-48 bg-black/30 rounded-3xl border border-indigo-500/20 p-6 flex flex-col gap-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-indigo-300 border-b border-indigo-500/20 pb-2">
            <History size={14} />
            <h2 className="text-[10px] font-bold uppercase tracking-widest">History</h2>
          </div>
          <div className="flex flex-col gap-2">
            {history.length === 0 ? (
              <span className="text-[10px] text-white/20 text-center py-4 italic">No spins yet</span>
            ) : (
              history.map((h, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="flex gap-1">
                    {h.symbols.map((s, j) => (
                      <span key={j} className="text-[10px]">{SYMBOLS[s].icon}</span>
                    ))}
                  </div>
                  <span className={`text-[10px] font-bold ${h.win > 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                    {h.win > 0 ? `+${h.win}` : '0'}
                  </span>
                </div>
              ))
            )}
          </div>
        </aside>
      </main>

      {/* Footer Controls */}
      <footer className="z-20 bg-black/60 p-4 sm:p-10 border-t border-indigo-500/30 flex flex-col sm:flex-row justify-between items-center backdrop-blur-xl gap-6 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-16 w-full sm:w-auto">
          <div className="flex flex-col gap-2 w-full sm:w-auto items-center sm:items-start">
            <span className="text-[10px] uppercase font-bold text-indigo-400/70 tracking-[0.3em]">Stake Amount</span>
            <div className="flex items-center gap-2 bg-indigo-500/10 p-1 rounded-2xl border border-indigo-500/20">
              <button 
                onClick={() => adjustBet(-10)}
                disabled={isSpinning || bet <= MIN_BET}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xl font-bold hover:bg-indigo-500/40 disabled:opacity-20 transition-all text-indigo-300"
              >
                <ChevronDown size={20} />
              </button>
              <span className="text-2xl sm:text-3xl font-mono px-4 sm:px-6 font-black min-w-[60px] sm:min-w-[80px] text-center">{bet}</span>
              <button 
                onClick={() => adjustBet(10)}
                disabled={isSpinning || bet >= MAX_BET}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xl font-bold hover:bg-indigo-500/40 disabled:opacity-20 transition-all text-indigo-300"
              >
                <ChevronUp size={20} />
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => { if(!isSpinning) { setBet(MIN_BET); audio.playCoin(); } }}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-indigo-500/30 rounded-xl text-[10px] font-black tracking-widest uppercase bg-indigo-500/5 hover:bg-indigo-500/20 active:bg-indigo-500/40 transition-colors"
            >
              MIN (10)
            </button>
            <button 
              onClick={() => { if(!isSpinning) { setBet(MAX_BET); audio.playCoin(); } }}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-indigo-500/30 rounded-xl text-[10px] font-black tracking-widest uppercase bg-indigo-500/5 hover:bg-indigo-500/20 active:bg-indigo-500/40 transition-colors"
            >
              MAX (100)
            </button>
          </div>
        </div>

        <button
          onClick={spin}
          disabled={isSpinning || balance < bet}
          className={`
            group relative w-full sm:w-64 h-20 sm:h-24 rounded-2xl sm:rounded-[2rem] overflow-hidden transition-all duration-300 transform active:translate-y-1 active:scale-95
            ${isSpinning || balance < bet 
              ? 'grayscale opacity-50 cursor-not-allowed' 
              : 'shadow-[0_20px_50px_-15px_rgba(79,70,229,0.7)]'}
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-700 via-indigo-500 to-purple-600 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative flex flex-col items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-0.5">Initialize</span>
            <span className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter">PLAY</span>
          </div>
        </button>
      </footer>

      {/* Win Celebration Overlay */}
      <AnimatePresence>
        {winAmount !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f0c29]/80 backdrop-blur-md pointer-events-none"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-black/90 px-8 sm:px-16 py-8 sm:py-12 rounded-[2rem] sm:rounded-[4rem] border-4 border-amber-400 shadow-[0_0_100px_rgba(251,191,36,0.3)] flex flex-col items-center"
            >
              <div className="mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                >
                  <Trophy className="text-amber-400" size={60} />
                </motion.div>
              </div>
              <span className="text-xs font-black tracking-[0.5em] text-amber-400/80 mb-2 uppercase text-center sm:tracking-[1em] sm:ml-[1em]">Big Win Result</span>
              <motion.span 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="text-6xl sm:text-8xl font-black text-white italic drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
              >
                +{winAmount}
              </motion.span>
              <div className="mt-6 flex gap-4">
                {[...Array(3)].map((_, i) => (
                  <Sparkles key={i} className="text-amber-400 animate-pulse" size={24} />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

