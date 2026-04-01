import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/Navbar';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getAdminUserDetail(id)
       .then(setData)
       .catch((err) => {
         console.error(err);
         navigate('/admin');
       })
       .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
     return <div className="min-h-screen bg-surface flex justify-center items-center"><p className="animate-pulse text-on-surface-variant font-headline">Fetching User Archive...</p></div>;
  }

  const user = data.user;
  const scans = data.scans;

  return (
    <div className="min-h-screen bg-surface pb-20 pt-16">
      <Navbar />
      <main className="max-w-4xl mx-auto w-full px-6 pt-6 space-y-8 animate-fade-in-up">
        
        {/* Header Ribbon */}
        <div className="flex items-start justify-between">
           <div>
             <Link to="/admin" className="text-xs font-bold text-primary flex items-center gap-1 mb-2 hover:underline">
               <span className="material-symbols-outlined text-[14px]">arrow_back</span> Back to Directory
             </Link>
             <h1 className="text-3xl font-headline font-extrabold text-on-surface">Target Entity: #{user.id}</h1>
             <p className="text-sm font-medium text-on-surface-variant">Archived Profile Investigation</p>
           </div>
           
           <div className="px-4 py-2 bg-orange-100 text-orange-800 border border-orange-200 rounded-xl flex items-center gap-2 shadow-sm shrink-0">
             <span className="material-symbols-outlined shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
             <span className="font-extrabold text-lg">{user.streak} Days active</span>
           </div>
        </div>

        {/* Global Identifiers Section */}
        <section className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 flex flex-wrap gap-8 items-center shadow-sm">
           <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
           </div>
           <div className="flex-1 min-w-[200px] grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                 <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Email Hash</p>
                 <p className="font-medium text-on-surface">{user.email}</p>
              </div>
              <div>
                 <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Alias</p>
                 <p className="font-medium text-on-surface">{user.username}</p>
              </div>
              <div>
                 <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Creation Timeline</p>
                 <p className="font-medium text-on-surface">{new Date(user.joined).toLocaleDateString()}</p>
              </div>
              <div>
                 <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Budget Allocation</p>
                 <p className="font-medium text-primary font-bold">₹{user.budget}</p>
              </div>
           </div>
        </section>

        {/* Scan Log History */}
        <section>
           <h2 className="font-headline font-bold text-xl text-on-surface flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">data_usage</span> Historical Diagnoses ({scans.length})
           </h2>
           <div className="space-y-4">
              {scans.length === 0 ? (
                 <p className="text-center p-8 bg-surface-container-low rounded-3xl text-sm font-medium text-on-surface-variant border border-dashed border-outline-variant/50">This user's archive contains zero generative scan artifacts.</p>
              ) : (
                scans.map((scan, i) => (
                   <div key={scan.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm">
                      <div className="p-4 bg-tertiary-container/30 border-b border-outline-variant/20 flex justify-between items-center">
                         <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider">Analysis Vector #{scans.length - i}</h3>
                         <span className="text-xs font-medium text-on-surface-variant border border-outline-variant/30 rounded-full px-3 py-1 bg-surface-container-low/50">
                            {new Date(scan.scan_date).toLocaleString()}
                         </span>
                      </div>
                      
                      <div className="p-6">
                         
                         {/* Secure Medical Node View */}
                         {scan.ai_private_note && (
                            <div className="p-4 mb-6 bg-error/5 border border-error/20 rounded-2xl flex items-start gap-3">
                               <span className="material-symbols-outlined text-error shrink-0 mt-0.5">lock</span>
                               <div>
                                 <h4 className="text-error font-bold text-xs uppercase tracking-widest mb-1">AI Internal Medical Note</h4>
                                 <p className="text-sm font-medium text-on-surface/90 italic">"{scan.ai_private_note}"</p>
                               </div>
                            </div>
                         )}
                         
                         <p className="text-sm font-medium text-on-surface mb-6 leading-relaxed">
                            {scan.description || "No general description extracted."} 
                         </p>
                         
                         {/* Images & Metrics Split */}
                         <div className="flex flex-col md:flex-row gap-6">
                            {/* Images Array */}
                            {(scan.front_image_url || scan.left_image_url || scan.right_image_url) && (
                               <div className="flex gap-2 shrink-0 overflow-x-auto pb-2">
                                  {[scan.front_image_url, scan.left_image_url, scan.right_image_url].filter(Boolean).map((img, idx) => (
                                     <a href={img} target="_blank" rel="noreferrer" key={idx} className="block w-24 h-32 rounded-xl overflow-hidden shadow-md shrink-0 border border-outline-variant/20 relative group">
                                        <img src={img} className="w-full h-full object-cover" alt="Scan angle" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                           <span className="material-symbols-outlined text-white">zoom_in</span>
                                        </div>
                                     </a>
                                  ))}
                               </div>
                            )}

                            {/* Mathematical Metrics Vector */}
                            {scan.metrics && (
                               <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1 content-start">
                                  {Object.entries(scan.metrics).map(([key, value]) => (
                                     <div key={key} className="bg-surface-container border border-outline-variant/10 rounded-2xl p-3 text-center">
                                        <p className="text-2xl font-headline font-black text-on-surface">{value}</p>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant truncate">{key.replace('_', ' ')}</p>
                                     </div>
                                  ))}
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                ))
              )}
           </div>
        </section>
      </main>
    </div>
  );
}
