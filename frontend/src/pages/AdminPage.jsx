import { useState, useEffect } from 'react';
import { api } from '../api';
import Navbar from '../components/Navbar';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.getAdminStats().then(setStats).catch(() => navigate('/dashboard'));
  }, [navigate]);

  if (!stats) return <div className="min-h-screen bg-surface flex justify-center items-center"><p className="animate-pulse font-headline font-bold text-on-surface-variant">Elevating Permissions...</p></div>;

  const handleNotify = async () => {
    if (!msg.trim()) return;
    try {
      await api.sendGlobalNotification(msg);
      setMsg("");
      alert("Broadcast delivered globally.");
    } catch (e) {
      alert("Failed to send.");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col pt-16 pb-20">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-6 space-y-8 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface">Admin Console</h1>
            <p className="text-on-surface-variant text-sm mt-1">Global platform overview</p>
          </div>
          <Link to="/dashboard" className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">close</span>
          </Link>
        </div>

        <section className="grid grid-cols-2 gap-4">
           <div className="p-6 bg-primary-container text-on-primary-container rounded-3xl shadow-sm">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-80" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
              <p className="font-headline font-extrabold text-5xl tracking-tight">{stats.total_users}</p>
              <p className="text-xs uppercase tracking-widest font-bold mt-2 opacity-90">Total Users</p>
           </div>
           <div className="p-6 bg-tertiary-container text-on-tertiary-container rounded-3xl shadow-sm">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-80" style={{ fontVariationSettings: "'FILL' 1" }}>document_scanner</span>
              <p className="font-headline font-extrabold text-5xl tracking-tight">{stats.total_scans}</p>
              <p className="text-xs uppercase tracking-widest font-bold mt-2 opacity-90">Platform Scans</p>
           </div>
        </section>

        <section className="p-6 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl shadow-sm">
           <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
              <h2 className="text-lg font-headline font-bold text-on-surface">Global Notification Push</h2>
           </div>
           <p className="text-xs text-on-surface-variant mb-4">Instantly broadcast an alert to all registered tracking instances.</p>
           <div className="flex items-stretch gap-2">
              <input 
                 type="text" 
                 value={msg} 
                 onChange={e => setMsg(e.target.value)} 
                 className="flex-1 bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 outline-none font-medium text-sm text-on-surface focus:border-primary transition-colors"
                 placeholder="Maintenance scheduled at 2AM..." 
              />
              <button onClick={handleNotify} disabled={!msg.trim()} className="bg-primary text-on-primary font-headline font-bold px-6 rounded-xl hover:bg-primary-dim transition-colors disabled:opacity-50">
                 Fire Node
              </button>
           </div>
        </section>

        <section>
           <h3 className="font-headline font-bold text-xl text-on-surface mb-4">Recent Registrations</h3>
           <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm whitespace-nowrap">
                 <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase font-bold tracking-wider">
                    <tr>
                       <th className="px-5 py-3">ID</th>
                       <th className="px-5 py-3">Username</th>
                       <th className="px-5 py-3">Streak</th>
                    </tr>
                 </thead>
                 <tbody className="text-on-surface divide-y divide-outline-variant/10">
                    {stats.recent_users.map(u => (
                       <Link to={`/admin/user/${u.id}`} className="contents group" key={u.id}>
                          <tr className="hover:bg-primary-container/20 transition-colors cursor-pointer">
                             <td className="px-5 py-4 opacity-60 group-hover:text-primary transition-colors">#{u.id}</td>
                             <td className="px-5 py-4 font-semibold group-hover:text-primary transition-colors">{u.username.substring(0,20)}</td>
                             <td className="px-5 py-4"><span className="text-orange-500 font-bold">🔥 {u.streak}</span></td>
                          </tr>
                       </Link>
                    ))}
                 </tbody>
              </table>
           </div>
        </section>
      </main>
    </div>
  );
}
