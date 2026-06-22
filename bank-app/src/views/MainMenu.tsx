import type { View } from '../types';
import { useBankStore } from '../store/bankStore';
import { formatPLN, formatNumber } from '../utils';

interface Props {
  navigate: (v: View) => void;
}

const ACTIONS: Array<{ view: View; label: string; desc: string }> = [
  { view: 'deposit',   label: 'Wpłata',        desc: 'Wpłać środki na konto'   },
  { view: 'withdrawal',label: 'Wypłata',       desc: 'Wypłać gotówkę'           },
  { view: 'transfer',  label: 'Przelew',       desc: 'Wyślij przelew bankowy'   },
  { view: 'lokaty',     label: 'Lokaty',        desc: 'Otwórz lokatę terminową'  },
  { view: 'loan-new',   label: 'Nowa pożyczka', desc: 'Weź pożyczkę'             },
  { view: 'loan-repay', label: 'Spłata',        desc: 'Spłać aktywną pożyczkę'  },
  { view: 'history',    label: 'Historia',      desc: 'Historia transakcji'       },
];

export function MainMenu({ navigate }: Props) {
  const { state } = useBankStore();
  const totalLoans = state.loans.reduce((s, l) => s + l.remaining, 0);

  return (
    <div className="space-y-5">
      {/* ── Balance hero ── */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-800/20 bg-gradient-to-br from-emerald-900/30 via-zinc-900 to-zinc-900 p-6">
        <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-emerald-600">
          Dostępne środki
        </p>
        <div className="flex items-end gap-2">
          <p className="font-mono text-4xl font-bold tracking-tight text-white">
            {formatNumber(state.balance)}
          </p>
          <p className="pb-0.5 text-xl font-bold text-emerald-500">PLN</p>
        </div>

        {state.loans.length > 0 && (
          <p className="mt-3 border-t border-zinc-800 pt-3 text-xs text-zinc-500">
            Łączne zadłużenie:{' '}
            <span className="font-mono font-semibold text-red-400">{formatPLN(totalLoans)}</span>
          </p>
        )}

        {state.transactions.length > 0 && state.loans.length === 0 && (
          <div className="mt-3 flex items-center gap-1.5 border-t border-zinc-800 pt-3">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-zinc-500">{state.transactions.length} transakcji</span>
          </div>
        )}
      </div>

      {/* ── Action grid ── */}
      <div className="grid grid-cols-2 gap-2.5">
        {ACTIONS.map(({ view, label, desc }, i) => (
          <button
            key={view}
            onClick={() => navigate(view)}
            className={[
              'group flex flex-col items-start gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left',
              'transition-all duration-150 hover:border-zinc-700 hover:bg-zinc-800 active:scale-[0.97]',
              i === ACTIONS.length - 1 ? 'col-span-2' : '',
            ].join(' ')}
          >
            <div>
              <p className="text-sm font-semibold text-white transition-colors group-hover:text-emerald-400">
                {label}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
