import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Username dan password harus diisi');
      return;
    }

    const success = login(username, password, role);
    if (success) {
      setUsername('');
      setPassword('');
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError('Login gagal');
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/70 bg-white/95 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">Modal Login</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">Masuk ke DMS</h2>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-sky-200 transition focus:ring-4"
              placeholder="Masukkan username"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-sky-200 transition focus:ring-4"
              placeholder="Masukkan password"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Tipe Pengguna
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-sky-200 transition focus:ring-4"
            >
              <option value="user">Peserta Magang</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-sky-600 py-3 font-semibold text-white transition hover:bg-sky-700"
          >
            Login
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-xs text-slate-700">
          <p className="mb-2 text-sm font-bold text-sky-800">Contoh PW (sebenarnya bisa diisi apa aja kecuali role)</p>
          <p>Peserta: username: user / password: 123</p>
          <p>Admin: username: admin / password: 123</p>
        </div>
      </div>
    </div>
  );
}
