import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/react';
import { api } from '../api';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import RoutineTracker from '../components/RoutineTracker';

export default function Dashboard() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetVal, setBudgetVal] = useState('');

  const handleLogout = () => {
    signOut(() => navigate('/'));
  };

  const handleSaveBudget = async () => {
    if (!budgetVal || isNaN(budgetVal)) {
      setIsEditingBudget(false);
      return;
    }
    try {
      await api.updateBudget(budgetVal);
      setDashboardData({
        ...dashboardData,
        user: { ...dashboardData.user, budget: budgetVal }
      });
      setIsEditingBudget(false);
    } catch (error) {
      console.error('Failed to save budget:', error);
      setIsEditingBudget(false);
    }
  };

  useEffect(() => {
    api.getDashboard()
      .then((data) => {
        setDashboardData(data);
        if (data?.user?.budget) setBudgetVal(data.user.budget);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-tertiary-container/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest">Loading your sanctuary...</p>
        </div>
      </div>
    );
  }

  const history = dashboardData?.history || [];
  const scanCount = dashboardData?.scan_count || 0;
  const latestScan = history.length > 0 ? history[0] : null;

  return (
    <div className="min-h-screen bg-surface pb-32">
      <Navbar />

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-10">
        {/* Hero Greeting */}
        <section className="relative animate-fade-in-up">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="font-label text-xs uppercase tracking-[0.15em] text-on-surface-variant/70">Daily Ritual</p>
              <h2 className="font-headline text-3xl font-bold text-on-surface">Hello, {user?.firstName || 'there'}</h2>
            </div>
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle className="text-surface-container-high" cx="40" cy="40" fill="transparent" r="32" stroke="currentColor" strokeWidth="5" />
                <circle
                  className="text-primary"
                  cx="40" cy="40" fill="transparent" r="32"
                  stroke="currentColor" strokeWidth="5"
                  strokeDasharray="201"
                  strokeDashoffset={201 - (201 * Math.min(scanCount * 25, 100)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold font-headline">{scanCount}</span>
                <span className="text-[8px] text-on-surface-variant">scans</span>
              </div>
            </div>
          </div>

          {/* AI Status Card */}
          <div className="mt-6 p-5 bg-primary-container/20 backdrop-blur-md rounded-2xl flex items-center gap-4" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-lg shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <div>
              <p className="font-headline font-semibold text-on-primary-container text-sm">
                {latestScan ? 'AI Analysis Available' : 'Ready for Your First Scan'}
              </p>
              <p className="text-xs text-on-primary-container/80">
                {latestScan?.description
                  ? latestScan.description.substring(0, 80) + '...'
                  : 'Start your skin journey with an AI-powered face scan.'}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Link
            to="/scanner"
            className="p-6 bg-primary rounded-2xl text-on-primary flex flex-col gap-3 shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
            <div>
              <p className="font-headline font-bold text-sm">New Scan</p>
              <p className="text-[11px] opacity-80">AI face analysis</p>
            </div>
          </Link>
          <Link
            to="/scan-ingredient"
            className="p-6 bg-surface-container-lowest rounded-2xl text-on-surface flex flex-col gap-3 shadow-[0_4px_20px_rgba(45,52,53,0.03)] hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all text-left"
          >
            <span className="material-symbols-outlined text-3xl text-tertiary">document_scanner</span>
            <div>
              <p className="font-headline font-bold text-sm">Label Scan</p>
              <p className="text-[11px] text-on-surface-variant">Check ingredients</p>
            </div>
          </Link>
        </section>

        {/* Gamification Routine Tracker */}
        {dashboardData?.user && (
          <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
            <RoutineTracker userProfile={dashboardData.user} />
          </div>
        )}

        {/* Budget Info */}
        <section className="p-6 bg-surface-container-low rounded-2xl animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
                Monthly Budget
              </p>
              
              {isEditingBudget ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-headline font-extrabold text-on-surface">₹</span>
                  <input
                    type="number"
                    value={budgetVal}
                    onChange={(e) => setBudgetVal(e.target.value)}
                    className="w-24 bg-transparent border-b-2 border-primary text-2xl font-headline font-extrabold text-on-surface outline-none focus:border-primary-dim"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveBudget();
                      if (e.key === 'Escape') {
                        setBudgetVal(dashboardData?.user?.budget || '1000');
                        setIsEditingBudget(false);
                      }
                    }}
                  />
                  <button onClick={handleSaveBudget} className="ml-2 w-7 h-7 rounded-sm bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-colors">
                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-headline font-extrabold text-on-surface">₹{dashboardData?.user?.budget || '1000'}</p>
                  <button onClick={() => setIsEditingBudget(true)} className="w-7 h-7 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-all">
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                  </button>
                </div>
              )}
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">account_balance_wallet</span>
            </div>
          </div>
        </section>

        {/* Scan History */}
        <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold text-on-surface">Scan History</h3>
            <span className="text-xs font-label text-on-surface-variant">{scanCount} total scans</span>
          </div>

          {history.length === 0 ? (
            <div className="p-8 bg-surface-container-lowest rounded-2xl text-center shadow-[0_4px_20px_rgba(45,52,53,0.03)]">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-3 block">face_retouching_natural</span>
              <p className="font-headline font-semibold text-on-surface mb-1">No Scans Yet</p>
              <p className="text-sm text-on-surface-variant mb-4">Take your first AI skin scan to get personalized analysis.</p>
              <Link
                to="/scanner"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-headline font-bold text-sm hover:bg-primary-dim active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-lg">photo_camera</span>
                Start First Scan
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((scan, i) => (
                <Link
                  key={scan.id}
                  to={`/results/${scan.id}`}
                  className="group p-4 bg-surface-container-lowest rounded-2xl flex items-center justify-between shadow-[0_4px_20px_rgba(45,52,53,0.03)] hover:shadow-md transition-all animate-fade-in-up"
                  style={{ animationDelay: `${500 + i * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">face</span>
                    </div>
                    <div>
                      <p className="font-headline font-semibold text-on-surface text-sm">Skin Analysis #{history.length - i}</p>
                      <p className="text-xs text-on-surface-variant">
                        {scan.scan_date ? new Date(scan.scan_date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {scan.skin_metrics && (
                      <div className="flex gap-1">
                        {Object.entries(scan.skin_metrics).slice(0, 4).map(([key, val]) => (
                          <div key={key} className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center">
                            <span className="text-[9px] font-bold text-on-surface">{val}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Weekly Adherence Chart */}
        {history.length > 0 && latestScan?.skin_metrics && Object.keys(latestScan.skin_metrics).length > 0 && (
          <section className="p-6 bg-surface-container-low rounded-2xl relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 blur-2xl" />
            <h3 className="font-headline font-bold text-on-surface mb-4">Skin Metrics Trend</h3>
            <div className="flex justify-between items-end h-32 gap-3">
              {Object.entries(latestScan.skin_metrics).slice(0, 4).map(([metric, val]) => {
                const numericVal = Number(val) || 0;
                const height = Math.min(Math.max(numericVal * 10, 10), 100);
                return (
                  <div key={metric} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                    <div className="flex-1 w-full flex items-end justify-center">
                      <div className={`w-full rounded-t-full transition-all duration-1000 ease-out ${numericVal > 6 ? 'bg-error text-error' : numericVal > 3 ? 'bg-primary text-primary' : 'bg-primary-container text-primary-container'}`} style={{ height: `${height}%`, opacity: 0.8 }} />
                    </div>
                    <span className="text-[9px] font-label text-on-surface-variant uppercase text-center break-words w-full px-1">{metric.replace(/_/g, ' ').slice(0, 8)}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {dashboardData?.user?.is_admin && (
           <section className="animate-fade-in-up" style={{ animationDelay: '700ms' }}>
              <Link to="/admin" className="w-full p-4 bg-tertiary text-on-tertiary rounded-2xl flex items-center justify-center gap-2 font-headline font-bold shadow-lg hover:bg-tertiary/90 transition-all">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
                Access Admin Portal
              </Link>
           </section>
        )}
      </main>

      {/* FAB */}
      <Link
        to="/scanner"
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40"
      >
        <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
      </Link>

      <BottomNav />
    </div>
  );
}
