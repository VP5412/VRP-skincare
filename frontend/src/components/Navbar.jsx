import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, Show } from '@clerk/react';
import { api } from '../api';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();

  const fetchNotis = async () => {
    try {
      if (window.Clerk?.session) {
        const data = await api.getNotifications();
        setNotifications(data || []);
      }
    } catch(e){}
  };

  useEffect(() => {
    fetchNotis();
    const interval = setInterval(fetchNotis, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleRead = async () => {
    if (unreadCount > 0) {
      await api.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  return (
    <>
      <Show when="signed-in">
        {/* Floating Menu Button */}
        <button 
          onClick={() => setMenuOpen(true)}
          className="fixed top-6 left-6 z-40 w-12 h-12 flex items-center justify-center rounded-full bg-surface/80 backdrop-blur-md shadow-lg border border-outline-variant/20 hover:scale-105 transition-transform"
        >
          <span className="material-symbols-outlined text-[28px] text-on-surface">menu</span>
        </button>

        {/* Floating Notification & User Control */}
        <div className="fixed top-6 right-6 z-40 flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => { setNotiOpen(!notiOpen); if(!notiOpen) handleRead(); }}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-surface/80 backdrop-blur-md shadow-lg border border-outline-variant/20 hover:scale-105 transition-transform"
            >
              <span className="material-symbols-outlined text-[24px] text-on-surface" style={{ fontVariationSettings: unreadCount > 0 ? "'FILL' 1" : "" }}>notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-error border-2 border-surface animate-pulse" />
              )}
            </button>

            {notiOpen && (
              <div className="absolute right-0 top-14 w-80 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                <div className="p-4 bg-surface-container/50 border-b border-outline-variant/20">
                    <h3 className="font-headline font-bold text-sm text-on-surface">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto w-full">
                    {notifications.length === 0 ? (
                      <p className="p-6 text-center text-xs text-on-surface-variant font-medium">You're all caught up!</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b last:border-0 border-outline-variant/10 text-sm ${n.is_read ? 'opacity-70 bg-surface' : 'bg-primary/5 font-medium'}`}>
                          <p className="text-on-surface">{n.message}</p>
                          <p className="text-[10px] text-on-surface-variant mt-1">
                            {new Date(n.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                      ))
                    )}
                </div>
              </div>
            )}
          </div>

          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-surface/80 backdrop-blur-md shadow-lg border border-outline-variant/20 hover:scale-105 transition-transform">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-0" } }} />
          </div>
        </div>
      </Show>

      {/* Hamburger Menu Overlay */}
      <Show when="signed-in">
        {menuOpen && (
          <div className="fixed inset-0 z-[60] flex">
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setMenuOpen(false)}
            />
            <nav className="relative w-72 h-full bg-surface-container-lowest shadow-2xl animate-[slideIn_0.3s_ease-out] flex flex-col rounded-r-3xl overflow-hidden">
              <div className="p-8 bg-surface-container flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-md">
                    <span className="material-symbols-outlined text-on-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
                  </div>
                  <h2 className="font-headline font-extrabold italic text-on-surface text-2xl tracking-tight">VRP UI</h2>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                {[
                  { path: '/dashboard', label: 'Dashboard', icon: 'home' },
                  { path: '/scanner', label: 'AI Face Scan', icon: 'face_retouching_natural' },
                  { path: '/scan-ingredient', label: 'Label Vision', icon: 'document_scanner' },
                  { path: '/timeline', label: 'Skin Journey', icon: 'insights' },
                  { path: '/chat', label: 'Ask AI Chatbot', icon: 'chat_bubble' },
                ].map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link 
                      key={item.path} 
                      to={item.path} 
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                        isActive ? 'bg-primary text-on-primary font-bold shadow-md scale-100' : 'text-on-surface hover:bg-surface-container-low hover:pl-6 font-medium active:scale-95'
                      }`}
                    >
                      <span className="material-symbols-outlined shrink-0" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>{item.icon}</span>
                      <span className="text-[15px]">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        )}
      </Show>
    </>
  );
}
