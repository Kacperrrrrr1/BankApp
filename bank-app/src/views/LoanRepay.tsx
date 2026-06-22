import { useState } from 'react';
import { useBankStore } from '../store/bankStore';
import { formatPLN, parseAmount } from '../utils';
import {
  BackButton,
  ViewTitle,
  Input,
  Button,
  Alert,
  Card,
  InfoRow,
} from '../components/ui';
import type { Loan } from '../types';

interface Props {
  onBack: () => void;
}

type Step = 'list' | 'payment' | 'confirm' | 'done';
type PayType = 'monthly' | 'full' | 'custom';

export function LoanRepay({ onBack }: Props) {
  const { state, dispatch } = useBankStore();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [payType, setPayType] = useState<PayType>('monthly');
  const [customAmount, setCustomAmount] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('list');

  // Snapshot stored before dispatch so the done screen still has data
  const [snapshot, setSnapshot] = useState<{
    plan: string;
    paid: number;
    fullyRepaid: boolean;
  } | null>(null);

  const loan: Loan | undefined = state.loans.find((l) => l.id === selectedId);

  const getPayAmount = (): number | null => {
    if (!loan) return null;
    if (payType === 'monthly') return Math.min(loan.monthly, loan.remaining);
    if (payType === 'full') return loan.remaining;
    return parseAmount(customAmount);
  };

  const payAmount = getPayAmount();

  const handleSelect = (id: number) => {
    setSelectedId(id);
    setPayType('monthly');
    setCustomAmount('');
    setError('');
    setStep('payment');
  };

  const handleContinue = () => {
    const pay = payAmount;
    if (pay === null || pay <= 0) { setError('Podaj prawidłową kwotę spłaty'); return; }
    if (pay > state.balance) {
      setError(`Niewystarczające środki. Dostępne: ${formatPLN(state.balance)}`);
      return;
    }
    setError('');
    setStep('confirm');
  };

  const handleRepay = () => {
    const pay = payAmount!;
    const newRemaining = Math.max(0, (loan?.remaining ?? 0) - pay);
    setSnapshot({
      plan: loan?.plan ?? '',
      paid: pay,
      fullyRepaid: newRemaining < 0.01,
    });
    dispatch({ type: 'REPAY_LOAN', loanId: selectedId!, amount: pay });
    setStep('done');
  };

  const handleReset = () => {
    setStep('list');
    setSelectedId(null);
    setSnapshot(null);
  };

  const loanProgressPct = (l: Loan) =>
    Math.max(5, ((l.amount - l.remaining) / l.amount) * 100);

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />
      <ViewTitle icon="💰">Spłata pożyczki</ViewTitle>

      {/* ── No active loans ── */}
      {step === 'list' && state.loans.length === 0 && (
        <Alert type="info" title="Brak aktywnych pożyczek">
          Nie posiadasz żadnych aktywnych pożyczek. Możesz wziąć nową z menu.
        </Alert>
      )}

      {/* ── Loan list ── */}
      {step === 'list' && state.loans.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">Wybierz pożyczkę do spłaty:</p>
          {state.loans.map((l) => (
            <button
              key={l.id}
              onClick={() => handleSelect(l.id)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left transition-all hover:border-zinc-700 hover:bg-zinc-800 active:scale-[0.98]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold text-sm">{l.plan}</span>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 border border-zinc-700">
                  {l.rate}% / rok
                </span>
              </div>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-xs text-zinc-500">Pozostało do spłaty</p>
                  <p className="font-mono font-bold text-red-400">{formatPLN(l.remaining)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Rata miesięczna</p>
                  <p className="font-mono font-semibold text-amber-400">{formatPLN(l.monthly)}</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all"
                  style={{ width: `${loanProgressPct(l)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-zinc-600">
                Spłacono {formatPLN(l.amount - l.remaining)} z {formatPLN(l.amount)}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* ── Payment options ── */}
      {step === 'payment' && loan && (
        <div className="space-y-4">
          <Card>
            <p className="mb-3 text-sm font-semibold">{loan.plan}</p>
            <InfoRow
              label="Pozostało do spłaty"
              value={formatPLN(loan.remaining)}
              valueClass="text-red-400"
            />
            <InfoRow
              label="Rata miesięczna"
              value={formatPLN(loan.monthly)}
              valueClass="text-amber-400"
            />
          </Card>

          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Rodzaj spłaty
          </p>

          <div className="space-y-2">
            {[
              {
                key: 'monthly' as PayType,
                label: 'Spłata raty',
                sub: `Rata: ${formatPLN(Math.min(loan.monthly, loan.remaining))}`,
              },
              {
                key: 'full' as PayType,
                label: 'Spłata całkowita',
                sub: `Cała kwota: ${formatPLN(loan.remaining)}`,
              },
              { key: 'custom' as PayType, label: 'Inna kwota', sub: 'Wpisz dowolną kwotę' },
            ].map(({ key, label, sub }) => (
              <button
                key={key}
                onClick={() => { setPayType(key); setError(''); }}
                className={[
                  'w-full flex items-center justify-between rounded-xl border p-4 text-left transition-all',
                  payType === key
                    ? 'border-emerald-600 bg-emerald-950/50 ring-1 ring-emerald-600/20'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800',
                ].join(' ')}
              >
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-xs text-zinc-400">{sub}</span>
              </button>
            ))}
          </div>

          {payType === 'custom' && (
            <Input
              label={`Kwota spłaty — maks. ${formatPLN(loan.remaining)}`}
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              max={loan.remaining}
              placeholder="0,00"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setError(''); }}
              error={error}
            />
          )}

          {error && payType !== 'custom' && <Alert type="error">{error}</Alert>}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep('list')}>← Wróć</Button>
            <Button full size="lg" onClick={handleContinue}>Dalej →</Button>
          </div>
        </div>
      )}

      {/* ── Confirm ── */}
      {step === 'confirm' && loan && payAmount !== null && (
        <div className="space-y-4">
          <Card>
            <InfoRow label="Pożyczka" value={loan.plan} />
            <InfoRow
              label="Kwota spłaty"
              value={formatPLN(payAmount)}
              valueClass="text-red-400"
            />
            <InfoRow
              label="Pozostanie po spłacie"
              value={formatPLN(Math.max(0, loan.remaining - payAmount))}
            />
            <InfoRow
              label="Saldo po spłacie"
              value={formatPLN(state.balance - payAmount)}
            />
          </Card>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep('payment')}>← Wróć</Button>
            <Button full size="lg" onClick={handleRepay}>✅&nbsp; Spłać</Button>
          </div>
        </div>
      )}

      {/* ── Done ── */}
      {step === 'done' && snapshot && (
        <div className="space-y-4">
          <Alert
            type="success"
            title={snapshot.fullyRepaid ? '🎉 Pożyczka spłacona w całości!' : 'Spłata przyjęta!'}
          >
            <p>
              Plan: <strong>{snapshot.plan}</strong>
            </p>
            <p>
              Spłacono: <span className="font-mono font-semibold">{formatPLN(snapshot.paid)}</span>
            </p>
            <p className="mt-1">
              Nowe saldo:{' '}
              <span className="font-mono font-semibold">{formatPLN(state.balance)}</span>
            </p>
          </Alert>
          <div className="flex gap-3">
            {state.loans.length > 0 && (
              <Button variant="secondary" onClick={handleReset}>Kolejna spłata</Button>
            )}
            <Button variant="ghost" onClick={onBack}>← Menu</Button>
          </div>
        </div>
      )}
    </div>
  );
}
