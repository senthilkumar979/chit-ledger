import {
  LayoutDashboard,
  Users,
  Landmark,
  CreditCard,
  HandCoins,
  BarChart3,
  Settings,
} from 'lucide-react';

export const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/persons', label: 'Members', icon: Users },
  { href: '/chits', label: 'Chits', icon: Landmark },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/loans', label: 'Loans', icon: HandCoins },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;
