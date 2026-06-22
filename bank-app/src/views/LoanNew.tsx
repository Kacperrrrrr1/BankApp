import { useState } from 'react';
import { useBankStore } from '../store/bankStore';
import { formatPLN, parseAmount, calcMonthly } from '../utils';
import { BackButton, ViewTitle, Input, Button, Alert, Card, InfoRow } from '../components/ui';

interface Props {
  onBack: () => void;
}

type Step = 'select' | 'confirm' | 'done';

const PLANS = [
  { id: 0, label: '12 miesięcy', months: 12, rate: 8.9  },
  { id: 1, label: '24 miesiące', months: 24, rate: 9.5  },
  { id: 2, label: '36 miesięcy', months: 36, rate: 10.2 },
  { id: 3, label: '60 miesięcy', months: 60, rate: 11.0 },
];

const round2 = (x: number) => Math.round(x * 100) / 100;

export function LoanNew({ onBack }: Props) {
  const { state, dispatch } = useBankStore();
  const [selected, setSelected] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('select');

  const plan = selected !== null ? PLANS[selected] : null;
  const n = parseAmount(amount);
  const monthly = plan && n ? calcMonthly(n, plan.rate, plan.months) : null;
  const total = monthly && plan ? round2(monthly * plan.months) : null;
  const interest = total && n ? round2(total - n) : null;

  const handleContinue = () => {
    if (!plan) { setError('Wybierz plan pożyczki'); return; }
    if (n === null || n < 100) {
      setError('Minimalna kwota pożyczki to 100 PLN');
      return;
    }
    setError('');
    setStep('confirm');
  };

  const handleTake = () => {
    dispatch({
      type: 'TAKE_LOAN',
      loan: {
        plan: plan!.label,
        months: plan!.months,
        rate: plan!.rate,
        amount: n!,
        remaining: total!,
        monthly: round2(monthly!),
      },
    });
    setStep('done');
  };

  const handleReset = () => {
    setStep('select');
    setSelected(null);
    setAmount('');
    setError('');
  };

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />
      <ViewTitle icon="💳">Nowa pożyczka</ViewTitle>

      {/* ── Select + amount ── */}
      {step === 'select' && (
        <>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Wybierz plan spłaty
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelected(p.id); setError(''); }}
                className={[
                  'flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all',
                  selected === p.id
                    ? 'border-emerald-600 bg-emerald-950/60 ring-1 ring-emerald-600/30'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800',
                ].join(' ')}
              >
                <span className="font-mono text-lg font-bold text-amber-400">{p.rate}%</span>
                <span className="text-sm font-semibold text-white">{p.label}</span>
                <span className="text-xs text-zinc-500">rocznie</span>
              </button>
            ))}
          </div>

          {plan ? (
            <div className="space-y-3">
              <Input
                label="Kwota pożyczki (PLN)"
                type="number"
                inputMode="decimal"
                min="100"
                step="100"
                placeholder="0,00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                error={error}
                hint="Minimalna kwota: 100 PLN"
              />

              {/* Dynamic calculator */}
              {monthly !== null && total !== null && interest !== null && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                    Kalkulator raty
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Rata miesięczna</span>
                    <span className="font-mono font-bold text-amber-400">{formatPLN(monthly)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Łączny koszt</span>
                    <span className="font-mono font-semibold text-red-400">{formatPLN(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-zinc-800 pt-2.5">
                    <span className="text-zinc-500">Odsetki łącznie</span>
                    <span className="font-mono text-sm text-zinc-400">{formatPLN(interest)}</span>
                  </div>
                </div>
              )}

              <Button full size="lg" onClick={handleContinue}>
                Przejdź do potwierdzenia →
              </Button>
            </div>
          ) : (
            <p className="text-center text-sm text-zinc-500 py-3">
              Kliknij plan powyżej, aby kontynuować
            </p>
          )}
        </>
      )}

      {/* ── Confirm ── */}
      {step === 'confirm' && plan && n !== null && monthly !== null && total !== null && (
        <div className="space-y-4">
          <Card>
            <InfoRow label="Plan spłaty" value={plan.label} />
            <InfoRow label="Oprocentowanie" value={`${plan.rate}% rocznie`} />
            <InfoRow label="Kwota pożyczki" value={formatPLN(n)} valueClass="text-emerald-400" />
            <InfoRow label="Rata miesięczna" value={formatPLN(monthly)} valueClass="text-amber-400" />
            <InfoRow label="Łączny koszt" value={formatPLN(total)} valueClass="text-red-400" />
          </Card>
          <Alert type="info" title="Informacja">
            Środki zostaną natychmiast przelane na Twoje konto. Pierwsza rata będzie wymagalna za miesiąc.
          </Alert>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep('select')}>← Wróć</Button>
            <Button full size="lg" onClick={handleTake}>✅&nbsp; Weź pożyczkę</Button>
          </div>
        </div>
      )}

      {/* ── Done ── */}
      {step === 'done' && plan && n !== null && (
        <div className="space-y-4">
          <Alert type="success" title="Pożyczka przyznana! 🎉">
            <p>
              {formatPLN(n)} zostało dodane do Twojego konta.
            </p>
            <p className="mt-1">
              Nowe saldo:{' '}
              <span className="font-mono font-semibold">{formatPLN(state.balance)}</span>
            </p>
          </Alert>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleReset}>Kolejna pożyczka</Button>
            <Button variant="ghost" onClick={onBack}>← Menu</Button>
          </div>
        </div>
      )}
    </div>
  );
}
