import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Code, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'

const METHOD_COLORS = {
  GET:    { color: '#1a6fc4', bg: 'var(--blue-light)',  border: 'var(--blue-mid)' },
  POST:   { color: 'var(--green)', bg: 'var(--green-bg)', border: 'var(--green-border)' },
  PATCH:  { color: 'var(--amber)', bg: 'var(--amber-bg)', border: 'var(--amber-border)' },
  DELETE: { color: 'var(--red)',   bg: 'var(--red-bg)',   border: 'var(--red-border)' },
}

const endpoints = [
  {
    group: 'Authentication',
    color: 'var(--blue)',
    routes: [
      {
        method: 'POST', path: '/api/auth/register',
        summary: 'Register a new user',
        description: 'Creates a new user account. The first registered user is automatically granted admin privileges.',
        body: `{ "email": "user@example.com", "name": "Jane Doe", "password": "yourpassword" }`,
        response: `{ "id": 1, "email": "user@example.com", "name": "Jane Doe", "is_admin": true }`,
      },
      {
        method: 'POST', path: '/api/auth/login',
        summary: 'Login and get JWT token',
        description: 'Authenticates with email and password (form-encoded). Returns a Bearer token to include in subsequent requests.',
        body: `username=user@example.com&password=yourpassword  (form-urlencoded)`,
        response: `{ "access_token": "eyJ...", "token_type": "bearer", "user": { "id": 1, "email": "...", "name": "...", "is_admin": true } }`,
      },
      {
        method: 'GET', path: '/api/auth/me',
        summary: 'Get current user',
        description: 'Returns the profile of the currently authenticated user. Requires Authorization header.',
        response: `{ "id": 1, "email": "user@example.com", "name": "Jane Doe", "is_admin": true }`,
      },
    ],
  },
  {
    group: 'Screening Sessions',
    color: 'var(--green)',
    routes: [
      {
        method: 'POST', path: '/api/screen/',
        summary: 'Create a new screening session',
        description: 'Uploads resumes and runs AI screening against the job description. Returns ranked candidates. Accepts multipart/form-data.',
        body: `title: "Senior Backend Engineer"\njob_description: "We are looking for..."\nfiles: [resume1.pdf, resume2.docx, ...]`,
        response: `{ "session_id": 5, "title": "Senior Backend Engineer", "candidates": [...] }`,
      },
      {
        method: 'GET', path: '/api/screen/sessions',
        summary: 'List all screening sessions',
        description: 'Returns all sessions for the current user. Admins see all sessions across all users.',
        response: `[ { "id": 5, "title": "...", "status": "active", "candidate_count": 8, "shortlisted": 2, "top_score": 91.0, ... } ]`,
      },
      {
        method: 'GET', path: '/api/screen/sessions/{id}',
        summary: 'Get session details with filters',
        description: 'Returns full session data including all (filtered) candidates and stats.',
        params: [
          { name: 'search',          type: 'string',  desc: 'Full-text search across name, skills, role, location' },
          { name: 'stage',           type: 'string',  desc: 'Filter by stage: new | reviewed | shortlisted | rejected | hired' },
          { name: 'recommendation',  type: 'string',  desc: 'Filter by: Strong Yes | Yes | Maybe | No' },
          { name: 'min_score',       type: 'float',   desc: 'Minimum match score (0–100)' },
          { name: 'max_score',       type: 'float',   desc: 'Maximum match score (0–100)' },
          { name: 'min_exp',         type: 'float',   desc: 'Minimum years of experience' },
          { name: 'max_exp',         type: 'float',   desc: 'Maximum years of experience' },
          { name: 'hide_duplicates', type: 'boolean', desc: 'Exclude duplicate resumes' },
          { name: 'blind_mode',      type: 'boolean', desc: 'Anonymize names and contact info' },
        ],
        response: `{ "id": 5, "title": "...", "candidates": [...], "rec_counts": { "Strong Yes": 2, "Yes": 3, ... }, "stage_counts": {...}, ... }`,
      },
      {
        method: 'PATCH', path: '/api/screen/sessions/{id}',
        summary: 'Update session status or notes',
        description: 'Update the status (active/archived/closed) or recruiter notes of a session.',
        body: `{ "status": "archived", "notes": "Filled — closing this role." }`,
        response: `{ "id": 5, "status": "archived", "notes": "Filled — closing this role." }`,
      },
      {
        method: 'DELETE', path: '/api/screen/sessions/{id}',
        summary: 'Delete a session',
        description: 'Permanently deletes the session and all associated candidates. This action cannot be undone.',
        response: `{ "message": "Deleted" }`,
      },
    ],
  },
  {
    group: 'Candidates',
    color: 'var(--amber)',
    routes: [
      {
        method: 'PATCH', path: '/api/screen/candidates/{id}',
        summary: 'Update candidate stage or notes',
        description: 'Move a candidate to a different hiring stage and/or update recruiter notes.',
        body: `{ "stage": "shortlisted", "recruiter_notes": "Great Python background, schedule call." }`,
        response: `{ "id": 12, "stage": "shortlisted", "recruiter_notes": "Great Python background, schedule call." }`,
      },
    ],
  },
  {
    group: 'Export',
    color: 'var(--purple)',
    routes: [
      {
        method: 'GET', path: '/api/screen/sessions/{id}/export/csv',
        summary: 'Export session as CSV',
        description: 'Downloads a CSV file with all candidates ranked by score including all fields.',
        response: `Attachment: screening_{id}.csv`,
      },
      {
        method: 'GET', path: '/api/screen/sessions/{id}/export/pdf',
        summary: 'Export session as PDF report',
        description: 'Generates a formatted PDF report with summary table and per-candidate detail sections.',
        response: `Attachment: screening_{id}.pdf`,
      },
    ],
  },
  {
    group: 'Admin',
    color: 'var(--red)',
    routes: [
      {
        method: 'GET', path: '/api/admin/stats',
        summary: 'Get platform statistics',
        description: 'Returns platform-wide stats. Requires admin role.',
        response: `{ "total_users": 4, "total_sessions": 12, "total_candidates": 87, "avg_score": 64.3 }`,
      },
      {
        method: 'GET', path: '/api/admin/users',
        summary: 'List all users',
        description: 'Returns all registered users with their session counts. Requires admin role.',
        response: `[ { "id": 1, "email": "...", "name": "...", "is_admin": true, "session_count": 5, "created_at": "..." } ]`,
      },
    ],
  },
]

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: '#f', fontSize: 11, color: copied ? 'var(--green)' : 'var(--text-3)', cursor: 'pointer', transition: 'all 0.15s', fontWeight: 500 }}>
      {copied ? <><Check size={11} />Copied</> : <><Copy size={11} />Copy</>}
    </button>
  )
}

