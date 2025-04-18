import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
  LogOut,
  Key
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useQuery } from '@tanstack/react-query';
import { getAlerts } from '@/services/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ChangePasswordDialog from '@/components/settings/ChangePasswordDialog';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Admin';

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: getAlerts,
  });

  const unresolvedCount = alerts.filter(alert => !alert.resolved).length;

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/Dashboard' },
    { label: 'Products', icon: Box, path: '/Products' },
    { label: 'Transactions', icon: ClipboardList, path: '/Transactions' },
    { 
      label: 'Alerts', 
      icon: AlertTriangle, 
      path: '/alerts',
      badge: unresolvedCount > 0 ? unresolvedCount : undefined
    },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    toast.success("Logged out successfully");
    navigate('/login');
  };

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
                'flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors relative',
                item.path === location.pathname && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
              )}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span>{item.label}</span>}
              {item.badge && (
                <div className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 min-w-[20px] h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center px-1",
                  collapsed && "right-1 w-5"
                )}>
                  {item.badge}
                </div>
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex flex-col gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-sidebar-accent rounded-md p-2">
                <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                  <span className="font-medium text-sidebar-accent-foreground text-sm">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
                {!collapsed && <span className="text-sm font-medium">{username}</span>}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsPasswordDialogOpen(true)}>
                <Key className="mr-2 h-4 w-4" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ChangePasswordDialog 
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </div>
  );
};

export default Sidebar;
