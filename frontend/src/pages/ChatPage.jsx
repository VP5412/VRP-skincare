import { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your AI Dermatologist. I have access to your latest skin scans and routines. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const resp = await api.sendChat(userMsg);
      setMessages(prev => [...prev, { sender: 'ai', text: resp.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'I am sorry, there was a physiological error evaluating your prompt.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col pt-16 pb-20">
      <Navbar />
      
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 pt-6">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-lg text-on-surface leading-tight">AI Dermatologist</h2>
            <p className="text-xs text-on-surface-variant flex items-center gap-1">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Online & In Context
            </p>
          </div>
        </div>

        <div className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-t-3xl shadow-sm p-4 overflow-y-auto flex flex-col gap-4 mb-2" ref={scrollRef}>
          {messages.map((m, idx) => (
            <div key={idx} className={`flex w-full ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
               <div className={`max-w-[80%] p-4 rounded-3xl text-sm ${
                 m.sender === 'user' 
                  ? 'bg-primary text-on-primary rounded-tr-sm shadow-md'
                  : 'bg-surface-container-low text-on-surface rounded-tl-sm'
               }`}>
                 {m.text}
               </div>
            </div>
          ))}
          {loading && (
             <div className="flex w-full justify-start animate-fade-in-up">
               <div className="max-w-[80%] p-4 rounded-3xl bg-surface-container-low rounded-tl-sm flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" />
                 <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '100ms' }} />
                 <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '200ms' }} />
               </div>
             </div>
          )}
        </div>

        <form onSubmit={handleSend} className="bg-surface-container-lowest border border-outline-variant/30 rounded-b-3xl p-3 flex gap-2 mx-1 mb-8 shadow-sm">
           <input 
             type="text" 
             value={input} 
             onChange={e => setInput(e.target.value)} 
             className="flex-1 bg-surface rounded-xl px-4 py-3 outline-none font-medium text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary"
             placeholder="Ask about a breakout, product, or your skin type..."
             disabled={loading}
           />
           <button type="submit" disabled={loading || !input.trim()} className="w-12 h-12 bg-primary text-on-primary rounded-xl flex items-center justify-center hover:bg-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
             <span className="material-symbols-outlined ml-1">send</span>
           </button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
