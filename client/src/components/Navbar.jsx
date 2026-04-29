import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const linkClass = ({ isActive }) =>
  [
    'text-sm font-medium transition-colors px-3 py-2 rounded-lg',
    isActive ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800',
  ].join(' ');

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-white tracking-tight">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold border border-emerald-500/30">
              CRM
            </span>
            <span>MERN CRM</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/contacts" className={linkClass}>
              Contacts
            </NavLink>
            <NavLink to="/deals" className={linkClass}>
              Deals
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500 hidden sm:inline">{user?.email}</span>
          <button
            type="button"
            onClick={logout}
            className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
