import { useState, useEffect } from 'react';
import api from '../api/connect';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { isLoggedIn, userRole } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('reports');

  const [interns, setInterns] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [r1, r2] = await Promise.all([api.getReports(), api.getReportLists()]);
        const reports = (r1.data || []).map((r) => ({
          id: r._id,
          intern: r.CreatedBy || 'unknown',
          date: r.Date ? new Date(r.Date).toISOString().split('T')[0] : '',
          plan: r.title || r.Description || '-',
          completed: !!r.Isfinished,
          tasks: 0,
        }));

        const lists = r2.data || [];
        const counts = {};
        lists.forEach((l) => {
          if (l.IsChildFrom) counts[l.IsChildFrom] = (counts[l.IsChildFrom] || 0) + 1;
        });
        const reportsWithCounts = reports.map((rep) => ({ ...rep, tasks: counts[rep.id] || 0 }));

        if (mounted) {
          setDailyReports(reportsWithCounts);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  const [showAddInternForm, setShowAddInternForm] = useState(false);
  const [internForm, setInternForm] = useState({
    name: '',
    email: '',
  });

  const handleAddIntern = (e) => {
    e.preventDefault();
    if (internForm.name && internForm.email) {
      const newIntern = {
        id: Math.max(...interns.map((i) => i.id), 0) + 1,
        ...internForm,
        status: 'active',
      };
      setInterns([...interns, newIntern]);
      setInternForm({ name: '', email: '' });
      setShowAddInternForm(false);
      alert('Peserta magang berhasil ditambahkan!');
    }
  };

  if (!isLoggedIn || userRole !== 'admin') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-8 text-center shadow-2xl backdrop-blur">
          <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-slate-900">
            Akses Ditolak
          </h2>
          <p className="mb-6 text-slate-600">
            Hanya admin yang dapat mengakses halaman ini
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full rounded-xl bg-sky-600 py-3 font-semibold text-white transition hover:bg-sky-700"
          >
            Kembali ke Halaman Utama
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-100/70">
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } m-3 flex flex-col rounded-3xl bg-slate-900 text-white shadow-2xl transition-all duration-300`}
      >
        <div className="flex items-center justify-between border-b border-slate-700 p-4">
          {sidebarOpen && <span className="text-lg font-bold tracking-tight">Admin Panel</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg px-2 py-1 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <button
            onClick={() => setActiveMenu('reports')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 transition ${
              activeMenu === 'reports'
                ? 'bg-sky-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {sidebarOpen && <span>Daily Report</span>}
          </button>
          <button
            onClick={() => setActiveMenu('interns')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 transition ${
              activeMenu === 'interns'
                ? 'bg-sky-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {sidebarOpen && <span>Peserta Magang</span>}
          </button>
          <button
            onClick={() => setActiveMenu('admins')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 transition ${
              activeMenu === 'admins'
                ? 'bg-sky-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {sidebarOpen && <span>Manage Admin</span>}
          </button>
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {activeMenu === 'reports'
              ? 'Daily Report'
              : activeMenu === 'interns'
              ? 'Kelola Peserta Magang'
              : 'Kelola Admin'}
          </h2>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeMenu === 'reports' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              <h3 className="mb-6 text-xl font-bold text-slate-900">
                Daftar Daily Report
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Peserta</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Tanggal</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Rencana Kegiatan</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Tugas Selesai</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyReports.map((report) => (
                      <tr
                        key={report.id}
                        className="border-b border-slate-200 transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-semibold text-slate-800">{report.intern}</td>
                        <td className="px-4 py-3 text-slate-600">{report.date}</td>
                        <td className="max-w-xs truncate px-4 py-3 text-slate-700">
                          {report.plan}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                            {report.tasks} task
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              report.completed
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {report.completed ? 'Selesai' : 'Progress'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button className="font-semibold text-sky-700 hover:text-sky-800">
                            Lihat Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === 'interns' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">
                  Daftar Peserta Magang
                </h3>
                <button
                  onClick={() => setShowAddInternForm(!showAddInternForm)}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700"
                >
                  + Tambah Peserta
                </button>
              </div>

              {showAddInternForm && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                  <h4 className="mb-4 text-lg font-bold text-slate-900">
                    Tambah Peserta Magang Baru
                  </h4>
                  <form onSubmit={handleAddIntern} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Nama
                      </label>
                      <input
                        type="text"
                        value={internForm.name}
                        onChange={(e) =>
                          setInternForm({ ...internForm, name: e.target.value })
                        }
                        placeholder="Masukkan nama peserta"
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-sky-200 transition focus:ring-4"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={internForm.email}
                        onChange={(e) =>
                          setInternForm({
                            ...internForm,
                            email: e.target.value,
                          })
                        }
                        placeholder="Masukkan email peserta"
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-sky-200 transition focus:ring-4"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 rounded-xl bg-sky-600 py-2.5 font-semibold text-white transition hover:bg-sky-700"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddInternForm(false)}
                        className="flex-1 rounded-xl bg-slate-200 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-300"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interns.map((intern) => (
                  <div
                    key={intern.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md"
                  >
                    <h4 className="mb-2 font-bold text-slate-900">
                      {intern.name}
                    </h4>
                    <p className="mb-3 text-sm text-slate-600">{intern.email}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-xs text-slate-600">
                        {intern.status === 'active'
                          ? 'Aktif'
                          : 'Tidak Aktif'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 rounded-lg bg-sky-100 px-2 py-1 text-sm font-medium text-sky-700 transition hover:bg-sky-200">
                        Edit
                      </button>
                      <button className="flex-1 rounded-lg bg-rose-100 px-2 py-1 text-sm font-medium text-rose-700 transition hover:bg-rose-200">
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === 'admins' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Kelola Admin
                </h3>
                <button className="rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700">
                  + Tambah Admin
                </button>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-slate-900">Admin</h4>
                      <p className="text-sm text-slate-600">admin@example.com</p>
                    </div>
                    <button className="text-sm font-semibold text-sky-700 hover:text-sky-800">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
