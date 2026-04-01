import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sparkles, ArrowRight, Check } from 'lucide-react'
import logo from '../assets/resume-logo.png'


const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: 'var(--bg-3)', border: '1px solid var(--border-2)',
  borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 14,
  outline: 'none', transition: 'border-color 0.2s',
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', name: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async e => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form.email, form.name, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally { setLoading(false) }
  }

  const perks = ['Upload PDF, DOCX & TXT resumes', 'AI scoring & skill matching', 'Export reports as CSV & PDF', 'Full screening history']

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      {/* Left panel */}
      <div style={{
        width: '42%', position: 'relative', overflow: 'hidden',
        background: 'var(--bg-2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(var(--border-3) 1px, transparent 1px), linear-gradient(90deg, var(--border-3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '-10%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'var(--text)', lineHeight: 1.2, marginBottom: '1.5rem' }}>
            Start screening<br /><em style={{ color: 'var(--gold)' }}>in minutes.</em>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {perks.map(p => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={11} color="var(--gold)" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 380 }} className="animate-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem' }}>
            <div style={{  width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 14px rgba(201,169,110,0.3)' ,marginRight:'25px',paddingLeft:'20px'}}>
                            <img src={logo} alt="logo" height={60}  />
              
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text)' }}>HireSense</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', marginBottom: 6 }}>Create account</h1>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: '2rem' }}>
            First registered user becomes admin
          </p>

          {error && (
            <div style={{ padding: '10px 14px', background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: 13, marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Full name', key: 'name', type: 'text', placeholder: 'Tushar GS' },
              { label: 'Email address', key: 'email', type: 'email', placeholder: 'you@company.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
              { label: 'Confirm password', key: 'confirm', type: 'password', placeholder: '••••••••' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</label>
                <input
                  type={type} placeholder={placeholder} value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
                />
              </div>
            ))}
            <button
              type="submit" disabled={loading}
              style={{
                marginTop: 6, padding: '12px 20px',
                background: loading ? 'var(--bg-4)' : 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                color: loading ? 'var(--text-2)' : '#0e0e0f',
                border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: loading ? 'none' : '0 2px 16px rgba(201,169,110,0.25)',
              }}
            >
              {loading ? 'Creating account...' : <><span>Create account</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 13, color: 'var(--text-3)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
