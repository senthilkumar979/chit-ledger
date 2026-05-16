'use client';

interface ChitWithdrawalSummaryProps {
  chit: {
    withdrawal_date: string | null;
    withdrawal_by: string | null;
    withdrawal_payment_mode: string | null;
    withdrawal_proof_url: string | null;
  };
}

export function ChitWithdrawalSummary({ chit }: ChitWithdrawalSummaryProps) {
  return (
    <div className="rounded-2xl border border-info/20 bg-info/5 p-6">
      <h3 className="font-semibold text-info">Withdrawal recorded</h3>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Date</dt>
          <dd className="font-medium text-primary">{chit.withdrawal_date}</dd>
        </div>
        <div>
          <dt className="text-muted">Taken by</dt>
          <dd className="font-medium text-primary">{chit.withdrawal_by}</dd>
        </div>
        <div>
          <dt className="text-muted">Mode</dt>
          <dd className="font-medium text-primary">{chit.withdrawal_payment_mode}</dd>
        </div>
        {chit.withdrawal_proof_url ? (
          <div>
            <dt className="text-muted">Proof</dt>
            <dd>
              <a
                href={chit.withdrawal_proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                View document
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
