import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineMusicNote,
  HiOutlineDocumentText, HiOutlineChartSquareBar, HiOutlineLogout,
  HiOutlineSun, HiOutlineMoon, HiOutlineHome,
} from 'react-icons/hi';

const sidebarItems = [
  { path: '/dashboard', label: 'Vue ensemble', icon: HiOutlineChartSquareBar },
  { path: '/dashboard/photos', label: 'Photos', icon: HiOutlinePhotograph },
  { path: '/dashboard/videos', label: 'Videos', icon: HiOutlineVideoCamera },
  { path: '/dashboard/audios', label: 'Audios', icon: HiOutlineMusicNote },
  { path: '/dashboard/documents', label: 'Documents', icon: HiOutlineDocumentText },
];

export default function AdminLayout({ children }) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const location = useLocation();
  const navigate = useNavigate();
  const { authenticated, logout } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-base-200">
      {/* Sidebar — always visible */}
      <aside className="w-64 bg-base-100 shadow-lg flex flex-col border-r border-base-200 shrink-0 sticky top-0 h-screen">
        {/* Logo */}
        <div className="flex items-center h-14 px-4 border-b border-base-200">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-content font-bold text-xs">M</span>
            </div>
            <span className="font-bold text-sm">Administration</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary text-primary-content shadow-sm'
                    : 'text-base-content/60 hover:text-base-content hover:bg-base-200'
                }`}
              >
                <Icon className="text-lg" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-base-200 p-3 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-base-content/60 hover:text-base-content hover:bg-base-200 transition-all"
          >
            <HiOutlineHome className="text-lg" />
            <span>Retour au site</span>
          </Link>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-base-content/60 hover:text-base-content hover:bg-base-200 transition-all w-full text-left"
          >
            {darkMode ? <HiOutlineSun className="text-lg" /> : <HiOutlineMoon className="text-lg" />}
            <span>{darkMode ? 'Mode clair' : 'Mode sombre'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-error hover:bg-error/10 transition-all w-full text-left"
          >
            <HiOutlineLogout className="text-lg" />
            <span>Deconnexion</span>
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 h-screen overflow-y-auto flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-6 lg:p-8 fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
