import React, { useEffect, useState } from 'react';
import { CardAnimation, CardRank, CardSuit, GameState, PlayState } from '../game/model/enums';
import { useGameStore } from '../store/gameStore';
import { useDebugStore } from '../store/debugStore';
import type { Card } from '../game/model/types';

// ─── helpers ────────────────────────────────────────────────────────────────

const RANKS: { label: string; value: CardRank }[] = [
  { label: 'A', value: CardRank.Ace },
  { label: '2', value: CardRank.Two },
  { label: '3', value: CardRank.Three },
  { label: '4', value: CardRank.Four },
  { label: '5', value: CardRank.Five },
  { label: '6', value: CardRank.Six },
  { label: '7', value: CardRank.Seven },
  { label: '8', value: CardRank.Eight },
  { label: '9', value: CardRank.Nine },
  { label: '10', value: CardRank.Ten },
  { label: 'J', value: CardRank.Jack },
  { label: 'Q', value: CardRank.Queen },
  { label: 'K', value: CardRank.King },
];

const SUITS: { label: string; value: CardSuit }[] = [
  { label: '♠', value: CardSuit.Spades },
  { label: '♥', value: CardSuit.Hearts },
  { label: '♦', value: CardSuit.Diamonds },
  { label: '♣', value: CardSuit.Clubs },
];

const GAME_STATES = Object.entries(GameState)
  .filter(([, v]) => typeof v === 'number')
  .map(([label, value]) => ({ label, value: value as GameState }));

const PLAY_STATES = Object.entries(PlayState)
  .filter(([, v]) => typeof v === 'number')
  .map(([label, value]) => ({ label, value: value as PlayState }));

// No explicit font-size — inherits ~11px from the scaled outer container
const sel =
  'bg-black/60 border border-white/20 rounded px-1 py-0.5 text-white/80 font-mono focus:outline-none focus:border-white/50';

const btn = (extra = '') => `px-2 py-1 rounded border font-mono transition-colors ${extra}`;

// ─── component ──────────────────────────────────────────────────────────────

