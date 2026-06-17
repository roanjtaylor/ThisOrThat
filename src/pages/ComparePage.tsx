import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Item } from '../types';
import { useSession } from '../context/SessionContext';
import { getCurrentEloMatchup } from '../lib/elo';
import { getCurrentTournamentMatchup, getTournamentProgress } from '../lib/tournament';
import { PageContainer } from '../components/layout/PageContainer';
import { PairwiseView } from '../components/compare/PairwiseView';
import { ItemCardModal } from '../components/card/ItemCardModal';

export function ComparePage() {
  const { branch: branchId } = useParams();
  const { session, selectWinner } = useSession();
  const navigate = useNavigate();
  const [info, setInfo] = useState<Item | null>(null);

  // No active session (e.g. refresh / deep link) → back to setup.
  useEffect(() => {
    if (!session) navigate(`/${branchId}`, { replace: true });
  }, [session, branchId, navigate]);

  if (!session) return null;
  const { branch, mode, elo, tournament } = session;

  const matchup = mode === 'elo' && elo ? getCurrentEloMatchup(elo) : tournament ? getCurrentTournamentMatchup(tournament) : null;

  // Completed → results.
  const done = mode === 'elo' ? elo?.completed : !!tournament?.winner;
  useEffect(() => {
    if (done) navigate(`/${branch.id}/results`, { replace: true });
  }, [done, branch.id, navigate]);

  if (!matchup) return null;

  const progress =
    mode === 'elo' && elo
      ? { current: elo.currentIndex, total: elo.total }
      : tournament
        ? (() => {
            const p = getTournamentProgress(tournament);
            return { current: p.completed, total: p.total };
          })()
        : { current: 0, total: 0 };

  const pct = progress.total ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <PageContainer>
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-neutral-400">
          <button onClick={() => navigate(`/${branch.id}`)} className="hover:text-neutral-200">← Exit</button>
          <span>
            {mode === 'tournament' ? 'Round ' + tournament!.currentRound + ' · ' : ''}
            {progress.current} / {progress.total}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-800">
          <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <h1 className="mb-6 text-center text-xl font-bold text-neutral-300">Which do you prefer?</h1>

      <PairwiseView a={matchup.a} b={matchup.b} branch={branch} onPick={selectWinner} onInfo={setInfo} />

      <ItemCardModal item={info} branch={branch} onClose={() => setInfo(null)} />
    </PageContainer>
  );
}
