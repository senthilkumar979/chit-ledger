import { createClient } from '@/lib/supabase/client';
import type { WithdrawalFormData } from '@/schemas/withdrawal';

export async function recordWithdrawal(
  chitId: string,
  input: WithdrawalFormData,
  proofFile?: File,
): Promise<void> {
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

  const { error } = await supabase
    .from('chits')
    .update({
      withdrawal: true,
      withdrawal_date: input.withdrawal_date,
      withdrawal_by: input.withdrawal_by,
      withdrawal_payment_mode: input.withdrawal_payment_mode,
      withdrawal_proof_url: proofUrl,
    })
    .eq('id', chitId);

  if (error) throw new Error(error.message);
}
