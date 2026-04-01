import { Link } from 'react-router-dom';
import { Show, SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface overflow-hidden relative">
      {/* Decorative blurs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-24 w-80 h-80 bg-tertiary-container/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
          </div>
          <span className="font-headline font-extrabold italic text-primary text-xl tracking-tight">VRP Skincare</span>
        </div>
        <div className="flex items-center gap-3">
          <Show when="signed-in">
            <Link to="/dashboard" className="px-6 py-2 bg-primary text-on-primary rounded-full font-headline font-bold text-sm transition-all hover:bg-primary-dim active:scale-95 mr-2">
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="px-5 py-2 text-primary font-headline font-bold text-sm hover:underline cursor-pointer">
                LogIn
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-6 py-2 bg-primary text-on-primary rounded-full font-headline font-bold text-sm transition-all hover:bg-primary-dim active:scale-95 cursor-pointer">
                Get Started
              </button>
            </SignUpButton>
          </Show>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-container/40 to-secondary-container/40 px-5 py-2.5 rounded-full mb-8 border border-primary/10 shadow-sm backdrop-blur-md">
            <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Powered by AI</span>
          </div>
          <h1 className="font-headline font-extrabold text-5xl md:text-7xl lg:text-[80px] tracking-tight text-on-surface leading-[1.1] mb-8 overflow-visible pr-2">
            Your Personal<br />
            <span className="gradient-text italic inline-block pr-3 pb-2">AI Dermatologist</span>
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl lg:text-[22px] max-w-3xl mx-auto leading-relaxed mb-12 font-medium">
            Clinical-grade skin analysis powered by AI. Get personalized product recommendations, track your skin's journey, and achieve your best skin — all within an accessible budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center mt-4">
            <Show when="signed-in">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary text-on-primary rounded-full font-headline font-extrabold text-lg shadow-[0_12px_24px_rgba(66,102,88,0.25)] hover:bg-primary-dim hover:-translate-y-1 active:scale-95 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                Go to Dashboard
              </Link>
            </Show>
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary text-on-primary rounded-full font-headline font-extrabold text-lg shadow-[0_12px_24px_rgba(66,102,88,0.25)] hover:bg-primary-dim hover:-translate-y-1 active:scale-95 transition-all duration-300 cursor-pointer">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                  Start Free Scan
                </button>
              </SignUpButton>
            </Show>
            <a href="#features" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white border border-outline-variant/30 text-on-surface rounded-full font-headline font-bold text-lg hover:bg-surface-container-low hover:-translate-y-1 active:scale-95 transition-all duration-300 shadow-sm">
              Learn More
              <span className="material-symbols-outlined ml-1">arrow_downward</span>
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <section id="features" className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            {
              icon: 'face_retouching_natural',
              title: 'AI Face Mesh Scanner',
              desc: 'Real-time MediaPipe Face Mesh captures 3 angles of your face for comprehensive clinical analysis.'
            },
            {
              icon: 'analytics',
              title: 'Precision Skin Metrics',
              desc: 'Track acne, redness, dryness, and dark circles with AI-generated severity scores from 1-10.'
            },
            {
              icon: 'shopping_bag',
              title: 'Budget-Smart Products',
              desc: 'Receive product recommendations in INR that fit your monthly skincare budget from Indian stores.'
            },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="group p-8 bg-surface-container-lowest rounded-3xl shadow-[0_12px_32px_rgba(45,52,53,0.06)] hover:shadow-lg transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${200 + i * 150}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-container/30 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{feature.icon}</span>
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface mb-3">{feature.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </section>

        {/* How It Works */}
        <section className="text-center mb-20">
          <h2 className="font-headline font-extrabold text-3xl text-on-surface mb-12">
            How It <span className="text-primary italic">Works</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', icon: 'person_add', title: 'Sign Up', desc: 'Set your budget in INR' },
              { step: '02', icon: 'camera_front', title: 'Face Scan', desc: 'AI scans 3 angles' },
              { step: '03', icon: 'auto_awesome', title: 'AI Analysis', desc: 'Gemini analyzes your skin' },
              { step: '04', icon: 'spa', title: 'Get Results', desc: 'Products & routines' },
            ].map((item, i) => (
              <div key={item.step} className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: `${300 + i * 100}ms` }}>
                <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center mb-4 shadow-lg">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <span className="text-primary font-headline font-extrabold text-sm mb-1">{item.step}</span>
                <h4 className="font-headline font-bold text-on-surface mb-1">{item.title}</h4>
                <p className="text-on-surface-variant text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative p-10 bg-primary rounded-3xl text-center overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <span className="material-symbols-outlined text-8xl text-white">auto_awesome</span>
          </div>
          <h2 className="font-headline font-extrabold text-3xl text-on-primary mb-4">Ready to Transform Your Skin?</h2>
          <p className="text-on-primary/80 mb-8 max-w-md mx-auto">Join VRP Skincare and get your first AI-powered skin analysis completely free.</p>
          <Show when="signed-in">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-10 py-4 bg-primary-container text-on-primary-container rounded-full font-headline font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              Enter Dashboard
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </Show>
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <button className="inline-flex items-center gap-2 px-10 py-4 bg-primary-container text-on-primary-container rounded-full font-headline font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer">
                Start My Skin Journey
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </SignUpButton>
          </Show>
        </section>
      </main >

      {/* Footer */}
      < footer className="relative z-10 text-center py-8 border-t border-outline-variant/10" >
        <p className="text-xs text-on-surface-variant/50 uppercase tracking-wider">© 2026 VRP Skincare. Precision Science Meets Serene Skin Rituals.</p>
      </footer >
    </div >
  );
}
