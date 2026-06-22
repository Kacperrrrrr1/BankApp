export interface Transaction {
  id: number;
  date: string;
  type: string;
  amount: number;      // positive = credit, negative = debit
  description: string;
  balance: number;     // balance AFTER this transaction
}

export interface Loan {
  id: number;
  plan: string;
  months: number;
  rate: number;
  amount: number;
  remaining: number;
  monthly: number;
}

export interface BankState {
  owner: string;
  balance: number;
  loans: Loan[];
  transactions: Transaction[];
}

export type View =
  | 'menu'
  | 'deposit'
  | 'withdrawal'
  | 'transfer'
  | 'lokaty'
  | 'loan-new'
  | 'loan-repay'
  | 'history';
