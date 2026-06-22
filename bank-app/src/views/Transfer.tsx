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

interface Props {
  onBack: () => void;
}

type Step = 'form' | 'confirm' | 'done';

interface FormData {
  recipient: string;
  accountNo: string;
  title: string;
  amount: string;
}

const EMPTY: FormData = { recipient: '', accountNo: '', title: '', amount: '' };

/* ── Step indicator ─────────────────────────────────── */
function StepIndicator({ step }: { step: Step }) {
  const steps: Step[] = ['form', 'confirm', 'done'];
  const labels = ['Dane', 'Potwierdzenie', 'Gotowe'];
  const cur = steps.indexOf(step);
  return (
    <div className="mb-6 flex items-center">
      {steps.map((s, i) => (
        <div key={s} className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}>
          <div className="flex items-center gap-1.5">
            <div
              className={[
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors',
                i < cur
                  ? 'bg-emerald-700 text-white'
                  : i === cur
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-500',
              ].join(' ')}
            >
              {i < cur ? '✓' : i + 1}
            </div>
            <span
              className={`hidden text-xs font-medium sm:block ${
                i <= cur ? 'text-zinc-300' : 'text-zinc-600'
              }`}
            >
              {labels[i]}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`mx-2 h-px flex-1 transition-colors ${
                i < cur ? 'bg-emerald-700' : 'bg-zinc-800'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Main component ─────────────────────────────────── */
export function Transfer({ onBack }: Props) {
  const { state, dispatch } = useBankStore();
  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const set =
    (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setErrors((er) => ({ ...er, [k]: '' }));
    };

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.recipient.trim()) errs.recipient = 'Pole wymagane';
    if (form.accountNo.replace(/\D/g, '').length !== 26)
      errs.accountNo = 'Numer konta musi zawierać 26 cyfr';
    if (!form.title.trim()) errs.title = 'Pole wymagane';
    const n = parseAmount(form.amount);
    if (n === null) errs.amount = 'Podaj prawidłową kwotę';
    else if (n > state.balance)
      errs.amount = `Niewystarczające środki (maks. ${formatPLN(state.balance)})`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleToConfirm = () => {
    if (validate()) setStep('confirm');
  };

  const handleSend = () => {
    const n = parseAmount(form.amount)!;
    dispatch({
      type: 'TRANSFER',
      amount: n,
      recipient: form.recipient,
      accountNo: form.accountNo,
      title: form.title,
    });
    setStep('done');
  };

  const handleReset = () => {
    setStep('form');
    setForm(EMPTY);
    setErrors({});
  };

  const n = parseAmount(form.amount);

  return (
    <div className="space-y-2">
      <BackButton onClick={onBack} />
      <ViewTitle icon="↗️">Przelew</ViewTitle>
      <StepIndicator step={step} />

      {/* ── Step 1: Form ── */}
      {step === 'form' && (
        <div className="space-y-4">
          <Input
            label="Odbiorca"
            placeholder="Jan Nowak / Firma Sp. z o.o."
            value={form.recipient}
            onChange={set('recipient')}
            error={errors.recipient}
          />
          <Input
            label="Numer konta (26 cyfr)"
            placeholder="12 3456 7890 1234 5678 9012 3456"
            value={form.accountNo}
            onChange={set('accountNo')}
            error={errors.accountNo}
            maxLength={34}
          />
          <Input
            label="Tytuł przelewu"
            placeholder="np. Faktura 12/2025"
            value={form.title}
            onChange={set('title')}
            error={errors.title}
          />
          <Input
            label="Kwota (PLN)"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            placeholder="0,00"
            value={form.amount}
            onChange={set('amount')}
            error={errors.amount}
            hint={`Dostępne: ${formatPLN(state.balance)}`}
          />
          <Button full size="lg" onClick={handleToConfirm}>
            Przejdź do potwierdzenia →
          </Button>
        </div>
      )}

      {/* ── Step 2: Confirm ── */}
      {step === 'confirm' && n !== null && (
        <div className="space-y-4">
          <Card>
            <InfoRow label="Odbiorca" value={form.recipient} />
            <InfoRow label="Konto" value={form.accountNo} />
            <InfoRow label="Tytuł" value={form.title} />
            <InfoRow label="Kwota" value={formatPLN(n)} valueClass="text-red-400" />
            <InfoRow
              label="Saldo po przelewie"
              value={formatPLN(state.balance - n)}
            />
          </Card>
          <Alert type="warning" title="Sprawdź dane przed wysłaniem">
            Przelewów nie można cofnąć. Upewnij się, że numer konta jest poprawny.
          </Alert>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep('form')}>
              ← Wróć
            </Button>
            <Button full size="lg" onClick={handleSend}>
              ✅&nbsp; Wyślij przelew
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Done ── */}
      {step === 'done' && n !== null && (
        <div className="space-y-4">
          <Alert type="success" title="Przelew wysłany!">
            <p>
              {formatPLN(n)} → {form.recipient}
            </p>
            <p className="mt-1">
              Nowe saldo:{' '}
              <span className="font-mono font-semibold">{formatPLN(state.balance)}</span>
            </p>
          </Alert>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleReset}>
              Nowy przelew
            </Button>
            <Button variant="ghost" onClick={onBack}>
              ← Menu
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
