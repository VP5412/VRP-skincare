import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function TimelinePage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sliderPos, setSliderPos] = useState(50);
  const [scanA, setScanA] = useState(null);
  const [scanB, setScanB] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    api.getDashboard().then(data => {
      // Sort oldest to newest for chronological tracking
      const chron = [...(data?.history || [])].reverse().filter(h => h.skin_metrics);
      setHistory(chron);
      if (chron.length > 0) {
        setScanA(chron[0]);
        setScanB(chron[chron.length - 1]);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSliderMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pos = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((pos / rect.width) * 100);
  };

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center p-6"><p className="animate-pulse text-on-surface-variant font-headline">Loading Timeline Server...</p></div>;

  const chartData = {
    labels: history.map((s, i) => `Week ${i + 1}`),
    datasets: [
      { label: 'Acne Severity', data: history.map(s => Number(s.skin_metrics.acne) || 0), borderColor: '#ff4d4f', backgroundColor: '#ff4d4f', tension: 0.3 },
      { label: 'Dryness', data: history.map(s => Number(s.skin_metrics.dryness) || 0), borderColor: '#ffc53d', backgroundColor: '#ffc53d', tension: 0.3 },
      { label: 'Redness', data: history.map(s => Number(s.skin_metrics.redness) || 0), borderColor: '#f759ab', backgroundColor: '#f759ab', tension: 0.3 }
    ]
  };

  const chartOptions = { responsive: true, scales: { y: { min: 0, max: 10 } }, plugins: { legend: { position: 'bottom' } } };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <Navbar />
      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-10">
        <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Skin Journey</h2>
        <p className="text-on-surface-variant text-sm mb-8">Physiologically track the progression of your treatments over time.</p>

        {history.length < 2 ? (
          <div className="p-8 bg-surface-container-lowest rounded-3xl text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant mb-4 opacity-50 block">timeline</span>
            <p className="font-headline font-semibold text-on-surface">Not Enough Data</p>
            <p className="text-sm text-on-surface-variant">Perform at least two separate scans over time to mathematically calculate improvement curves and unlock Before/After visuals.</p>
          </div>
        ) : (
          <>
            <section className="bg-surface-container-lowest p-6 rounded-3xl shadow-[0_12px_32px_rgba(45,52,53,0.06)] animate-fade-in-up">
              <h3 className="font-headline font-bold text-on-surface flex items-center gap-2 mb-6">
                 <span className="material-symbols-outlined text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
                 Clinical Reductions
              </h3>
              <div className="h-64 mt-4 relative">
                <Line options={chartOptions} data={chartData} />
              </div>
            </section>

            <section className="bg-surface-container-low p-6 rounded-3xl animate-fade-in-up shadow-sm">
               <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-bold text-on-surface">Before & After Overlay</h3>
               </div>
               
               <div className="flex gap-4 mb-6">
                 <select className="flex-1 p-3 bg-surface rounded-xl border border-outline-variant/30 text-xs font-bold font-headline select-none" value={scanA?.id || ''} onChange={(e) => setScanA(history.find(h => h.id == e.target.value))}>
                    {history.map((s, i) => <option key={s.id} value={s.id}>Week {i + 1} (Before)</option>)}
                 </select>
                 <select className="flex-1 p-3 bg-surface rounded-xl border border-outline-variant/30 text-xs font-bold font-headline select-none" value={scanB?.id || ''} onChange={(e) => setScanB(history.find(h => h.id == e.target.value))}>
                    {history.map((s, i) => <option key={s.id} value={s.id}>Week {i + 1} (After)</option>)}
                 </select>
               </div>

               {(scanA?.front_image_url && scanB?.front_image_url) ? (
                  <div 
                    ref={containerRef}
                    className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden cursor-ew-resize select-none bg-surface-container shadow-inner touch-none"
                    onMouseMove={handleSliderMove}
                    onTouchMove={handleSliderMove}
                  >
                    <img src={scanB.front_image_url} alt="After" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                    <img src={scanA.front_image_url} alt="Before" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }} />
                    <div className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ left: `${sliderPos}%` }}>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-primary pointer-events-none">
                        <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                      </div>
                    </div>
                  </div>
               ) : (
                  <div className="aspect-[3/4] flex items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/50 bg-surface-container-lowest/50">
                    <p className="text-xs text-on-surface-variant px-10 text-center font-medium">Unfortunately, visual photos were not permanently archived for these specific scans. Make sure to initiate new face scans!</p>
                  </div>
               )}
            </section>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