const DebugPanel: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const { paused, setPaused } = useDebugStore();

  // card builder state
  const [rank, setRank] = useState<CardRank>(CardRank.Ten);
  const [suit, setSuit] = useState<CardSuit>(CardSuit.Spades);
  const [target, setTarget] = useState<'dealer' | number>('dealer');
  const [flipped, setFlipped] = useState(false);
  const [isDoubled, setIsDoubled] = useState(false);

  const {
    gameState,
    playState,
    currentFocus,
    currentBalance,
    playerCards,
    dealerCards,
    handBets,
    setPlayerCards,
    setDealerCards,
    setCurrentBalance,
    setGameState,
    setPlayState,
    setHandBets,
    setCurrentFocus,
    setTotalWagered,
  } = useGameStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '`') setVisible((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── card builder ──────────────────────────────────────────────────────────

  const addCard = () => {
    const card: Card = {
      rank,
      suit,
      ...(flipped ? { isFlipped: true } : {}),
      ...(isDoubled
        ? {
            animation: CardAnimation.DoubleDown,
            style: { transform: 'rotate(90deg)', left: '32%' },
          }
        : {}),
    };

    if (target === 'dealer') {
      setDealerCards([...dealerCards, card]);
    } else {
      const idx = target as number;
      const next = [...playerCards];
      while (next.length <= idx) next.push([]);
      next[idx] = [...(next[idx] ?? []), card];
      setPlayerCards(next);
    }
  };

  const clearHand = (idx: number) => {
    setPlayerCards(playerCards.map((h, i) => (i === idx ? [] : h)));
  };

  const clearDealer = () => setDealerCards([]);

  const addNewHand = () => {
    setPlayerCards([...playerCards, []]);
    setHandBets([...handBets, handBets[0] ?? 100]);
    setTotalWagered(handBets.reduce((a, b) => a + b, 0) + (handBets[0] ?? 100));
  };

  const removeHand = (idx: number) => {
    const next = playerCards.filter((_, i) => i !== idx);
    const nextBets = handBets.filter((_, i) => i !== idx);
    setPlayerCards(next);
    setHandBets(nextBets);
    setTotalWagered(nextBets.reduce((a, b) => a + b, 0));
    if (currentFocus >= next.length) setCurrentFocus(Math.max(0, next.length - 1));
  };

  const toggleCardFlip = (handIdx: number | 'dealer', cardIdx: number) => {
    if (handIdx === 'dealer') {
      setDealerCards(
        dealerCards.map((c, i) => (i === cardIdx ? { ...c, isFlipped: !c.isFlipped } : c)),
      );
    } else {
      setPlayerCards(
        playerCards.map((h, hi) =>
          hi === handIdx
            ? h.map((c, ci) => (ci === cardIdx ? { ...c, isFlipped: !c.isFlipped } : c))
            : h,
        ),
      );
    }
  };

  const removeCard = (handIdx: number | 'dealer', cardIdx: number) => {
    if (handIdx === 'dealer') {
      setDealerCards(dealerCards.filter((_, i) => i !== cardIdx));
    } else {
      setPlayerCards(
        playerCards.map((h, hi) => (hi === handIdx ? h.filter((_, ci) => ci !== cardIdx) : h)),
      );
    }
  };

  // ── label helpers ─────────────────────────────────────────────────────────

  const rankLabel = (r: CardRank) => RANKS.find((x) => x.value === r)?.label ?? String(r);

  const suitLabel = (s: CardSuit) => SUITS.find((x) => x.value === s)?.label ?? s;

  const cardLabel = (c: Card) =>
    `${rankLabel(c.rank)}${suitLabel(c.suit)}${c.isFlipped ? '↙' : ''}`;

  // ─────────────────────────────────────────────────────────────────────────

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="fixed bottom-[0.33em] left-[0.33em] z-50 px-2 py-1 text-[0.46em] font-mono bg-black/60 text-white/40 border border-white/10 rounded hover:text-white/80"
      >
        debug
      </button>
    );
  }

  const handCount = playerCards.length;
  const rowBase = 'flex items-start gap-2 rounded px-1 -mx-1 cursor-pointer';
  const isTargeted = (t: 'dealer' | number) =>
    target === t ? 'bg-white/10 ring-1 ring-inset ring-white/30' : 'hover:bg-white/5';

  return (
    // text-[0.46em] scales the whole panel with the board font size (~11px at full board).
    // Internal sizing uses rem/px values which are fine at this scale.
    // w-[23em] = 23 × inherited-font ≈ 256px at full board.
    <div className="fixed bottom-[0.33em] left-[0.33em] z-50 w-[23em] max-h-[92vh] overflow-y-auto overflow-x-hidden bg-black/90 border border-white/20 rounded text-white font-mono text-[0.46em] flex flex-col">
      {/* header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 sticky top-0 bg-black/90 z-10">
        <span className="text-white/60">debug panel</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused(!paused)}
            className={`px-2 py-0.5 rounded border font-mono transition-colors ${
              paused
                ? 'border-amber-500/60 bg-amber-500/20 text-amber-300'
                : 'border-white/20 text-white/40 hover:text-white hover:border-white/40'
            }`}
          >
            {paused ? '▶ resume' : '⏸ pause'}
          </button>
          <button onClick={() => setVisible(false)} className="text-white/40 hover:text-white">
            ×
          </button>
        </div>
      </div>

      {/* ── STATE ── */}
      <section className="p-3 border-b border-white/10 flex flex-col gap-2">
        <div className="text-white/35 uppercase tracking-wider text-[0.9em] mb-1">State</div>

        <div className="flex items-center gap-2">
          <span className="text-white/50 w-20 shrink-0">GameState</span>
          <select
            className={`${sel} flex-1 min-w-0`}
            value={gameState}
            onChange={(e) => setGameState(Number(e.target.value) as GameState)}
          >
            {GAME_STATES.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/50 w-20 shrink-0">PlayState</span>
          <select
            className={`${sel} flex-1 min-w-0`}
            value={playState}
            onChange={(e) => setPlayState(Number(e.target.value) as PlayState)}
          >
            {PLAY_STATES.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/50 w-20 shrink-0">Focus</span>
          <input
            type="number"
            min={0}
            max={Math.max(0, handCount - 1)}
            className={`${sel} w-14`}
            value={currentFocus}
            onChange={(e) => setCurrentFocus(Number(e.target.value))}
          />
          <span className="text-white/30">/ {Math.max(0, handCount - 1)}</span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-white/50 w-20 shrink-0">Balance</span>
            <input
              type="number"
              min={0}
              step={50}
              className={`${sel} flex-1 min-w-0`}
              value={currentBalance}
              onChange={(e) => setCurrentBalance(Number(e.target.value))}
            />
          </div>
          <div className="flex gap-1 pl-20">
            {[1, 50, 1000].map((v) => (
              <button
                key={v}
                onClick={() => setCurrentBalance(v)}
                className={btn(
                  'border-white/15 text-white/40 hover:text-white hover:border-white/40',
                )}
              >
                ${v}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HANDS ── */}
      <section className="p-3 border-b border-white/10 flex flex-col gap-1.5">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-white/35 uppercase tracking-wider text-[0.9em]">
            Hands{' '}
            <span className="text-white/20 normal-case tracking-normal">(click to target)</span>
          </span>
          <button
            onClick={addNewHand}
            className={btn('border-white/20 text-white/50 hover:text-white hover:border-white/50')}
          >
            + hand
          </button>
        </div>

        {/* dealer */}
        <div
          className={`${rowBase} ${isTargeted('dealer')} py-0.5`}
          onClick={() => setTarget('dealer')}
        >
          <span className="text-white/50 w-12 shrink-0 pt-0.5">Dealer</span>
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {dealerCards.map((card, ci) => (
              <span key={ci} className="flex items-center bg-white/10 rounded px-1 py-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCardFlip('dealer', ci);
                  }}
                  className="text-white/60 hover:text-white"
                >
                  {cardLabel(card)}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCard('dealer', ci);
                  }}
                  className="text-white/25 hover:text-red-400 ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
            {dealerCards.length === 0 && <span className="text-white/25 italic">empty</span>}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearDealer();
            }}
            className="text-white/25 hover:text-red-400 shrink-0"
          >
            clr
          </button>
        </div>

        {/* player hands */}
        {playerCards.map((hand, hi) => (
          <div
            key={hi}
            className={`${rowBase} ${isTargeted(hi)} py-0.5`}
            onClick={() => setTarget(hi)}
          >
            <span
              className={`w-12 shrink-0 pt-0.5 ${hi === currentFocus ? 'text-white' : 'text-white/50'}`}
            >
              H{hi}
              {hi === currentFocus ? '●' : ''}
            </span>
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {hand.map((card, ci) => (
                <span key={ci} className="flex items-center bg-white/10 rounded px-1 py-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCardFlip(hi, ci);
                    }}
                    className="text-white/60 hover:text-white"
                  >
                    {cardLabel(card)}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCard(hi, ci);
                    }}
                    className="text-white/25 hover:text-red-400 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
              {hand.length === 0 && <span className="text-white/25 italic">empty</span>}
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearHand(hi);
                }}
                className="text-white/25 hover:text-red-400"
              >
                clr
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeHand(hi);
                }}
                className="text-white/25 hover:text-red-400"
              >
                −
              </button>
            </div>
          </div>
        ))}

        {/* bets */}
        {handBets.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-white/50 w-12 shrink-0">Bets</span>
            <div className="flex gap-1 flex-wrap">
              {handBets.map((bet, i) => (
                <input
                  key={i}
                  type="number"
                  min={0}
                  step={25}
                  className={`${sel} w-14`}
                  value={bet}
                  onChange={(e) => {
                    const next = [...handBets];
                    next[i] = Number(e.target.value);
                    setHandBets(next);
                    setTotalWagered(next.reduce((a, b) => a + b, 0));
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── ADD CARD ── */}
      <section className="p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/35 uppercase tracking-wider text-[0.9em]">Add card</span>
          <span className="text-white/50">→ {target === 'dealer' ? 'Dealer' : `H${target}`}</span>
        </div>

        {/* rank — 7-col grid fits cleanly in w-64 */}
        <div className="grid grid-cols-7 gap-1">
          {RANKS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setRank(value)}
              className={btn(
                rank === value
                  ? 'border-white/60 bg-white/15 text-white'
                  : 'border-white/15 text-white/40 hover:text-white hover:border-white/40',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* suit */}
        <div className="flex gap-1">
          {SUITS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setSuit(value)}
              className={btn(
                suit === value
                  ? 'border-white/60 bg-white/15 text-white'
                  : 'border-white/15 text-white/40 hover:text-white hover:border-white/40',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <label className="flex items-center gap-1 cursor-pointer text-white/60 hover:text-white">
            <input
              type="checkbox"
              checked={flipped}
              onChange={(e) => setFlipped(e.target.checked)}
              className="accent-white"
            />
            flipped
          </label>
          <label className="flex items-center gap-1 cursor-pointer text-white/60 hover:text-white">
            <input
              type="checkbox"
              checked={isDoubled}
              onChange={(e) => setIsDoubled(e.target.checked)}
              className="accent-white"
            />
            doubled
          </label>
          <button
            onClick={addCard}
            className={btn('ml-auto border-white/40 bg-white/10 text-white hover:bg-white/20')}
          >
            Add
          </button>
        </div>
      </section>

      <div className="px-3 py-1.5 border-t border-white/10 text-white/25 sticky bottom-0 bg-black/90">
        ` to toggle · click card to flip · × to remove
      </div>
    </div>
  );
};

export default DebugPanel;
