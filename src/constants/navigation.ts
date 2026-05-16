import {
  LayoutDashboard,
  Users,
  Landmark,
  CreditCard,
  BarChart3,
  Settings,
} from 'lucide-react';

export const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/persons', label: 'Members', icon: Users },
  { href: '/chits', label: 'Chits', icon: Landmark },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;
