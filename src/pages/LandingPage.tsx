import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useEffect } from 'react'
import { Zap, Globe, Palette, Users, BarChart2, Shield, ArrowRight, Check } from 'lucide-react'
import BrandLogo from '../components/BrandLogo'

export default function LandingPage() {
  const { token } = useAuthStore()
  const navigate = useNavigate()

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (token) navigate('/app/dashboard', { replace: true })
  }, [token, navigate])

  return (
    <div className="min-h-screen" style={{ background: '#0b0c14', color: '#f1f5f9' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <BrandLogo size={32} alt="CMS Logo" />
          <span className="font-bold text-lg text-white">Jay CMS</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </button>
          <button onClick={() => navigate('/register')}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center pt-20 pb-28 px-6 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8"
          style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
          <Zap size={11} /> AI-Powered Website Builder
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-6"
          style={{ background: 'linear-gradient(135deg, #fff 40%, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Build Stunning<br />Websites Visually
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The world's most advanced visual CMS. Drag-and-drop builder, AI generation,
          Microsoft Word-style editing, and real-time team collaboration — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => navigate('/register')}
            className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white shadow-lg transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 8px 32px rgba(99,102,241,0.35)' }}>
            Start Building Free <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1' }}>
            Sign In to Dashboard
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-5">No credit card required · Free forever plan available</p>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-center text-3xl font-bold text-white mb-4">Everything you need</h2>
        <p className="text-center text-slate-500 mb-14 max-w-xl mx-auto">From drag-and-drop editing to AI content generation, JayCMS gives you pro tools without the complexity.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: <Palette size={20} />, title: 'Visual Builder', desc: 'Drag, drop, and customize every pixel with an intuitive WYSIWYG editor.' },
            { icon: <Zap size={20} />, title: 'AI Generation', desc: 'Describe your website and let AI build the entire layout and content for you.' },
            { icon: <Globe size={20} />, title: 'One-Click Publish', desc: 'Go live instantly. Your site gets a shareable URL the moment you publish.' },
            { icon: <Users size={20} />, title: 'Team Collaboration', desc: 'Invite your team, assign roles, and work together in real time.' },
            { icon: <BarChart2 size={20} />, title: 'Analytics', desc: 'Track visitors, page views, and performance with built-in analytics.' },
            { icon: <Shield size={20} />, title: 'Secure & Reliable', desc: 'Enterprise-grade security with automatic backups and 99.9% uptime.' },
          ].map(f => (
            <div key={f.title} className="p-6 rounded-2xl transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                {f.icon}
              </div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-center text-3xl font-bold text-white mb-4">Simple Pricing</h2>
        <p className="text-center text-slate-500 mb-14">Start free, scale as you grow.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Free', price: '$0', period: 'forever', features: ['3 Sites', '5 Pages per site', 'Basic Templates', 'JayCMS branding'], cta: 'Get Started', popular: false },
            { name: 'Pro', price: '$19', period: '/month', features: ['Unlimited Sites', 'Unlimited Pages', 'AI Generation', 'Custom Domain', 'Remove branding', 'Priority Support'], cta: 'Start Free Trial', popular: true },
            { name: 'Team', price: '$49', period: '/month', features: ['Everything in Pro', 'Up to 10 team members', 'Advanced Analytics', 'White-label CMS', 'API Access'], cta: 'Contact Sales', popular: false },
          ].map(p => (
            <div key={p.name} className="relative p-6 rounded-2xl flex flex-col"
              style={{
                background: p.popular ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(124,58,237,0.15))' : 'rgba(255,255,255,0.04)',
                border: p.popular ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
              }}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
                  Most Popular
                </div>
              )}
              <h3 className="font-bold text-white text-lg">{p.name}</h3>
              <div className="my-4">
                <span className="text-4xl font-black text-white">{p.price}</span>
                <span className="text-slate-500 text-sm">{p.period}</span>
              </div>
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check size={14} style={{ color: '#818cf8', flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/register')}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={p.popular
                  ? { background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.07)', color: '#cbd5e1' }}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="text-center px-6 pb-24">
        <div className="max-w-2xl mx-auto p-12 rounded-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(124,58,237,0.1))', border: '1px solid rgba(99,102,241,0.25)' }}>
          <h2 className="text-3xl font-black text-white mb-3">Ready to build?</h2>
          <p className="text-slate-400 mb-8">Join thousands of creators building amazing websites with JayCMS.</p>
          <button onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
            Create Your Free Account <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-8 py-8" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandLogo size={24} alt="CMS Logo" />
            <span className="font-bold text-white text-sm">Jay CMS</span>
          </div>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} Jay CMS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/login')} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Sign In</button>
            <button onClick={() => navigate('/register')} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Register</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
