import { useBankStore } from '../store/bankStore';
import { formatPLN } from '../utils';
import { BackButton, ViewTitle, Alert } from '../components/ui';
import type { Transaction } from '../types';

interface Props {
  onBack: () => void;
}

const TYPE_STYLE: Record<string, string> = {
  Wpłata:   'bg-emerald-950 text-emerald-400 border-emerald-800',
  Wypłata:  'bg-red-950    text-red-400     border-red-800',
  Przelew:  'bg-blue-950   text-blue-400    border-blue-800',
  Lokata:   'bg-amber-950  text-amber-400   border-amber-800',
  Pożyczka: 'bg-purple-950 text-purple-400  border-purple-800',
  Spłata:   'bg-teal-950   text-teal-400    border-teal-800',
};

const DEFAULT_STYLE = 'bg-zinc-800 text-zinc-400 border-zinc-700';

function TxRow({ tx }: { tx: Transaction }) {
  const badge = TYPE_STYLE[tx.type] ?? DEFAULT_STYLE;
  const isCredit = tx.amount > 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700">
      <div className="mb-2 flex items-center justify-between">
        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge}`}>
          {tx.type}
        </span>
        <span className="text-xs text-zinc-500">{tx.date}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-xs text-zinc-400 flex-1 truncate">{tx.description}</p>
        <div className="text-right shrink-0">
          <p
            className={`font-mono text-sm font-bold ${
              isCredit ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {isCredit ? '+' : ''}
            {formatPLN(tx.amount)}
          </p>
          <p className="font-mono text-[11px] text-zinc-500">
            saldo {formatPLN(tx.balance)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function History({ onBack }: Props) {
  const { state } = useBankStore();
  const txs = [...state.transactions].reverse();

  const totalIn  = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = txs.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />
      <ViewTitle icon="📊">Historia transakcji</ViewTitle>

      {txs.length === 0 ? (
        <Alert type="info" title="Brak transakcji">
          Historia transakcji jest pusta. Wykonaj pierwszą operację, aby zobaczyć wpisy tutaj.
        </Alert>
      ) : (
        <>
          {/* ── Summary stats ── */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-1">
                Łącznie
              </p>
              <p className="font-mono font-bold text-white text-sm">{txs.length}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-1">
                Wpływy
              </p>
              <p className="font-mono font-bold text-emerald-400 text-sm">
                +{formatPLN(totalIn)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-1">
                Wypływy
              </p>
              <p className="font-mono font-bold text-red-400 text-sm">
                {formatPLN(totalOut)}
              </p>
            </div>
          </div>

          {/* ── Transaction list ── */}
          <div className="space-y-2">
            {txs.map((tx) => (
              <TxRow key={tx.id} tx={tx} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
