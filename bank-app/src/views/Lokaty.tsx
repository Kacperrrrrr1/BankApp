import { useState } from 'react';
import { useBankStore } from '../store/bankStore';
import { formatPLN, parseAmount } from '../utils';
import { BackButton, ViewTitle, Input, Button, Alert, Card, InfoRow } from '../components/ui';

interface Props {
  onBack: () => void;
}

type Step = 'select' | 'confirm' | 'done';

const PRODUCTS = [
  { id: 0, label: '3 miesiące',  months: 3,  rate: 4.5, min: 500  },
  { id: 1, label: '6 miesięcy',  months: 6,  rate: 5.2, min: 1000 },
  { id: 2, label: '12 miesięcy', months: 12, rate: 6.0, min: 2000 },
  { id: 3, label: '24 miesiące', months: 24, rate: 6.8, min: 5000 },
];

export function Lokaty({ onBack }: Props) {
  const { state, dispatch } = useBankStore();
  const [selected, setSelected] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('select');

  const product = selected !== null ? PRODUCTS[selected] : null;
  const n = parseAmount(amount);
  const interest =
    product && n ? Math.round(n * (product.rate / 100) * (product.months / 12) * 100) / 100 : null;

  const handleContinue = () => {
    if (!product) { setError('Wybierz lokatę'); return; }
    if (n === null) { setError('Podaj kwotę lokaty'); return; }
    if (n < product.min) {
      setError(`Minimalna kwota dla tej lokaty: ${formatPLN(product.min)}`);
      return;
    }
    if (n > state.balance) {
      setError(`Niewystarczające środki. Dostępne: ${formatPLN(state.balance)}`);
      return;
    }
    setError('');
    setStep('confirm');
  };

  const handleOpen = () => {
    dispatch({ type: 'OPEN_LOKATA', amount: n!, period: product!.label, rate: product!.rate });
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
      <ViewTitle icon="🏦">Lokaty</ViewTitle>

      {/* ── Select + amount ── */}
      {step === 'select' && (
        <>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Wybierz produkt
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {PRODUCTS.map((p) => (
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
                <span className="font-mono text-lg font-bold text-emerald-400">{p.rate}%</span>
                <span className="text-sm font-semibold text-white">{p.label}</span>
                <span className="text-xs text-zinc-500">min. {formatPLN(p.min)}</span>
              </button>
            ))}
          </div>

          {product ? (
            <div className="space-y-3">
              <Input
                label={`Kwota lokaty — min. ${formatPLN(product.min)}`}
                type="number"
                inputMode="decimal"
                min={product.min}
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                error={error}
                hint={
                  interest !== null
                    ? `✨ Szacowane odsetki po ${product.label}: +${formatPLN(interest)}`
                    : `Dostępne: ${formatPLN(state.balance)}`
                }
              />
              <Button full size="lg" onClick={handleContinue}>
                Przejdź do potwierdzenia →
              </Button>
            </div>
          ) : (
            <p className="text-center text-sm text-zinc-500 py-3">
              Kliknij produkt powyżej, aby kontynuować
            </p>
          )}
        </>
      )}

      {/* ── Confirm ── */}
      {step === 'confirm' && product && n !== null && interest !== null && (
        <div className="space-y-4">
          <Card>
            <InfoRow label="Produkt" value={`Lokata ${product.label}`} />
            <InfoRow label="Oprocentowanie" value={`${product.rate}% rocznie`} />
            <InfoRow label="Kwota" value={formatPLN(n)} valueClass="text-red-400" />
            <InfoRow
              label="Szacowane odsetki"
              value={`+${formatPLN(interest)}`}
              valueClass="text-emerald-400"
            />
            <InfoRow
              label="Saldo po otwarciu"
              value={formatPLN(state.balance - n)}
            />
          </Card>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep('select')}>← Wróć</Button>
            <Button full size="lg" onClick={handleOpen}>✅&nbsp; Otwórz lokatę</Button>
          </div>
        </div>
      )}

      {/* ── Done ── */}
      {step === 'done' && product && n !== null && (
        <div className="space-y-4">
          <Alert type="success" title="Lokata otwarta!">
            <p>
              {formatPLN(n)} zablokowane na <strong>{product.label}</strong>.
            </p>
            <p className="mt-1">
              Nowe saldo:{' '}
              <span className="font-mono font-semibold">{formatPLN(state.balance)}</span>
            </p>
          </Alert>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleReset}>Nowa lokata</Button>
            <Button variant="ghost" onClick={onBack}>← Menu</Button>
          </div>
        </div>
      )}
    </div>
  );
}
