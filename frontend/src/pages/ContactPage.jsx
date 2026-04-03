import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, MessageSquare, Github, Twitter, Linkedin, CheckCircle, Clock, Send } from 'lucide-react'

const topics = [
  'General inquiry',
  'Bug report',
  'Feature request',
  'API / integration help',
  'Billing / account',
  'Data deletion request',
  'Privacy concern',
  'Other',
]

const channels = [
  { icon: Mail,     label: 'Email us',       value: 'hello@hiresense.com',         href: 'mailto:hello@hiresense.com',   color: 'var(--blue)',   bg: 'var(--blue-light)',  border: 'var(--blue-mid)',      desc: 'We reply within 24 hours' },
  { icon: Github,   label: 'GitHub Issues',   value: 'github.com/hiresense',        href: '#',                           color: 'var(--text)',   bg: 'var(--bg)',          border: 'var(--border)',        desc: 'Open an issue or PR' },
  { icon: Twitter,  label: 'Twitter / X',     value: '@hiresense',                  href: '#',                           color: '#1da1f2',       bg: '#f',            border: 'var(--blue-mid)',              desc: 'Quick questions & updates' },
  { icon: Linkedin, label: 'LinkedIn',        value: 'linkedin.com/company/hiresense', href: '#',                        color: '#0a66c2',       bg: '#f',            border: 'var(--border)',              desc: 'Professional network' },
]

const faqs = [
  { q: 'Which AI model powers the screening?',   a: 'HireSense uses Google Gemini 1.5 Flash. You need your own Gemini API key (free tier available at aistudio.google.com) configured in the backend .env file.' },
  { q: 'How many resumes can I screen at once?', a: 'There is no hard limit — the practical limit is around 20–30 per session for performance reasons. Screening time scales linearly with the number of resumes.' },
  { q: 'Are my resumes stored permanently?',     a: 'Uploaded resume files are stored in the server\'s uploads directory. You can delete sessions from the dashboard, which removes candidate records from the database. File cleanup on disk is your responsibility as the server admin.' },
  { q: 'Can I self-host HireSense?',              a: 'Yes! HireSense is designed for self-hosting. The backend is a FastAPI app and the frontend is a Vite/React SPA. See the README for full setup instructions.' },
  { q: 'What file formats are supported?',       a: 'PDF (.pdf), Word (.docx), and plain text (.txt). PDF works best when the document is text-based rather than a scanned image.' },
  { q: 'Is blind mode truly bias-free?',         a: 'Blind mode hides names, contact details, and uses bias-minimized AI summaries. It significantly reduces surface-level bias but does not eliminate all sources of unconscious bias. All hiring decisions should involve human review.' },
]

const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', fontSize: 14, color: '#fff', background: 'black', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'var(--font)' }
const focusIn  = e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,87,167,0.10)' }
const focusOut = e => { e.target.style.borderColor = 'var(--border-2)'; e.target.style.boxShadow = 'none' }

export default function ContactPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' })
  const [sent, setSent] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const submit = e => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 980, margin: '0 auto' }}>
      <div className="anim-up" style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--blue)', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, marginBottom: 14, padding: 0 }}>
          <ArrowLeft size={14} />Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, background: 'var(--purple-bg)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--purple-border)' }}>
            <MessageSquare size={22} color="var(--purple)" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Contact Us</h1>
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>We're here to help. Reach out via any channel below.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }} className="anim-up">
        {/* Contact form */}
        <div style={{ background: '#f', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: '1.25rem' }}>Send a message</h2>

          {sent ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', textAlign: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, background: 'var(--green-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--green-border)' }}>
                <CheckCircle size={26} color="var(--green)" />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 5 }}>Message sent!</h3>
                <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>Thanks for reaching out. We'll get back to you within 24 hours.</p>
              </div>
              <button onClick={() => { setSent(false); setForm({ name: '', email: '', topic: '', message: '' }) }} style={{ padding: '8px 20px', background: 'var(--blue-light)', border: '1px solid var(--blue-mid)', borderRadius: 'var(--radius)', color: 'var(--blue)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[{ label: 'Your name', key: 'name', type: 'text', ph: 'Tushar GS' }, { label: 'Email', key: 'email', type: 'email', ph: 'tushar@company.com' }].map(({ label, key, type, ph }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>{label}</label>
                    <input type={type} placeholder={ph} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required style={inp} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                ))}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Topic</label>
                <select value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} required style={{ ...inp, appearance: 'none', cursor: 'pointer' }} onFocus={focusIn} onBlur={focusOut}>
                  <option value="" disabled>Select a topic…</option>
                  {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Message</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required placeholder="Describe your question or issue in detail…" style={{ ...inp, minHeight: 130, resize: 'vertical', lineHeight: 1.65 }} onFocus={focusIn} onBlur={focusOut} />
              </div>

              <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', background: 'var(--blue)', color: '#f', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--blue)'}
              ><Send size={15} />Send message</button>
            </form>
          )}
        </div>

        {/* Right: channels + response time */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Channels */}
          <div style={{ background: '#f', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>Other ways to reach us</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {channels.map(({ icon: Icon, label, value, href, color, bg, border, desc }) => (
                <a key={label} href={href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--radius)', border: `1px solid ${border}`, background: bg, transition: 'opacity 0.15s', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
                  </div>
                  <div style={{ fontSize: 11, color: color, fontWeight: 500, flexShrink: 0 }}>{desc}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Response time */}
          <div style={{ background: 'var(--blue-light)', border: '1px solid var(--blue-mid)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Clock size={15} color="var(--blue)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>Response times</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'General inquiries', time: 'Within 24 hours' },
                { label: 'Bug reports',        time: 'Within 48 hours' },
                { label: 'Data requests',      time: 'Within 72 hours' },
              ].map(({ label, time }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--blue-dark)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--blue)' }}>{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="anim-up">
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>Frequently asked questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: '#f', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{faq.q}</span>
                {openFaq === i
                  ? <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ color: '#f', fontSize: 14, lineHeight: 1 }}>−</span></div>
                  : <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--blue-light)', border: '1px solid var(--blue-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ color: 'var(--blue)', fontSize: 14, lineHeight: 1 }}>+</span></div>
                }
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 16px 14px', fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75 }} className="anim-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
