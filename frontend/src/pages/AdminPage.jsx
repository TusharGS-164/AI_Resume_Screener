import { useState, useEffect } from 'react'
// import axios from 'axios'
import API from "../api";
import { ShieldCheck, Users, FileStack, BarChart2, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const BAR_COLORS = ['#c9a96e', '#4caf82', '#5b9bd5', '#d4924a', '#c95b5b', '#a78bfa']

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <div
      className="animate-up"
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '1.25rem', position: 'relative', overflow: 'hidden',
        animationDelay: delay,
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }} />
      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 12 }}>
        <Icon size={26} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 16, color: 'var(--text-3)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '8px 12px', fontSize: 12, color: 'var(--text)' }}>
      <div style={{ color: 'var(--text-3)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 500, color: 'var(--gold)' }}>{payload[0].value} sessions</div>
    </div>
  )
}

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
useEffect(() => {
  Promise.all([
    API.get('/api/admin/stats'),
    API.get('/api/admin/users')
  ])
    .then(([s, u]) => {
      setStats(s.data);
      setUsers(u.data);
    })
    .catch((err) => {
      console.error("Admin API error:", err);
      setStats({
        total_users: 0,
        total_sessions: 0,
        total_candidates: 0,
        avg_score: 0
      });
      setUsers([]);
    })
    .finally(() => setLoading(false));
}, []);


  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)', gap: 10 }}>
      <div style={{ width: 20, height: 20, border: '2px solid var(--border-2)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      Loading...
    </div>
  )

  const chartData = users.map((u, i) => ({ name: u.name.split(' ')[0], sessions: u.session_count, i }))

  return (
    <div style={{ padding: '2rem 2.5rem',  margin: '0 auto',minWidth:'1200px' }}>
      {/* Header */}
      <div className="animate-up" style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: 14, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Administration</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'var(--text)', lineHeight: 1 }}>
          Platform <em style={{ color: 'var(--gold)' }}>overview</em>
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '1.75rem' }}>
        <StatCard icon={Users} label="Total users" value={stats.total_users || 0} color="var(--blue)" delay="0.05s" />
        <StatCard icon={FileStack} label="Sessions" value={stats.total_sessions || 0} color="var(--green)" delay="0.10s" />
        <StatCard icon={BarChart2} label="Candidates analyzed" value={stats.total_candidates || 0} color="var(--gold)" delay="0.15s" />
        <StatCard icon={TrendingUp} label="Avg match score" value={`${stats.avg_score}` || 0} color="var(--amber)" delay="0.20s" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.25rem' }}>
        {/* Chart */}
        <div className="animate-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', animationDelay: '0.25s' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>Sessions per user</div>
          {chartData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 14 }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 14, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 14, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="sessions" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {chartData.map((entry) => <Cell key={entry.i} fill={BAR_COLORS[entry.i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Users table */}
        <div className="animate-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', animationDelay: '0.30s' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>All users</div>
            <span style={{ fontSize: 14, color: 'var(--text-3)', background: 'var(--bg-3)', padding: '2px 10px', borderRadius: 99, border: '1px solid var(--border)' }}>{users.length}</span>
          </div>
          <div>
            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 60px 80px', padding: '8px 1.5rem', borderBottom: '1px solid var(--border)' }}>
              {['User', 'Email', 'Role', 'Sessions'].map(h => (
                <div key={h} style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
              ))}
            </div>
            <div className="stagger">
              {users.map(u => {
                const initials = u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                return (
                  <div
                    key={u.id}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 80px', padding: '12px 1.5rem', borderBottom: '1px solid var(--border)', alignItems: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-4)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--gold)', flexShrink: 0 }}>
                        {initials}
                      </div>
                      <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)' }}>{u.name}</span>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-3)', overflow: 'hidden',margin:'0px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{u.email}</div>
                    <div>
                      <span style={{ fontSize: 13, padding: '2px 8px', borderRadius: 99, background: u.is_admin ? 'var(--amber-bg)' : 'var(--bg-4)', color: u.is_admin ? 'var(--amber)' : 'var(--text-3)', fontWeight: 500, border: `1px solid ${u.is_admin ? 'var(--amber-border)' : 'var(--border)'}`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {u.is_admin ? 'Admin' : 'Member'}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: u.session_count > 0 ? 'var(--gold)' : 'var(--text-3)' }}>
                      {u.session_count}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
