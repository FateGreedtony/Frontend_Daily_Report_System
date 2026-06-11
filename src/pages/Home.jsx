import { useState, useEffect } from 'react';
import api from '../api/connect';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('plan');
  const [planForm, setPlanForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Belajar React', completed: false },
    { id: 2, title: 'Membuat komponen', completed: false },
    { id: 3, title: 'Testing aplikasi', completed: false },
  ]);

  const [newTask, setNewTask] = useState('');
  const [historyReports, setHistoryReports] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [r1, r2] = await Promise.all([api.getReports(), api.getReportLists()]);
        const lists = r2.data || [];
        const counts = {};
        lists.forEach((l) => {
          if (l.IsChildFrom) counts[l.IsChildFrom] = (counts[l.IsChildFrom] || 0) + 1;
        });

        const reports = (r1.data || []).map((r) => ({
          id: r._id,
          date: r.Date ? new Date(r.Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          internName: r.CreatedBy || 'peserta',
          title: r.title || '-',
          description: r.Description || '-',
          totalTasks: counts[r._id] || 0,
          completedTasks: 0,
          status: r.Isfinished ? 'Selesai' : 'Progress',
        }));

        if (mounted) setHistoryReports(reports);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  const handlePlanChange = (e) => {
    const { name, value } = e.target;
    setPlanForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlanSubmit = (e) => {
    e.preventDefault();
    if (planForm.title.trim()) {
      (async () => {
        try {
          const payload = {
            title: planForm.title,
            Description: planForm.description || '-',
            CreatedBy: user?.username || 'peserta',
          };
          const res = await api.createReport(payload);
          if (res.ok) {
            const created = res.data;
            setHistoryReports((prev) => [
              {
                id: created._id || Date.now(),
                date: created.Date ? new Date(created.Date).toISOString().split('T')[0] : planForm.date,
                internName: created.CreatedBy || user?.username || 'peserta',
                title: created.title || planForm.title,
                description: created.Description || planForm.description || '-',
                totalTasks: 0,
                completedTasks: 0,
                status: created.Isfinished ? 'Selesai' : 'Rencana Tersimpan',
              },
              ...historyReports,
            ]);
            setPlanForm({ title: '', description: '', date: new Date().toISOString().split('T')[0] });
            alert('Rencana kegiatan telah disimpan!');
          } else {
            alert(res.data?.message || 'Gagal menyimpan rencana');
          }
        } catch (err) {
          console.error(err);
          alert('Terjadi kesalahan saat menyimpan rencana');
        }
      })();
    }
  };

  const handleToggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      const newId = Math.max(...tasks.map((t) => t.id), 0) + 1;
      setTasks((prev) => [
        ...prev,
        { id: newId, title: newTask, completed: false },
      ]);
      setNewTask('');
    }
  };

  const handleDeleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleSaveChecklist = () => {
    if (tasks.length === 0) {
      alert('Checklist masih kosong, tambahkan kegiatan terlebih dahulu.');
      return;
    }
    (async () => {
      try {
        const payload = {
          title: planForm.title || 'Checklist Kegiatan Harian',
          Description: planForm.description || 'Laporan dibuat dari checklist kegiatan.',
          CreatedBy: user?.username || 'peserta',
        };
        const res = await api.createReport(payload);
        if (res.ok) {
          const created = res.data;
          setHistoryReports((prev) => [
            {
              id: created._id || Date.now() + 1,
              date: created.Date ? new Date(created.Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              internName: created.CreatedBy || user?.username || 'peserta',
              title: created.title || payload.title,
              description: created.Description || payload.Description,
              totalTasks: tasks.length,
              completedTasks: tasks.filter((t) => t.completed).length,
              status: created.Isfinished ? 'Selesai' : 'Progress',
            },
            ...historyReports,
          ]);
          alert('Checklist berhasil disimpan ke riwayat daily report!');
          setActiveTab('history');
        } else {
          alert(res.data?.message || 'Gagal menyimpan checklist');
        }
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan saat menyimpan checklist');
      }
    })();
  };

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl rounded-3xl border border-white/70 bg-white/85 p-8 text-center shadow-2xl backdrop-blur md:p-10">
          <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            Akses Ditolak :()
          </h2>
          <p className="mb-6 text-slate-600">
            Silakan login terlebih dahulu untuk mengakses halaman ini
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full rounded-xl bg-sky-600 py-3 font-semibold text-white transition hover:bg-sky-700"
          >
            Pergi ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-10">
        <section className="mb-8 rounded-3xl border border-white/80 bg-white/75 p-6 shadow-lg backdrop-blur md:p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-sky-700">
            Daily Report
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            Catat Rencana dan Checklist Kegiatan Magang
          </h1>
          <p className="mt-3 text-sm text-slate-600 md:text-base">
            Isi rencana kegiatan sebelum memulai pekerjaan, lalu gunakan checklist untuk menandai progres pekerjaan harian.
          </p>
        </section>

        <div className="mb-8 inline-flex w-full rounded-2xl border border-slate-200 bg-white p-1 shadow-sm md:w-auto">
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold transition md:flex-none ${
              activeTab === 'plan'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rencana Kegiatan
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold transition md:flex-none ${
              activeTab === 'checklist'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Checklist Kegiatan
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold transition md:flex-none ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            History Daily Report
          </button>
        </div>

        {activeTab === 'plan' && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl md:p-8">
            <h2 className="mb-6 text-xl font-bold text-slate-900 md:text-2xl">
              Rencana Kegiatan Harian
            </h2>
            <form onSubmit={handlePlanSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tanggal
                </label>
                <input
                  type="date"
                  name="date"
                  value={planForm.date}
                  onChange={handlePlanChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-sky-200 transition focus:ring-4"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Judul Kegiatan
                </label>
                <input
                  type="text"
                  name="title"
                  value={planForm.title}
                  onChange={handlePlanChange}
                  placeholder="Contoh: Membangun halaman login"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-sky-200 transition focus:ring-4"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={planForm.description}
                  onChange={handlePlanChange}
                  placeholder="Jelaskan detail kegiatan yang akan dilakukan..."
                  rows="5"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-sky-200 transition focus:ring-4"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-sky-600 py-3 font-semibold text-white transition hover:bg-sky-700"
              >
                Simpan Rencana Kegiatan
              </button>
            </form>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl md:p-8">
            <h2 className="mb-6 text-xl font-bold text-slate-900 md:text-2xl">
              Checklist Kegiatan
            </h2>

            <form onSubmit={handleAddTask} className="mb-6">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Tambahkan kegiatan baru..."
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-emerald-200 transition focus:ring-4"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-700"
                >
                  Tambah
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id)}
                      className="h-5 w-5 cursor-pointer rounded text-sky-600 focus:ring-2 focus:ring-sky-500"
                    />
                    <span
                      className={`flex-1 ${
                        task.completed
                          ? 'text-slate-400 line-through'
                          : 'text-slate-800'
                      }`}
                    >
                      {task.title}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="rounded-lg bg-rose-100 px-3 py-1 text-sm font-medium text-rose-600 transition hover:bg-rose-200"
                    >
                      Hapus
                    </button>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-slate-500">
                  Belum ada kegiatan. Tambahkan kegiatan baru.
                </p>
              )}
            </div>

            {tasks.length > 0 && (
              <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50 p-4">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Progres:</span>
                  {' '}
                  {tasks.filter((t) => t.completed).length} dari {tasks.length}{' '}
                  kegiatan selesai
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-sky-600 transition-all"
                    style={{
                      width: `${
                        (tasks.filter((t) => t.completed).length /
                          tasks.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveChecklist}
              className="mt-6 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Simpan Checklist
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Laporan
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  {historyReports.length}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Laporan Selesai
                </p>
                <p className="mt-2 text-2xl font-extrabold text-emerald-600">
                  {historyReports.filter((report) => report.status === 'Selesai').length}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Progress Hari Ini
                </p>
                <p className="mt-2 text-2xl font-extrabold text-sky-700">
                  {tasks.filter((task) => task.completed).length}/{tasks.length}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl md:p-8">
              <h2 className="mb-6 text-xl font-bold text-slate-900 md:text-2xl">
                Riwayat Daily Report Peserta Magang
              </h2>

              {historyReports.length > 0 ? (
                <div className="space-y-3">
                  {historyReports.map((report) => (
                    <article
                      key={report.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-200 hover:bg-white"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {report.date}
                        </p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            report.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-700'
                              : report.status === 'Progress'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-sky-100 text-sky-700'
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 md:text-lg">
                        {report.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">{report.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span className="rounded-lg bg-slate-200 px-2 py-1 font-medium">
                          Peserta: {report.internName}
                        </span>
                        <span className="rounded-lg bg-slate-200 px-2 py-1 font-medium">
                          Checklist: {report.completedTasks}/{report.totalTasks} selesai
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                  <p className="text-slate-500">
                    Belum ada history daily report. Simpan rencana atau checklist terlebih dahulu.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
