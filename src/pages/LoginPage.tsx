import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import BrandLogo from '../components/BrandLogo'

export default function LoginPage() {
  const { login, loading } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@jaycms.local')
  const [password, setPassword] = useState('Password123!')
  const [show, setShow] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/app/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-surface)' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 w-[480px] flex-shrink-0 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div key={i}
              animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4 + i * 2, repeat: Infinity, delay: i }}
              className="absolute rounded-full"
              style={{ width: 300 + i * 100, height: 300 + i * 100, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', top: `${i * 30}%`, left: `${i * 20 - 20}%` }}
            />
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <BrandLogo size={48} alt="CMS Logo" />
            <span className="text-xl font-bold gradient-text">Jay CMS</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            The World's Most Advanced Visual CMS
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Build stunning websites with drag-and-drop simplicity, AI assistance, and enterprise power.
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          {['Microsoft Word-style inline editing', 'AI-powered website generation', 'Drag & drop builder with templates', 'Real-time team collaboration'].map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#6366f1' }} />
              <span className="text-slate-300 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <BrandLogo size={32} alt="CMS Logo" />
            <span className="font-bold gradient-text">Jay CMS</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-slate-400 mb-8">Sign in to your account to continue building.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white outline-none transition-all"
                  style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full pl-10 pr-10 py-3 rounded-lg text-sm text-white outline-none transition-all"
                  style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium" style={{ color: '#818cf8' }}>Create one free</Link>
          </p>
          <p className="mt-4 text-center text-xs text-slate-600">
            Demo: admin@jaycms.local / Password123!
          </p>
        </motion.div>
      </div>
    </div>
  )
}
