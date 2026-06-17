import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Item } from '../types';
import { useSession } from '../context/SessionContext';
import { getEloRankings } from '../lib/elo';
import { fillTitle } from '../lib/facets';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/common/Button';
import { ItemCardModal } from '../components/card/ItemCardModal';

export function ResultsPage() {
  const { branch: branchId } = useParams();
  const { session, reset } = useSession();
  const navigate = useNavigate();
  const [info, setInfo] = useState<Item | null>(null);

  useEffect(() => {
    if (!session) navigate(`/${branchId}`, { replace: true });
  }, [session, branchId, navigate]);

  // Derive an ordered ranking from whichever mode was played.
  const ranking = useMemo<Item[]>(() => {
    if (!session) return [];
    if (session.mode === 'elo' && session.elo) {
      return getEloRankings(session.elo).map((r) => r.item);
    }
    if (session.mode === 'tournament' && session.tournament) {
      const wins = new Map<string, number>();
      session.items.forEach((it) => wins.set(it.id, 0));
      for (const round of session.tournament.rounds) {
        for (const m of round) {
          if (m.winner) wins.set(m.winner.id, (wins.get(m.winner.id) || 0) + 1);
        }
      }
      return [...session.items].sort((a, b) => (wins.get(b.id) || 0) - (wins.get(a.id) || 0));
    }
    return [];
  }, [session]);

  if (!session || ranking.length === 0) return null;
  const { branch } = session;
  const champion = ranking[0];

  function playAgain() {
    reset();
    navigate(`/${branch.id}`);
  }

  return (
    <PageContainer>
      <header className="mb-8 text-center">
        <p className="text-sm uppercase tracking-widest text-emerald-400">Your top pick</p>
        <h1 className="mt-1 text-3xl font-black">{fillTitle(champion, branch.titleTemplate)}</h1>
      </header>

      <button
        onClick={() => setInfo(champion)}
        className="mx-auto mb-10 block w-full max-w-2xl overflow-hidden rounded-3xl ring-4 ring-emerald-400/70"
      >
        <img src={champion.imageUrl} alt="" className="aspect-[16/9] w-full object-cover" />
      </button>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-400">Full ranking</h2>
      <ol className="space-y-2">
        {ranking.map((item, i) => (
          <li key={item.id}>
            <button
              onClick={() => setInfo(item)}
              className="flex w-full items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-left transition-colors hover:bg-neutral-800/60"
            >
              <span className={`w-8 text-center text-lg font-black ${i === 0 ? 'text-emerald-400' : 'text-neutral-500'}`}>
                {i + 1}
              </span>
              <img src={item.thumbUrl || item.imageUrl} alt="" className="h-12 w-20 rounded-md object-cover" />
              <span className="font-semibold">{fillTitle(item, branch.titleTemplate)}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex justify-center">
        <Button onClick={playAgain}>Play again</Button>
      </div>

      <ItemCardModal item={info} branch={branch} onClose={() => setInfo(null)} />
    </PageContainer>
  );
}
