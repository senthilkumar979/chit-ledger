import { Landmark } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent shadow-lg">
          <Landmark className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">ChitLedger</h1>
        <p className="mt-1 text-sm text-muted">Premium chit fund management</p>
      </div>
      <div className="w-full max-w-md glass-card rounded-2xl p-8">{children}</div>
    </div>
  );
}
