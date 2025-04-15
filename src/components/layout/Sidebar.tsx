
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import {
  Box,
  LayoutDashboard,
  PackageOpen,
  ClipboardList,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Products', icon: Box, path: '/Products' },
    { label: 'Transactions', icon: ClipboardList, path: '/Transactions' },
    { label: 'Alerts', icon: AlertTriangle, path: '/alerts' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div
      className={cn(
        'h-screen flex flex-col bg-sidebar border-r border-border transition-all duration-300 overflow-hidden',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Box className="h-6 w-6 text-primary" />
            <h1 className="font-semibold tracking-tight">StockFlow</h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
                item.path === location.pathname && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
              )}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="font-medium text-sidebar-accent-foreground text-sm">
                {collapsed ? 'A' : ''}
              </span>
            </div>
            {!collapsed && <span className="text-sm font-medium">Admin User</span>}
          </div>
          {!collapsed && <ThemeToggle />}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
