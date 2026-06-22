import type { ReactNode } from 'react';
import { useBankStore } from '../store/bankStore';
import { formatNumber } from '../utils';

// ── Loading screen ─────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-3xl shadow-xl shadow-emerald-900/50 animate-pulse">
        🏦
      </div>
      <p className="text-sm text-zinc-500">Łączenie z serwerem...</p>
    </div>
  );
}

// ── Offline / error screen ─────────────────────────────────────────────────────
function OfflineScreen({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-5 p-8 text-center">
      <div className="text-5xl">⚠️</div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-white">Backend niedostępny</h2>
        <p className="text-sm text-zinc-400 max-w-xs">{error}</p>
      </div>
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left space-y-1">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          Uruchom backend:
        </p>
        <pre className="text-xs text-emerald-400 font-mono leading-relaxed">
          {`cd bank-backend\npip install -r requirements.txt\nuvicorn main:app --port 8000`}
        </pre>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Odśwież stronę
      </button>
    </div>
  );
}

// ── Main layout ────────────────────────────────────────────────────────────────
export function Layout({ children }: { children: ReactNode }) {
  const { state, initialized, apiError, clearApiError } = useBankStore();

  // Not yet connected
  if (!initialized) return <LoadingScreen />;

  // Initial connection failed (owner is empty = we never got real data)
  if (!state.owner && apiError) return <OfflineScreen error={apiError} />;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-20 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-lg shadow-lg shadow-emerald-900/50">
              🏦
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
                Bank
              </div>
              <div className="text-sm font-semibold leading-tight">{state.owner}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
              Saldo
            </div>
            <div
              className={`font-bold font-mono leading-tight text-base transition-colors ${
                state.balance >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {formatNumber(state.balance)}
              <span className="text-xs font-medium text-zinc-500 ml-1">PLN</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="max-w-md mx-auto px-4 pb-16 pt-6">{children}</main>

      {/* ── API error toast ── */}
      {apiError && state.owner && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 animate-in">
          <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 flex items-start justify-between gap-3 shadow-2xl">
            <div className="flex items-start gap-2 min-w-0">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <p className="text-sm text-red-200 truncate">{apiError}</p>
            </div>
            <button
              onClick={clearApiError}
              className="shrink-0 text-red-500 hover:text-red-300 transition-colors text-lg leading-none"
              aria-label="Zamknij"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
