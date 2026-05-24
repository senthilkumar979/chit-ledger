import { beginSupabaseRequest, endSupabaseRequest } from '@/lib/supabase/loading';

/** Wrap any Supabase (or service) call to drive the global branded loader. */
export async function supabaseRequest<T>(operation: () => Promise<T>): Promise<T> {
  beginSupabaseRequest();
  try {
    return await operation();
  } finally {
    endSupabaseRequest();
  }
}
