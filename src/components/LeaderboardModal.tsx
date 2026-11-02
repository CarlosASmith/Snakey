import React, { useState, useEffect } from 'react';
import { Trophy, X, Globe, User, RefreshCw, Award, Sparkles, Check } from 'lucide-react';
import { LeaderboardEntry } from '../types/game';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScore?: number;
  currentLevel?: number;
  treasuresCollected?: number;
  segmentsDestroyed?: number;
  timeElapsed?: number;
  onScoreSubmitted?: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentScore = 0,
  currentLevel = 1,
  treasuresCollected = 0,
  segmentsDestroyed = 0,
  timeElapsed = 0,
  onScoreSubmitted,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('cyberviper_player_name') || 'CyberRunner';
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'level'>('all');

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        if (data.leaderboard) {
          setEntries(data.leaderboard);
        }
      }
    } catch {
      // offline fallback
      const saved = localStorage.getItem('cyberviper_local_leaderboard');
      if (saved) {
        setEntries(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
      setHasSubmitted(false);
      setUserRank(null);
    }
  }, [isOpen]);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || currentScore <= 0 || submitting || hasSubmitted) return;

    setSubmitting(true);
    localStorage.setItem('cyberviper_player_name', playerName.trim());

    try {
      const payload = {
        name: playerName.trim(),
        score: currentScore,
        level: currentLevel,
        treasuresCollected,
        segmentsDestroyed,
        timeElapsed,
        country: 'US',
      };

      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.leaderboard) {
          setEntries(data.leaderboard);
        }
        if (data.rank) {
          setUserRank(data.rank);
        }
        setHasSubmitted(true);
        if (onScoreSubmitted) onScoreSubmitted();
      }
    } catch {
      // Fallback
      setHasSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const displayEntries = selectedFilter === 'level'
    ? entries.filter(e => e.level >= currentLevel)
    : entries;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Global Leaderboard</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Submit Current Game Score Banner (if positive score available) */}
        {currentScore > 0 && !hasSubmitted && (
          <form onSubmit={handleSubmitScore} className="p-4 bg-cyan-950/40 border-b border-cyan-800/40 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cyan-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Submit Match Score
              </span>
              <span className="text-sm font-extrabold text-white font-mono-numbers">
                {currentScore.toLocaleString()} PTS
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  maxLength={16}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your Runner Tag"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !playerName.trim()}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors shrink-0 cursor-pointer"
              >
                {submitting ? 'Posting...' : 'Post Score'}
              </button>
            </div>
          </form>
        )}

        {hasSubmitted && userRank && (
          <div className="px-4 py-2.5 bg-emerald-950/40 border-b border-emerald-800/50 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Score verified! You ranked:</span>
            </div>
            <span className="font-extrabold text-sm text-white font-mono-numbers">
              #{userRank} Globally
            </span>
          </div>
        )}

        {/* Filter controls */}
        <div className="flex items-center justify-between px-5 py-2 border-b border-slate-800 bg-slate-950/30 text-xs">
          <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-lg">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setSelectedFilter('level')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                selectedFilter === 'level'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Level {currentLevel}+
            </button>
          </div>

          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="flex items-center gap-1 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="text-xs">Fetching global competitive rankings...</span>
            </div>
          ) : displayEntries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No recorded entries yet. Be the first to place!
            </div>
          ) : (
            displayEntries.map((entry, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              const isCurrentUser = entry.name === playerName && hasSubmitted;

              return (
                <div
                  key={entry.id || index}
                  className={`flex items-center justify-between px-4 py-2.5 text-xs transition-colors ${
                    isCurrentUser ? 'bg-cyan-500/10' : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left: Rank & Player info */}
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className="w-6 flex items-center justify-center font-mono-numbers font-bold text-xs">
                      {rank === 1 ? (
                        <Award className="w-4 h-4 text-amber-400" />
                      ) : rank === 2 ? (
                        <Award className="w-4 h-4 text-slate-300" />
                      ) : rank === 3 ? (
                        <Award className="w-4 h-4 text-amber-600" />
                      ) : (
                        <span className="text-slate-400">#{rank}</span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-semibold ${isTop3 ? 'text-white' : 'text-slate-200'}`}>
                          {entry.name}
                        </span>
                        {entry.country && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {entry.country}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Level {entry.level} · {entry.segmentsDestroyed} segments destroyed
                      </span>
                    </div>
                  </div>

                  {/* Right: Score */}
                  <div className="flex flex-col items-end">
                    <span className="font-extrabold text-sm text-cyan-400 font-mono-numbers">
                      {entry.score.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {entry.treasuresCollected} treasures
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Global Sync</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
