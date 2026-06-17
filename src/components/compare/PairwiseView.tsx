import { useEffect, useState } from 'react';
import type { Branch, Item } from '../../types';
import { ItemCard, type CardState } from '../card/ItemCard';

interface Props {
  a: Item;
  b: Item;
  branch: Branch;
  onPick: (winner: Item) => void;
  onInfo?: (item: Item) => void;
}

// Shows two items; on click, briefly highlights the winner before advancing.
export function PairwiseView({ a, b, branch, onPick, onInfo }: Props) {
  const [picked, setPicked] = useState<string | null>(null);

  // Reset highlight whenever the matchup changes.
  useEffect(() => {
    setPicked(null);
  }, [a.id, b.id]);

  function choose(winner: Item) {
    if (picked) return;
    setPicked(winner.id);
    window.setTimeout(() => onPick(winner), 450);
  }

  const stateFor = (item: Item): CardState =>
    !picked ? 'idle' : picked === item.id ? 'winner' : 'loser';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
      <ItemCard item={a} branch={branch} state={stateFor(a)} onSelect={picked ? undefined : choose} onInfo={onInfo} />
      <ItemCard item={b} branch={branch} state={stateFor(b)} onSelect={picked ? undefined : choose} onInfo={onInfo} />
    </div>
  );
}
