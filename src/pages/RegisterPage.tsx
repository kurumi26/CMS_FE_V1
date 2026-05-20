import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import BrandLogo from '../components/BrandLogo'

export default function RegisterPage() {
  const { register, loading } = useAuthStore()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    try {
      await register(name, email, password, confirm)
      navigate('/app/dashboard')
    } catch (err: any) {
      const errors = err.response?.data?.errors
      if (errors) {
        Object.values(errors).flat().forEach((m: any) => toast.error(m))
      } else {
        toast.error(err.response?.data?.message || 'Registration failed')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--color-surface)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <BrandLogo size={36} alt="CMS Logo" />
          <span className="font-bold gradient-text">Jay CMS</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
        <p className="text-slate-400 mb-8">Start building amazing websites for free.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full name', icon: User, type: 'text', val: name, set: setName, ph: 'Your name' },
            { label: 'Email address', icon: Mail, type: 'email', val: email, set: setEmail, ph: 'you@example.com' },
          ].map(({ label, icon: Icon, type, val, set, ph }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
              <div className="relative">
                <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={type} value={val} onChange={e => set(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}
                  placeholder={ph} />
              </div>
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                className="w-full pl-10 pr-10 py-3 rounded-lg text-sm text-white outline-none"
                style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}
                placeholder="Min 8 characters" />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Confirm password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white outline-none"
                style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}
                placeholder="Repeat password" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium" style={{ color: '#818cf8' }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
