import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sparkles, ArrowRight } from 'lucide-react'
import logo from '../assets/resume-logo.png'

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  background: 'var(--bg-3)',
  border: '1px solid var(--border-2)',
  borderRadius: 'var(--radius)',
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s',
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Left decorative panel */}
      <div style={{
        width: '45%', position: 'relative', overflow: 'hidden',
        background: 'var(--bg-2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '3rem',
      }}>
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(var(--border-3) 1px, transparent 1px), linear-gradient(90deg, var(--border-3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Glow orb */}
        <div style={{
          position: 'absolute', top: '30%', left: '40%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, color: 'var(--text)', lineHeight: 1.15, marginBottom: '1rem' }}>
            Hire smarter,<br /><em style={{ color: 'var(--gold)' }}>not harder.</em>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8, maxWidth: 300 }}>
            AI-powered resume screening that finds your best candidates in seconds, not hours.
          </p>
          <div style={{ display: 'flex', gap: 20, marginTop: '2rem' }}>
            {[['10x', 'Faster screening'], ['98%', 'Accuracy'], ['∞', 'Resumes']].map(([val, lbl]) => (
              <div key={lbl}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--gold)' }}>{val}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 380 }} className="animate-up">
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem' }}>
            <div style={{
               width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', display: 'flex', alignItems: 'center',marginLeft:'0px',justifyContent: 'center', boxShadow: '0 2px 14px rgba(201,169,110,0.3)' ,marginRight:'25px',paddingLeft:'20px'
            }}>
              <img src={logo} alt="logo" height={60}  />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text)' }}>HireSense</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: '2rem' }}>Sign in to your screening dashboard</p>

          {error && (
            <div style={{ padding: '10px 14px', background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: 13, marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Email address', key: 'email', type: 'email', placeholder: 'you@company.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6, padding: '12px 20px',
                background: loading ? 'var(--bg-4)' : 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                color: loading ? 'var(--text-2)' : '#0e0e0f',
                border: 'none', borderRadius: 'var(--radius)',
                fontWeight: 600, fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.2s',
                boxShadow: loading ? 'none' : '0 2px 16px rgba(201,169,110,0.25)',
              }}
            >
              {loading ? 'Signing in...' : <><span>Sign in</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 13, color: 'var(--text-3)' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 500 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
