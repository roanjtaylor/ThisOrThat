import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Branch, CompareMode, EloState, Item, TournamentBracket } from '../types';
import { createEloState, selectEloWinner } from '../lib/elo';
import { createTournamentBracket, selectTournamentWinner } from '../lib/tournament';

interface Session {
  branch: Branch;
  mode: CompareMode;
  items: Item[];
  elo: EloState | null;
  tournament: TournamentBracket | null;
}

interface SessionContextValue {
  session: Session | null;
  start: (branch: Branch, mode: CompareMode, items: Item[]) => void;
  selectWinner: (item: Item) => void;
  reset: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  const start = (branch: Branch, mode: CompareMode, items: Item[]) => {
    setSession({
      branch,
      mode,
      items,
      elo: mode === 'elo' ? createEloState(items) : null,
      tournament: mode === 'tournament' ? createTournamentBracket(items) : null,
    });
  };

  const selectWinner = (item: Item) => {
    setSession((prev) => {
      if (!prev) return prev;
      if (prev.mode === 'elo' && prev.elo) return { ...prev, elo: selectEloWinner(prev.elo, item) };
      if (prev.mode === 'tournament' && prev.tournament)
        return { ...prev, tournament: selectTournamentWinner(prev.tournament, item) };
      return prev;
    });
  };

  const reset = () => setSession(null);

  return (
    <SessionContext.Provider value={{ session, start, selectWinner, reset }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
