import { forwardRef, type ReactNode } from 'react';
import { cn } from '../utils';

// ── Button ─────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  full?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const variants: Record<string, string> = {
    primary:
      'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30',
    secondary:
      'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700',
    danger:
      'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30',
    ghost:
      'hover:bg-zinc-800 text-zinc-400 hover:text-white',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3.5 text-sm',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], full && 'w-full', className)}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Input ──────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-widest text-zinc-500"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-zinc-800/80 border rounded-xl px-4 py-3 text-white text-sm font-mono',
            'placeholder:text-zinc-600 outline-none transition-all duration-150',
            'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-zinc-700',
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
        {error && <p className="text-xs text-red-400 flex items-center gap-1">⚠ {error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

// ── Alert ──────────────────────────────────────────────────────────────────

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  children: ReactNode;
}

export function Alert({ type, title, children }: AlertProps) {
  const styles: Record<string, string> = {
    success: 'bg-emerald-950/80 border-emerald-800/60 text-emerald-200',
    error:   'bg-red-950/80 border-red-800/60 text-red-200',
    info:    'bg-blue-950/80 border-blue-800/60 text-blue-200',
    warning: 'bg-amber-950/80 border-amber-800/60 text-amber-200',
  };
  const icons: Record<string, string> = {
    success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️',
  };

  return (
    <div className={cn('rounded-xl border p-4 flex items-start gap-3', styles[type])}>
      <span className="text-base shrink-0 mt-0.5">{icons[type]}</span>
      <div className="text-sm space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('bg-zinc-900 rounded-2xl border border-zinc-800 p-5', className)}>
      {children}
    </div>
  );
}

// ── InfoRow ────────────────────────────────────────────────────────────────

export function InfoRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className={cn('text-sm font-semibold font-mono', valueClass ?? 'text-white')}>
        {value}
      </span>
    </div>
  );
}

// ── BackButton ─────────────────────────────────────────────────────────────

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-sm font-medium transition-colors mb-6 group"
    >
      <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
      Powrót do menu
    </button>
  );
}

// ── ViewTitle ──────────────────────────────────────────────────────────────

export function ViewTitle({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-2xl">{icon}</span>
      <h1 className="text-xl font-bold tracking-tight">{children}</h1>
    </div>
  );
}

// ── QuickAmounts ───────────────────────────────────────────────────────────

const QUICK_AMOUNTS = [100, 500, 1000, 2000];

export function QuickAmounts({ onSelect }: { onSelect: (n: number) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <span className="text-xs text-zinc-600 self-center">Szybki wybór:</span>
      {QUICK_AMOUNTS.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onSelect(n)}
          className="
            px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95
            text-zinc-300 hover:text-white text-xs font-mono font-semibold
            rounded-lg border border-zinc-700 hover:border-zinc-600
            transition-all duration-100
          "
        >
          +{n}
        </button>
      ))}
    </div>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────

export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="border-zinc-800 my-4" />;
  return (
    <div className="flex items-center gap-3 my-4">
      <hr className="flex-1 border-zinc-800" />
      <span className="text-xs text-zinc-600 font-medium uppercase tracking-wider">{label}</span>
      <hr className="flex-1 border-zinc-800" />
    </div>
  );
}
