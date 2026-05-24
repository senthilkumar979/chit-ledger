type LoadingListener = (activeCount: number) => void;

let activeCount = 0;
const listeners = new Set<LoadingListener>();

export function getSupabaseLoadingCount(): number {
  return activeCount;
}

export function subscribeSupabaseLoading(listener: LoadingListener): () => void {
  listeners.add(listener);
  listener(activeCount);
  return () => listeners.delete(listener);
}

function notifySupabaseLoading(): void {
  listeners.forEach((listener) => listener(activeCount));
}

export function beginSupabaseRequest(): void {
  activeCount += 1;
  notifySupabaseLoading();
}

export function endSupabaseRequest(): void {
  activeCount = Math.max(0, activeCount - 1);
  notifySupabaseLoading();
}
