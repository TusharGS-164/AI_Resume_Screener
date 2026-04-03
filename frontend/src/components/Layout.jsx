import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, ScanSearch, ShieldCheck, LogOut, Sparkles } from 'lucide-react'
import logo from '../assets/resume-logo.png'
import { ExternalLink } from 'lucide-react'

function AppFooter() {
  const year = new Date().getFullYear()
  return (
    <footer style={{
      background: '#cdaa6d',
      borderTop: '1px solid var(--border)',
      padding: '0',
      marginTop: 'auto',
      flexShrink: 0,
    }}>
      {/* Main footer content */}
      <div style={{ maxWidth: 1100,margin: '0 auto', padding: '2rem 2.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '1.75rem' }}>

          {/* Brand column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: 'var(--blue)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {/* <Zap size={16} color="#fff" fill="#fff" /> */}
                            <img src={logo} alt="logo" height={40} />

              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: 'black' }}>HireSense</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 260, marginBottom: 16 }}>
              AI-powered resume screening that helps recruiters find the best candidates faster — with less bias.
            </p>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                // { Icon: Github,   href: '#', title: 'GitHub' },
                // { Icon: Twitter,  href: '#', title: 'Twitter' },
                // { Icon: Linkedin, href: '#', title: 'LinkedIn' },
                // { Icon: Mail,     href: 'mailto:hello@resumeai.com', title: 'Email' },
              ].map(({ Icon, href, title }) => (
                <a key={title} href={href} title={title}
                  style={{ width: 32, height: 32, border: '1px solid var(--border)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', transition: 'all 0.15s', background: '#fff' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)'; e.currentTarget.style.background = 'var(--blue-light)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = '#fff' }}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'black', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Product</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                { label: 'Dashboard',      href: '/dashboard' },
                { label: 'New Screening',  href: '/screen' },
               { label: 'Blind Mode', href: '/screen?mode=blind' },
               { label: 'Export Reports', href: '/dashboard?export=true' },
              ].map(({ label, href }) => (
                <NavLink
        key={label}
        to={href}
        style={{
          fontSize: 13,
          color: 'var(--text-3)',
          textDecoration: 'none',
          transition: 'color 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--blue)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
      >
        {label}
      </NavLink>
              ))}
            </div>
          </div>

          {/* Features links */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'black', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Features</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                'AI Ranking',
                'Skill Matching',
                'Duplicate Detection',
                'Bias Reduction',
                'Hiring Pipeline',
              ].map(label => (
                <span key={label} style={{ fontSize: 13, color: 'var(--text-3)' }}>{label}</span>
              ))}
            </div>
          </div>

          {/* Support links */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'black', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Support</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
             {[
  { label: 'Documentation', href: '/docs' },
  { label: 'API Reference',  href: '/api' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use',   href: '/terms' },
  { label: 'Contact Us',     href: '/contact' },
].map(({ label, href }) => {
  const isExternal = href.startsWith('http')

  const style = {
    fontSize: 13,
    color: 'var(--text-3)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    transition: 'color 0.15s',
    textDecoration: 'none'
  }

  if (isExternal) {
    return (
      <a
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={style}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--blue)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
      >
        {label}
        <ExternalLink size={10} />
      </a>
    )
  }

  return (
    <NavLink
      key={label}
      to={href}
      style={style}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--blue)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
    >
      {label}
    </NavLink>
  )
})}
            </div>
          </div>
        </div>

        {/* AI badge strip */}
      

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', textAlign:'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)', textAlign:'center' }}>
            © {year} HireSense. All rights reserved
          </span>
         
        </div>
      </div>
    </footer>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const handleLogout = () => { logout(); navigate('/login') }

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/screen', icon: ScanSearch, label: 'New Screening' },
    ...(user?.is_admin ? [{ to: '/admin', icon: ShieldCheck, label: 'Admin' }] : []),
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 228,
        background: 'var(--bg-2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle top accent line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0.5 }} />

        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
             
            }}>
            <img src={logo} alt="logo" height={40} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)', letterSpacing: '-0.01em' }}>HireSense</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: -1 }}>Screening Suite</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
            return (
              <NavLink
                key={to}
                to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 'var(--radius)',
                  fontSize: 16, fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--gold-light)' : 'var(--text-2)',
                  background: isActive ? 'var(--gold-dim)' : 'transparent',
                  border: isActive ? '1px solid rgba(201,169,110,0.2)' : '1px solid transparent',
                  transition: 'all 0.15s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--bg-3)' }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'transparent' }}}
              >
                <Icon size={15} />
                {label}
                {isActive && <div style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)' }} />}
              </NavLink>
            )
          })}
        </nav>

        {/* User footer */}
        <div style={{ padding: '12px 10px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--bg-4), var(--surface-2))',
              border: '1px solid var(--border-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 600, color: 'var(--gold)', flexShrink: 0,
            }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{user?.is_admin ? 'Admin' : 'Member'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)',
              fontSize: 14, color: 'var(--text-3)', transition: 'all 0.15s',
              border: '1px solid transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-bg)'; e.currentTarget.style.borderColor = 'var(--red-border)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
     <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
             <div style={{ flex: 1 }}>
               <Outlet />
             </div>
             <AppFooter />
           </main>
    </div>
  )
}
