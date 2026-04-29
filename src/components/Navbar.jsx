import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { isLoggedIn, user, logout, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleAdminClick = () => {
    if (userRole === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center">
            <button
              onClick={handleHomeClick}
              className="rounded-lg bg-sky-50 px-3 py-1.5 text-lg font-extrabold tracking-tight text-sky-700 transition hover:bg-sky-100"
            >
              DMS
            </button>
          </div>

          <div className="flex-1 text-center">
            <h1 className="text-sm font-semibold tracking-wide text-slate-800 sm:text-base">
              DMS Daily Report System
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn ? (
              <>
                <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 sm:inline-block">
                  {user?.username}
                </span>
                {userRole === 'admin' && (
                  <button
                    onClick={handleAdminClick}
                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 sm:text-sm"
                  >
                    Admin Panel
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 sm:text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLoginClick}
                className="rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700 sm:text-sm"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
