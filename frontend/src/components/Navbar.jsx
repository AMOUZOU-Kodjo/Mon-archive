import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineMusicNote,
  HiOutlineDocumentText, HiOutlineChartSquareBar, HiOutlineLockClosed,
  HiOutlineSun, HiOutlineMoon, HiOutlineMenu, HiOutlineX,
  HiOutlineInformationCircle, HiOutlineHome,
} from 'react-icons/hi';

const navItems = [
  { path: '/', label: 'Accueil', icon: HiOutlineHome },
  { path: '/about', label: 'A propos', icon: HiOutlineInformationCircle },
  { path: '/photos', label: 'Photos', icon: HiOutlinePhotograph },
  { path: '/videos', label: 'Videos', icon: HiOutlineVideoCamera },
  { path: '/audios', label: 'Audios', icon: HiOutlineMusicNote },
  { path: '/documents', label: 'Documents', icon: HiOutlineDocumentText },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const location = useLocation();
  const { authenticated } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const isActive = (path) => location.pathname === path;
  const isActivePrefix = (path) => path !== '/' && location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-40 bg-base-200/80 backdrop-blur-md border-b border-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-content font-bold text-xs">M</span>
            </div>
            <span className="font-bold text-base">Mon Archive</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.path === '/' ? isActive('/') : isActivePrefix(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary text-primary-content'
                      : 'text-base-content/60 hover:text-base-content hover:bg-base-300/50'
                  }`}
                >
                  <Icon className="text-sm" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="btn btn-ghost btn-sm btn-square" title="Theme">
              {darkMode ? <HiOutlineSun className="text-lg" /> : <HiOutlineMoon className="text-lg" />}
            </button>

            {authenticated ? (
              <Link to="/dashboard" className={`btn btn-sm shadow-sm hidden sm:flex ${
                isActivePrefix('/dashboard') ? 'btn-primary' : 'btn-ghost'
              }`}>
                <HiOutlineChartSquareBar className="text-base" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm shadow-sm hidden sm:flex">
                <HiOutlineLockClosed className="text-base" />
                <span>Connexion</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button className="md:hidden btn btn-ghost btn-sm btn-square" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <HiOutlineX className="text-xl" /> : <HiOutlineMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-base-200 bg-base-200 fade-in">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.path === '/' ? isActive('/') : isActivePrefix(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active ? 'bg-primary text-primary-content' : 'text-base-content/60 hover:text-base-content hover:bg-base-300/50'
                  }`}
                >
                  <Icon className="text-base" /> {item.label}
                </Link>
              );
            })}
            <hr className="border-base-300 my-1" />
            {authenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10"
              >
                <HiOutlineChartSquareBar className="text-base" /> Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10"
              >
                <HiOutlineLockClosed className="text-base" /> Connexion
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
