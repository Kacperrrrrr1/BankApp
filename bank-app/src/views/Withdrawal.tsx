import { useState } from 'react';
import { useBankStore } from '../store/bankStore';
import { formatPLN, parseAmount } from '../utils';
import { BackButton, ViewTitle, Input, Button, Alert, QuickAmounts } from '../components/ui';

interface Props {
  onBack: () => void;
}

export function Withdrawal({ onBack }: Props) {
  const { state, dispatch } = useBankStore();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [lastWithdrawal, setLastWithdrawal] = useState<number | null>(null);

  const handleSubmit = () => {
    const n = parseAmount(amount);
    if (n === null) {
      setError('Podaj prawidłową kwotę większą od zera');
      return;
    }
    if (n > state.balance) {
      setError(`Niewystarczające środki. Dostępne: ${formatPLN(state.balance)}`);
      return;
    }
    dispatch({ type: 'WITHDRAW', amount: n });
    setLastWithdrawal(n);
    setAmount('');
    setError('');
  };

  const handleChange = (val: string) => {
    setAmount(val);
    setError('');
    setLastWithdrawal(null);
  };

  const handleQuick = (n: number) => {
    if (n > state.balance) {
      setError(`Niewystarczające środki. Dostępne: ${formatPLN(state.balance)}`);
    } else {
      setAmount(String(n));
      setError('');
      setLastWithdrawal(null);
    }
  };

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />
      <ViewTitle icon="⬇️">Wypłata</ViewTitle>

      {/* Available balance */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
        <span className="text-sm text-zinc-400">Dostępne środki</span>
        <span className="font-mono text-sm font-semibold text-emerald-400">
          {formatPLN(state.balance)}
        </span>
      </div>

      {/* Success */}
      {lastWithdrawal !== null && (
        <Alert type="success" title="Wypłata zrealizowana!">
          <p>
            -{formatPLN(lastWithdrawal)} · Nowe saldo:{' '}
            <span className="font-mono font-semibold">{formatPLN(state.balance)}</span>
          </p>
        </Alert>
      )}

      {/* Form */}
      <div className="space-y-3">
        <Input
          label="Kwota wypłaty (PLN)"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          placeholder="0,00"
          value={amount}
          onChange={(e) => handleChange(e.target.value)}
          error={error}
        />
        <QuickAmounts onSelect={handleQuick} />
      </div>

      <Button full size="lg" onClick={handleSubmit} disabled={!amount}>
        ⬇️&nbsp; Wypłać środki
      </Button>
    </div>
  );
}
