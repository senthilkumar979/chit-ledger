import { BrandLogo } from '@/components/brand/BrandLogo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <BrandLogo size="xl" showWordmark className="flex-col gap-3" wordmarkClassName="text-center" />
      </div>
      <div className="glass-card w-full max-w-md rounded-2xl p-8">{children}</div>
    </div>
  );
}
