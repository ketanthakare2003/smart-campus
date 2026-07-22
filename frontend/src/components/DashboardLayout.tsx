import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { 
  User as UserIcon, 
  Briefcase, 
  FileText, 
  Bell, 
  Calendar, 
  Users, 
  Building, 
  Settings, 
  LogOut, 
  Menu,
  X,
  GraduationCap,
  ShieldCheck,
  Key,
  ShieldAlert,
  Check
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const notificationRef = React.useRef<HTMLDivElement>(null);

  // Close notifications on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Close notifications on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifications]);

  // Close notifications on page navigation
  React.useEffect(() => {
    setShowNotifications(false);
  }, [location.pathname]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to read notification", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to read all notifications", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) return null;

  // Get sidebar links based on role and status
  const getSidebarItems = (): SidebarItem[] => {
    switch (user.role) {
      case 'STUDENT':
        return [
          { name: 'Profile', path: '/student/profile', icon: UserIcon },
          { name: 'Jobs Board', path: '/student/jobs', icon: Briefcase },
          { name: 'My Applications', path: '/student/applications', icon: FileText },
          { name: 'Placement Drives', path: '/drives', icon: Calendar },
          { name: 'Notice Board', path: '/notices', icon: Bell },
        ];
      case 'FACULTY':
        return [
          { name: 'Students Directory', path: '/faculty/students', icon: Users },
          { name: 'Verify Students', path: '/faculty/verify', icon: ShieldCheck },
          { name: 'Post Notice', path: '/faculty/notices/new', icon: Bell },
          { name: 'Notice Board', path: '/notices', icon: Bell },
          { name: 'Placement Drives', path: '/drives', icon: Calendar },
        ];
      case 'COMPANY':
        return [
          { name: 'Company Profile', path: '/company/profile', icon: Building },
          { name: 'Post a Job', path: '/company/jobs/new', icon: Briefcase },
          { name: 'My Job Listings', path: '/company/jobs', icon: Briefcase },
          { name: 'Applicants Tracker', path: '/company/applicants', icon: FileText },
          { name: 'Placement Drives', path: '/drives', icon: Calendar },
          { name: 'Notice Board', path: '/notices', icon: Bell },
        ];
      case 'TPO':
        return [
          { name: 'Companies List', path: '/tpo/companies', icon: Building },
          { name: 'Verify Students', path: '/faculty/verify', icon: ShieldCheck },
          { name: 'Placement Drives', path: '/tpo/drives', icon: Calendar },
          { name: 'Notice Board', path: '/notices', icon: Bell },
          { name: 'Students List', path: '/faculty/students', icon: Users },
        ];
      case 'ADMIN':
        return [
          { name: 'User Management', path: '/admin/users', icon: Settings },
          { name: 'Approve Profiles', path: '/admin/approvals', icon: ShieldCheck },
          { name: 'Registration Codes', path: '/admin/codes', icon: Key },
          { name: 'Notice Board', path: '/notices', icon: Bell },
          { name: 'Placement Drives', path: '/drives', icon: Calendar },
        ];
      default:
        return [];
    }
  };

  const menuItems = getSidebarItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Block Non-Student users if they are pending admin approval
  if (user.role !== 'ADMIN' && user.role !== 'STUDENT' && user.status === 'PENDING_ADMIN_APPROVAL') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 gradient-bg">
        <div className="w-full max-w-md space-y-6 glass p-8 rounded-2xl shadow-2xl text-center border-indigo-500/10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-950/60 text-indigo-300 font-bold border border-indigo-500/30">
            <ShieldAlert className="h-10 w-10 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Approval Pending
          </h2>
          <p className="text-sm text-slate-350 leading-relaxed">
            Your registration request has been submitted and is currently pending review by the campus administrator. 
            Once approved, you will be granted access to dashboard operations.
          </p>
          <div className="pt-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium text-rose-400 hover:bg-slate-800 hover:text-rose-350 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 gradient-bg">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r border-slate-800 bg-slate-900/80 backdrop-blur-md md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800">
          <GraduationCap className="h-8 w-8 text-indigo-400" />
          <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SmartCampus</span>
        </div>
        <div className="flex flex-col flex-1 gap-2 p-4">
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isDisabled = user.role === 'STUDENT' && 
                user.status === 'PENDING_VERIFICATION' && 
                (item.name === 'Jobs Board' || item.name === 'My Applications' || item.name === 'Placement Drives');

              return (
                <Link
                  key={item.name}
                  to={isDisabled ? '#' : item.path}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                      alert("Your student profile must be verified by Faculty/TPO to access this placement feature.");
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 transform hover:translate-x-1 active:scale-[0.98] ${
                    isDisabled ? 'opacity-40 cursor-not-allowed text-slate-500' :
                    isActive
                      ? 'bg-indigo-600/20 border-l-4 border-indigo-500 text-white shadow-md font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="border-t border-slate-800 pt-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <div className="flex flex-col flex-1">
        <header className="relative z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/40 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-1.5 hover:bg-slate-800 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-white md:block hidden">
              Welcome back, <span className="text-indigo-400">{user.fullName}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300">
              <span className={`h-2 w-2 rounded-full animate-pulse ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {user.role} ({user.status})
            </div>

            {/* Notification Center Trigger */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                aria-label="View notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-650 text-4xs font-extrabold text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              <div 
                className={`absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl z-50 overflow-hidden transition-all duration-200 ease-in-out origin-top-right ${
                  showNotifications 
                    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto visible' 
                    : 'opacity-0 -translate-y-2 scale-95 pointer-events-none invisible'
                }`}
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/40">
                  <span className="font-bold text-xs text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead} 
                      className="text-4xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors animate-pulse"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-3 flex items-start gap-2 hover:bg-slate-950/20 transition-all ${!notif.read ? 'bg-indigo-950/10' : ''}`}
                      >
                        {!notif.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5 animate-pulse"></span>
                        )}
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-4xs font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                              notif.category === 'SECURITY' ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20' :
                              notif.category === 'PLACEMENT' ? 'bg-indigo-500/10 text-indigo-455 border border-indigo-500/20' :
                              'bg-slate-850 text-slate-400 border border-slate-800'
                            }`}>
                              {notif.category}
                            </span>
                            <span className="text-4xs text-slate-500">
                              {new Date(notif.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h4 className="text-3xs font-bold text-slate-200 truncate">{notif.title}</h4>
                          <p className="text-4xs text-slate-400 leading-snug break-words">{notif.message}</p>
                        </div>
                        
                        {!notif.read && (
                          <button 
                            onClick={() => markAsRead(notif.id)}
                            className="p-0.5 hover:bg-slate-850 rounded text-slate-500 hover:text-emerald-450 shrink-0 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500 italic">
                      All caught up! No notifications.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-900/60 text-indigo-300 font-bold border border-indigo-500/30">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Mobile Slide-over Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
            <aside className="relative flex w-64 flex-col bg-slate-900 p-6 border-r border-slate-800 animate-slide-in">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1 hover:bg-slate-800"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-2 mb-8 mt-2">
                <GraduationCap className="h-7 w-7 text-indigo-400" />
                <span className="font-bold text-lg text-white">SmartCampus</span>
              </div>
              <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const isDisabled = user.role === 'STUDENT' && 
                    user.status === 'PENDING_VERIFICATION' && 
                    (item.name === 'Jobs Board' || item.name === 'My Applications' || item.name === 'Placement Drives');

                  return (
                    <Link
                      key={item.name}
                      to={isDisabled ? '#' : item.path}
                      onClick={(e) => {
                        if (isDisabled) {
                          e.preventDefault();
                          alert("Your student profile must be verified by Faculty/TPO to access this placement feature.");
                        } else {
                          setMobileMenuOpen(false);
                        }
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        isDisabled ? 'opacity-40 cursor-not-allowed text-slate-500' :
                        isActive
                          ? 'bg-indigo-600/90 text-white shadow-lg'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-slate-800 pt-4 mt-auto">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/20 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Verification Alert Banner for Students */}
            {user.role === 'STUDENT' && user.status === 'PENDING_VERIFICATION' && (
              <div className="mb-6 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-400 flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <div>
                  <span className="font-semibold block">Student Profile Verification Pending</span>
                  <span className="text-slate-300">Your account registration is under review by Faculty/TPO. You can edit your profile details below, but cannot access jobs boards or placement drives until verified.</span>
                </div>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
