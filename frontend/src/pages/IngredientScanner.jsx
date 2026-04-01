import { useState } from 'react';
import { api } from '../api';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';

export default function IngredientScanner() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleCapture = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreview(url);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const resp = await api.scanIngredient(formData);
      if (resp && resp.report) {
         setResult(resp.report);
      } else {
         setResult({ status: 'Error', explanation: 'No report body found in AI Engine.' });
      }
    } catch (err) {
      console.error(err);
      setResult({ status: 'Error', explanation: 'Failed to analyze the ingredient list. Make sure the text is clear!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-32 flex flex-col items-center">
      <Navbar />
      <main className="pt-24 pb-8 px-6 w-full max-w-xl mx-auto flex flex-col items-center space-y-8 animate-fade-in-up">
        <div className="text-center">
          <h2 className="font-headline font-extrabold text-3xl text-on-surface mb-2">Label Scanner</h2>
          <p className="text-on-surface-variant text-sm">Upload a photo of a product's ingredient list. Our AI will cross-reference it with your personal Skin Profile.</p>
        </div>

        {!preview ? (
          <div className="w-full flex justify-center gap-4">
            <label className="flex-1 max-w-[200px] aspect-square bg-surface-container-lowest border border-outline-variant/30 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-low transition-colors shadow-sm text-center p-4">
              <span className="material-symbols-outlined text-4xl text-primary mb-2">photo_camera</span>
              <span className="font-headline font-bold text-sm text-on-surface">Open Camera</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                onChange={handleCapture}
              />
            </label>
            <label className="flex-1 max-w-[200px] aspect-square bg-surface-container-lowest border border-outline-variant/30 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-low transition-colors shadow-sm text-center p-4">
              <span className="material-symbols-outlined text-4xl text-secondary mb-2">image</span>
              <span className="font-headline font-bold text-sm text-on-surface">Upload Photo</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleCapture}
              />
            </label>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-lg border border-outline-variant/20">
              <img src={preview} alt="Ingredient Label" className="w-full h-full object-cover" />
              <button 
                onClick={() => { setFile(null); setPreview(''); setResult(null); }}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center"
              >
                 <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            {!result ? (
               <button 
                 onClick={handleAnalyze} 
                 disabled={loading}
                 className="w-full py-5 bg-primary text-on-primary rounded-full font-headline font-extrabold text-lg shadow-[0_12px_24px_rgba(66,102,88,0.25)] hover:bg-primary-dim active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
               >
                 {loading ? (
                   <>
                     <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                     Analyzing Chemistry...
                   </>
                 ) : (
                   <>
                     <span className="material-symbols-outlined text-[20px]">science</span>
                     Check Ingredients
                   </>
                 )}
               </button>
            ) : (
              <div className={`w-full p-6 rounded-3xl shadow-lg border animate-fade-in-up ${
                 result.status === 'Safe' ? 'bg-green-50/50 border-green-500/30' : 
                 result.status === 'Error' ? 'bg-red-50/50 border-red-500/30' :
                 'bg-orange-50/50 border-orange-500/30'
              }`}>
                 <div className="flex items-center gap-3 mb-4">
                    <span className={`material-symbols-outlined text-3xl ${
                       result.status === 'Safe' ? 'text-green-600' : 'text-orange-600'
                    }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                       {result.status === 'Safe' ? 'check_circle' : result.status === 'Error' ? 'error' : 'warning'}
                    </span>
                    <h3 className={`font-headline font-extrabold text-2xl ${
                       result.status === 'Safe' ? 'text-green-800' : 'text-orange-900'
                    }`}>
                       {result.status}
                    </h3>
                 </div>
                 
                 <p className="text-sm font-medium leading-relaxed text-on-surface/80 mb-4 block">
                   {result.explanation}
                 </p>

                 {result.flagged_ingredients?.length > 0 && (
                   <div className="mt-4">
                     <p className="text-xs font-bold uppercase tracking-wider text-orange-900 mb-2 block">Flagged Irritants</p>
                     <div className="flex flex-wrap gap-2">
                       {result.flagged_ingredients.map(ing => (
                         <span key={ing} className="px-3 py-1 bg-white/50 border border-orange-500/30 text-orange-800 text-xs font-bold rounded-full">{ing}</span>
                       ))}
                     </div>
                   </div>
                 )}
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