function CodeBlock({ code }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 8, right: 8 }}><CopyButton text={code} /></div>
      <pre style={{ background: '#1e1e2e', borderRadius: 'var(--radius)', padding: '14px 16px', fontSize: 12, color: '#cdd6f4', overflowX: 'auto', lineHeight: 1.7, fontFamily: 'ui-monospace, SFMono-Regular, monospace', margin: 0 }}>{code}</pre>
    </div>
  )
}

function EndpointCard({ route }) {
  const [open, setOpen] = useState(false)
  const m = METHOD_COLORS[route.method] || METHOD_COLORS.GET
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#f' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-light)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 4, background: m.bg, color: m.color, border: `1px solid ${m.border}`, minWidth: 52, textAlign: 'center', letterSpacing: '0.04em' }}>{route.method}</span>
        <code style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'ui-monospace, SFMono-Regular, monospace', flex: 1 }}>{route.path}</code>
        <span style={{ fontSize: 13, color: 'var(--text-3)', flex: 1 }}>{route.summary}</span>
        {open ? <ChevronUp size={15} color="var(--text-3)" /> : <ChevronDown size={15} color="var(--text-3)" />}
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 16 }} className="anim-in">
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>{route.description}</p>

          {route.params && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Query parameters</div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 80px 1fr', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', padding: '8px 14px' }}>
                  {['Parameter', 'Type', 'Description'].map(h => <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>)}
                </div>
                {route.params.map((p, i) => (
                  <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '160px 80px 1fr', padding: '9px 14px', borderBottom: i < route.params.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 ? 'var(--surface-2)' : '#f', alignItems: 'center' }}>
                    <code style={{ fontSize: 12, fontFamily: 'ui-monospace, SFMono-Regular, monospace', color: 'var(--blue)', fontWeight: 600 }}>{p.name}</code>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--bg)', padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border)', width: 'fit-content' }}>{p.type}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {route.body && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Request body</div>
              <CodeBlock code={route.body} />
            </div>
          )}

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Response</div>
            <CodeBlock code={route.response} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--blue-light)', borderRadius: 'var(--radius)', border: '1px solid var(--blue-mid)' }}>
            <span style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 500 }}>🔒 Requires Authorization: Bearer &lt;token&gt; header</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ApiReferencePage() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 960, margin: '0 auto' }}>
      <div className="anim-up" style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--blue)', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, marginBottom: 14, padding: 0 }}>
          <ArrowLeft size={14} />Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, background: '#1e1e2e', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Code size={22} color="#cdd6f4" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>API Reference</h1>
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Base URL: <code style={{ fontFamily: 'ui-monospace, monospace', background: 'var(--bg)', padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border)', fontSize: 13 }}>http://localhost:8000</code></p>
          </div>
        </div>
      </div>

      {/* Auth note */}
      <div className="anim-up" style={{ background: 'var(--blue-light)', border: '1px solid var(--blue-mid)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)', marginBottom: 5 }}>Authentication</div>
        <p style={{ fontSize: 13, color: 'var(--blue-dark)', lineHeight: 1.65 }}>
          All endpoints (except <code style={{ fontFamily: 'monospace', background: '#f', padding: '1px 5px', borderRadius: 3, border: '1px solid var(--blue-mid)' }}>/api/auth/register</code> and <code style={{ fontFamily: 'monospace', background: '#f', padding: '1px 5px', borderRadius: 3, border: '1px solid var(--blue-mid)' }}>/api/auth/login</code>) require a JWT token in the <strong>Authorization</strong> header: <code style={{ fontFamily: 'monospace', background: '#f', padding: '1px 5px', borderRadius: 3, border: '1px solid var(--blue-mid)' }}>Authorization: Bearer &lt;your_token&gt;</code>
        </p>
      </div>

      {endpoints.map(group => (
        <div key={group.group} style={{ marginBottom: '2rem' }} className="anim-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ height: 2, width: 20, background: group.color, borderRadius: 99 }} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{group.group}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {group.routes.map((route, i) => <EndpointCard key={i} route={route} />)}
          </div>
        </div>
      ))}
    </div>
  )
}
