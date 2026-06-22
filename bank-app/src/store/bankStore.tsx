/**
 * bankStore.tsx — API-backed store with optimistic updates.
 *
 * Strategy:
 *   1. On mount: load authoritative state from GET /api/account
 *   2. On dispatch: apply action locally (optimistic), then sync to backend
 *   3. On API success: replace local state with server response
 *   4. On API error: show toast, revert by re-fetching from server
 *
 * The `dispatch` interface is identical to the old localStorage version,
 * so no view files need to change.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { BankState, Loan, Transaction } from '../types';

// ── Exported action union (unchanged from localStorage version) ────────────────

export type Action =
  | { type: 'DEPOSIT'; amount: number }
  | { type: 'WITHDRAW'; amount: number }
  | { type: 'TRANSFER'; amount: number; recipient: string; accountNo: string; title: string }
  | { type: 'OPEN_LOKATA'; amount: number; period: string; rate: number }
  | { type: 'TAKE_LOAN'; loan: Omit<Loan, 'id'> }
  | { type: 'REPAY_LOAN'; loanId: number; amount: number };

// ── Optimistic (local) reducer ─────────────────────────────────────────────────

const r2 = (n: number) => Math.round(n * 100) / 100;

function makeTx(
  balance: number,
  type: string,
  amount: number,
  description: string,
): Transaction {
  return {
    id: Date.now() + Math.random(),
    date: new Date().toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }),
    type,
    amount,
    description,
    balance,
  };
}

function applyOptimistic(state: BankState, action: Action): BankState {
  switch (action.type) {
    case 'DEPOSIT': {
      const balance = r2(state.balance + action.amount);
      return {
        ...state,
        balance,
        transactions: [
          ...state.transactions,
          makeTx(balance, 'Wpłata', action.amount, 'Wpłata gotówkowa'),
        ],
      };
    }
    case 'WITHDRAW': {
      const balance = r2(state.balance - action.amount);
      return {
        ...state,
        balance,
        transactions: [
          ...state.transactions,
          makeTx(balance, 'Wypłata', -action.amount, 'Wypłata gotówkowa'),
        ],
      };
    }
    case 'TRANSFER': {
      const balance = r2(state.balance - action.amount);
      return {
        ...state,
        balance,
        transactions: [
          ...state.transactions,
          makeTx(balance, 'Przelew', -action.amount, `→ ${action.recipient} | ${action.title}`),
        ],
      };
    }
    case 'OPEN_LOKATA': {
      const balance = r2(state.balance - action.amount);
      return {
        ...state,
        balance,
        transactions: [
          ...state.transactions,
          makeTx(balance, 'Lokata', -action.amount, `Lokata ${action.period} (${action.rate}%)`),
        ],
      };
    }
    case 'TAKE_LOAN': {
      const newLoan: Loan = { ...action.loan, id: Date.now() };
      const balance = r2(state.balance + action.loan.amount);
      return {
        ...state,
        balance,
        loans: [...state.loans, newLoan],
        transactions: [
          ...state.transactions,
          makeTx(balance, 'Pożyczka', action.loan.amount, `Pożyczka – ${action.loan.plan}`),
        ],
      };
    }
    case 'REPAY_LOAN': {
      const loan = state.loans.find((l) => l.id === action.loanId);
      if (!loan) return state;
      const payment = Math.min(action.amount, loan.remaining);
      const balance = r2(state.balance - payment);
      const newRemaining = r2(Math.max(0, loan.remaining - payment));
      return {
        ...state,
        balance,
        loans:
          newRemaining === 0
            ? state.loans.filter((l) => l.id !== action.loanId)
            : state.loans.map((l) =>
                l.id === action.loanId ? { ...l, remaining: newRemaining } : l,
              ),
        transactions: [
          ...state.transactions,
          makeTx(balance, 'Spłata', -payment, `Spłata pożyczki – ${loan.plan}`),
        ],
      };
    }
  }
}

// ── API fetch helper ───────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, body?: object): Promise<T> {
  const res = await fetch(path, {
    method: body !== undefined ? 'POST' : 'GET',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Błąd serwera' }));
    throw new Error((err as { detail?: string }).detail ?? 'Błąd serwera');
  }
  return res.json() as Promise<T>;
}

/** Map an Action to [endpoint, body] for the backend. */
function toApiCall(action: Action): [string, object] {
  switch (action.type) {
    case 'DEPOSIT':
      return ['/api/deposit', { amount: action.amount }];
    case 'WITHDRAW':
      return ['/api/withdraw', { amount: action.amount }];
    case 'TRANSFER':
      return [
        '/api/transfer',
        {
          amount: action.amount,
          recipient: action.recipient,
          account_no: action.accountNo,
          title: action.title,
        },
      ];
    case 'OPEN_LOKATA':
      return ['/api/lokaty', { amount: action.amount, period: action.period, rate: action.rate }];
    case 'TAKE_LOAN':
      return ['/api/loans', action.loan];
    case 'REPAY_LOAN':
      return [`/api/loans/${action.loanId}/repay`, { amount: action.amount }];
  }
}

// ── Context ────────────────────────────────────────────────────────────────────

export interface BankCtxType {
  state: BankState;
  /** Identical signature to the old localStorage dispatch — views unchanged. */
  dispatch: (action: Action) => void;
  initialized: boolean;
  apiError: string | null;
  clearApiError: () => void;
}

const EMPTY: BankState = { owner: '', balance: 0, loans: [], transactions: [] };
const BankCtx = createContext<BankCtxType | null>(null);

export function BankProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BankState>(EMPTY);
  const [initialized, setInitialized] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    apiFetch<BankState>('/api/account')
      .then(setState)
      .catch(() =>
        setApiError(
          'Nie można połączyć z serwerem. Upewnij się, że backend działa na porcie 8000.',
        ),
      )
      .finally(() => setInitialized(true));
  }, []);

  // ── Revert helper ────────────────────────────────────────────────────────────
  const revert = useCallback(() => {
    apiFetch<BankState>('/api/account')
      .then(setState)
      .catch(() => {});
  }, []);

  // ── Dispatch: optimistic update + background API sync ────────────────────────
  const dispatch = useCallback(
    (action: Action) => {
      // 1. Apply locally for instant UI feedback
      setState((prev) => applyOptimistic(prev, action));

      // 2. Sync with backend
      const [path, body] = toApiCall(action);
      apiFetch<BankState>(path, body)
        .then(setState) // authoritative state replaces optimistic one
        .catch((e: Error) => {
          setApiError(e.message);
          revert(); // roll back to last good server state
        });
    },
    [revert],
  );

  return (
    <BankCtx.Provider
      value={{
        state,
        dispatch,
        initialized,
        apiError,
        clearApiError: () => setApiError(null),
      }}
    >
      {children}
    </BankCtx.Provider>
  );
}

export function useBankStore(): BankCtxType {
  const ctx = useContext(BankCtx);
  if (!ctx) throw new Error('useBankStore must be used within BankProvider');
  return ctx;
}
