import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import MetricBar from '../components/MetricBar';
import ProductCard from '../components/ProductCard';

export default function ResultsPage() {
  const { scanId } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if data was passed via navigation state (right after a scan)
    if (location.state?.scanData) {
      setData(location.state.scanData);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    api.getScanDetail(scanId)
      .then((res) => {
        if (res.full_json_data) {
          const parsed = JSON.parse(res.full_json_data);
          setData({ ...parsed, scan_id: res.id, scan_date: res.scan_date });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [scanId, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-tertiary-container/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center p-8">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">search_off</span>
          <p className="font-headline font-bold text-lg text-on-surface mb-2">Scan Not Found</p>
          <Link to="/dashboard" className="text-primary font-bold hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const metrics = data.skin_metrics || {};
  const products = data.products || [];
  const usage = data.product_usage_times || {};
  const remedies = data.face_home_remedies || [];

  // Calculate overall skin score
  const metricValues = Object.values(metrics);
  const avgMetric = metricValues.length > 0 ? metricValues.reduce((a, b) => a + b, 0) / metricValues.length : 0;
  const skinScore = Math.round(100 - (avgMetric * 10));

  return (
    <div className="min-h-screen bg-surface pb-32">
      <Navbar />

      <main className="pt-20 px-4 space-y-8 max-w-xl mx-auto">
        {/* Hero Score Card */}
        <section className="relative animate-fade-in-up">
          <div className="relative bg-primary rounded-3xl p-8 text-on-primary overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-7xl">auto_awesome</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">AI Analysis Complete</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-70 mb-1">Skin Vitality Index</p>
                <h2 className="text-5xl font-extrabold font-headline">
                  {skinScore}<span className="text-xl font-normal opacity-60">/100</span>
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold opacity-90">
                  {skinScore >= 80 ? 'Excellent' : skinScore >= 60 ? 'Good' : skinScore >= 40 ? 'Fair' : 'Needs Attention'}
                </p>
                {data.scan_date && (
                  <p className="text-[10px] opacity-60 mt-1">
                    {new Date(data.scan_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="p-6 bg-surface-container-lowest rounded-2xl shadow-[0_12px_32px_rgba(45,52,53,0.06)]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <span className="font-headline font-bold text-xs text-primary uppercase tracking-wider">AI Clinical Summary</span>
            </div>
            <p className="text-on-surface leading-relaxed text-sm">{data.description}</p>
          </div>
        </section>

        {/* Skin Metrics */}
        <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h3 className="font-headline text-xl font-bold text-on-surface px-2">Skin Metrics</h3>
          <div className="space-y-3">
            {Object.entries(metrics).map(([key, value], i) => (
              <MetricBar key={key} label={key} value={value} delay={i * 150} />
            ))}
          </div>
        </section>

        {/* Product Recommendations */}
        {products.length > 0 && (
          <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="px-2">
              <p className="font-headline text-[10px] uppercase tracking-widest text-primary mb-1 font-bold">Curated Analysis</p>
              <h3 className="font-headline text-xl font-bold text-on-surface">Recommended Products</h3>
              <p className="text-on-surface-variant text-sm mt-1">Budget-friendly picks tailored to your skin profile.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product, i) => (
                <ProductCard key={i} product={product} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Product Usage Times */}
        {(usage.morning_routine || usage.night_routine || usage.weekly_routine) && (
          <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <h3 className="font-headline text-xl font-bold text-on-surface px-2">Usage Schedule</h3>
            <div className="space-y-3">
              {usage.morning_routine && (
                <div className="p-5 bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(45,52,53,0.03)] flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-primary-container/30 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">light_mode</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-sm text-on-surface mb-1">Morning Routine</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{usage.morning_routine}</p>
                  </div>
                </div>
              )}
              {usage.night_routine && (
                <div className="p-5 bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(45,52,53,0.03)] flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-tertiary-container/30 flex items-center justify-center text-tertiary shrink-0">
                    <span className="material-symbols-outlined">dark_mode</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-sm text-on-surface mb-1">Night Routine</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{usage.night_routine}</p>
                  </div>
                </div>
              )}
              {usage.weekly_routine && (
                <div className="p-5 bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(45,52,53,0.03)] flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary shrink-0">
                    <span className="material-symbols-outlined">calendar_month</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-sm text-on-surface mb-1">Weekly Routine</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{usage.weekly_routine}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Home Remedies */}
        {remedies.length > 0 && (
          <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <h3 className="font-headline text-xl font-bold text-on-surface px-2">Natural Remedies</h3>
            <div className="space-y-3">
              {remedies.map((remedy, i) => (
                <div key={i} className="p-5 bg-surface-container-low rounded-2xl flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{remedy}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="pt-4 pb-8 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <Link
            to="/scanner"
            className="w-full flex items-center justify-center gap-3 bg-primary py-5 rounded-full text-on-primary font-headline font-bold text-lg shadow-[0_8px_24px_rgba(66,102,88,0.25)] active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
            Take Follow-Up Scan
          </Link>
          <div className="text-center mt-4">
            <Link to="/dashboard" className="text-sm text-primary font-bold hover:underline">← Back to Dashboard</Link>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
