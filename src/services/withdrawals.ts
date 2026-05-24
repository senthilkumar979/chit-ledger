import { createClient } from '@/lib/supabase/client';
import { supabaseRequest } from '@/lib/supabase/request';
import type { WithdrawalFormData } from '@/schemas/withdrawal';

export async function recordWithdrawal(
  chitId: string,
  input: WithdrawalFormData,
  proofFile?: File,
  payout?: { collectionVariance: number; withdrawalNetAmount: number },
): Promise<void> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    let proofUrl: string | null = null;

    if (proofFile) {
      const ext = proofFile.name.split('.').pop() ?? 'jpg';
      const path = `${chitId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('withdrawal-proofs')
        .upload(path, proofFile);

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage
        .from('withdrawal-proofs')
        .getPublicUrl(path);
      proofUrl = urlData.publicUrl;
    }

    const baseUpdate = {
      withdrawal: true,
      withdrawal_date: input.withdrawal_date,
      withdrawal_by: input.withdrawal_by,
      withdrawal_payment_mode: input.withdrawal_payment_mode,
      withdrawal_proof_url: proofUrl,
    };

    const payoutUpdate =
      payout != null
        ? {
            collection_variance: payout.collectionVariance,
            withdrawal_net_amount: payout.withdrawalNetAmount,
          }
        : null;

    const { error } = await supabase
      .from('chits')
      .update(payoutUpdate ? { ...baseUpdate, ...payoutUpdate } : baseUpdate)
      .eq('id', chitId);

    if (error && payoutUpdate && isMissingPayoutColumnError(error.message)) {
      const { error: retryError } = await supabase
        .from('chits')
        .update(baseUpdate)
        .eq('id', chitId);
      if (retryError) throw new Error(retryError.message);
      return;
    }

    if (error) throw new Error(error.message);
  });
}

function isMissingPayoutColumnError(message: string): boolean {
  return (
    message.includes('collection_variance') ||
    message.includes('withdrawal_net_amount')
  );
}
