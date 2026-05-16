import { LoginForm } from '@/features/auth/LoginForm';

export default function LoginPage() {
  return (
    <div>
      <h2 className="mb-1 text-xl font-semibold text-primary">Sign in</h2>
      <p className="mb-6 text-sm text-muted">Access your finance dashboard</p>
      <LoginForm />
    </div>
  );
}
