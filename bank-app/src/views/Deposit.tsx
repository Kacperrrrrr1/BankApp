import { useState } from 'react';
import { useBankStore } from '../store/bankStore';
import { formatPLN, parseAmount } from '../utils';
import { BackButton, ViewTitle, Input, Button, Alert, QuickAmounts } from '../components/ui';

interface Props {
  onBack: () => void;
}

export function Deposit({ onBack }: Props) {
  const { state, dispatch } = useBankStore();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [lastDeposit, setLastDeposit] = useState<number | null>(null);

  const clear = () => {
    setAmount('');
    setError('');
    setLastDeposit(null);
  };

  const handleSubmit = () => {
    const n = parseAmount(amount);
    if (n === null) {
      setError('Podaj prawidłową kwotę większą od zera');
      return;
    }
    dispatch({ type: 'DEPOSIT', amount: n });
    setLastDeposit(n);
    setAmount('');
    setError('');
  };

  const handleChange = (val: string) => {
    setAmount(val);
    setError('');
    setLastDeposit(null);
  };

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />
      <ViewTitle icon="⬆️">Wpłata</ViewTitle>

      {/* Current balance */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
        <span className="text-sm text-zinc-400">Saldo przed wpłatą</span>
        <span className="font-mono text-sm font-semibold">{formatPLN(state.balance)}</span>
      </div>

      {/* Success message */}
      {lastDeposit !== null && (
        <Alert type="success" title="Wpłata zrealizowana!">
          <p>
            +{formatPLN(lastDeposit)} · Nowe saldo:{' '}
            <span className="font-mono font-semibold">{formatPLN(state.balance)}</span>
          </p>
        </Alert>
      )}

      {/* Form */}
      <div className="space-y-3">
        <Input
          label="Kwota wpłaty (PLN)"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          placeholder="0,00"
          value={amount}
          onChange={(e) => handleChange(e.target.value)}
          error={error}
        />
        <QuickAmounts onSelect={(n) => handleChange(String(n))} />
      </div>

      <div className="flex gap-3 pt-1">
        {(amount || lastDeposit !== null) && (
          <Button variant="secondary" onClick={clear}>
            Wyczyść
          </Button>
        )}
        <Button full size="lg" onClick={handleSubmit} disabled={!amount}>
          ⬆️&nbsp; Wpłać środki
        </Button>
      </div>
    </div>
  );
}
