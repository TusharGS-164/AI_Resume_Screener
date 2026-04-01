import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Book, Upload, ScanSearch, Filter, EyeOff, Download, ShieldCheck, ChevronDown, ChevronUp, Zap } from 'lucide-react'

const sections = [
  {
    id: 'getting-started',
    icon: Zap,
    title: 'Getting Started',
    color: 'var(--blue)',
    bg: 'var(--blue-light)',
    border: 'var(--blue-mid)',
    content: [
      {
        heading: 'What is HireSense?',
        body: 'HireSense is an AI-powered resume screening platform that automatically reads, parses, and ranks candidates against a job description using Google Gemini AI. It extracts key information like skills, experience, education, and contact details — then scores each candidate from 0 to 100.',
      },
      {
        heading: 'Quick start in 3 steps',
        steps: [
          { num: '1', title: 'Create a screening session', desc: 'Go to "New Screening", enter a session title and paste your job description.' },
          { num: '2', title: 'Upload resumes',             desc: 'Drag and drop PDF, DOCX, or TXT files. You can upload multiple resumes at once.' },
          { num: '3', title: 'Review ranked results',      desc: 'The AI analyzes every resume and presents candidates ranked by match score. Use filters, stages, and blind mode to manage your pipeline.' },
        ],
      },
    ],
  },
  {
    id: 'uploading',
    icon: Upload,
    title: 'Uploading Resumes',
    color: 'var(--green)',
    bg: 'var(--green-bg)',
    border: 'var(--green-border)',
    content: [
      {
        heading: 'Supported file formats',
        items: ['PDF (.pdf) — best extraction quality', 'Word documents (.docx)', 'Plain text files (.txt)'],
      },
      {
        heading: 'Duplicate detection',
        body: 'HireSense automatically detects duplicate resumes using a SHA-256 content hash. If the same resume is uploaded under two different filenames, it will be flagged with an amber "Duplicate" banner. Use the "Hide dupes" toggle on the results page to exclude them.',
      },
      {
        heading: 'Tips for best results',
        items: [
          'Use text-based PDFs (not scanned images) for accurate extraction.',
          'Ensure resumes are in English for highest AI accuracy.',
          'Upload up to 20 resumes per session for optimal performance.',
          'The more detailed your job description, the more precise the scoring.',
        ],
      },
    ],
  },
  {
    id: 'screening',
    icon: ScanSearch,
    title: 'AI Screening & Scoring',
    color: 'var(--amber)',
    bg: 'var(--amber-bg)',
    border: 'var(--amber-border)',
    content: [
      {
        heading: 'How scoring works',
        body: 'Each resume is analyzed by Gemini 1.5 Flash against your job description. The AI evaluates skill overlap, experience level, education, and role relevance to produce a match score from 0 to 100.',
      },
      {
        heading: 'Score thresholds',
        table: [
          { score: '85 – 100', rec: 'Strong Yes', color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)',  desc: 'Exceptional match — highly recommended for interview' },
          { score: '65 – 84',  rec: 'Yes',        color: '#1a6fc4',       bg: 'var(--blue-light)',border: 'var(--blue-mid)',      desc: 'Good match — worth a closer look' },
          { score: '45 – 64',  rec: 'Maybe',      color: 'var(--amber)',  bg: 'var(--amber-bg)',  border: 'var(--amber-border)',  desc: 'Partial match — missing some key requirements' },
          { score: '0 – 44',   rec: 'No',         color: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)',    desc: 'Poor match — does not meet core requirements' },
        ],
      },
      {
        heading: 'What gets extracted',
        items: ['Full name, email, phone, location', 'Current role & company', 'Total years of experience', 'Highest education level', 'Up to 12 skills from the resume', 'Skills that match the job description', 'Skills missing from the resume', 'Key strengths (evidence-based)', 'Experience gaps (skills-only, no personal bias)', 'Recruiter summary & blind summary'],
      },
    ],
  },
  {
    id: 'filtering',
    icon: Filter,
    title: 'Filtering & Search',
    color: 'var(--purple)',
    bg: 'var(--purple-bg)',
    border: 'var(--purple-border)',
    content: [
      {
        heading: 'Search',
        body: 'The search bar on the results page searches across candidate name, skills, current role, location, and education — all server-side for accuracy.',
      },
      {
        heading: 'Available filters',
        items: [
          'Recommendation (Strong Yes / Yes / Maybe / No) — click the stat cards or pill tabs',
          'Hiring stage (New / Reviewed / Shortlisted / Rejected / Hired)',
          'Minimum and maximum match score',
          'Minimum and maximum years of experience',
          'Hide duplicates toggle',
        ],
      },
      {
        heading: 'Hiring pipeline stages',
        table: [
          { score: 'New',         rec: 'New',         color: 'var(--text-3)', bg: 'var(--bg)',          border: 'var(--border)',          desc: 'Default state for all newly screened candidates' },
          { score: 'Reviewed',    rec: 'Reviewed',    color: '#1a6fc4',       bg: 'var(--blue-light)',  border: 'var(--blue-mid)',        desc: 'You have looked at this candidate' },
          { score: 'Shortlisted', rec: 'Shortlisted', color: 'var(--green)',  bg: 'var(--green-bg)',    border: 'var(--green-border)',    desc: 'Candidate is in your shortlist for interview' },
          { score: 'Rejected',    rec: 'Rejected',    color: 'var(--red)',    bg: 'var(--red-bg)',      border: 'var(--red-border)',      desc: 'Candidate has been declined' },
          { score: 'Hired',       rec: 'Hired',       color: 'var(--gold)',   bg: 'var(--gold-bg)',     border: 'var(--gold-border)',     desc: 'Candidate has been hired' },
        ],
      },
    ],
  },
  {
    id: 'bias',
    icon: EyeOff,
    title: 'Blind Mode & Bias Reduction',
    color: 'var(--red)',
    bg: 'var(--red-bg)',
    border: 'var(--red-border)',
    content: [
      {
        heading: 'What is blind mode?',
        body: 'Blind mode hides all personally identifiable information — names, email addresses, and phone numbers — replacing them with anonymous IDs (e.g. "Candidate #42"). This helps recruiters evaluate candidates based purely on skills and experience, reducing unconscious bias.',
      },
      {
        heading: 'How bias-aware summaries work',
        body: 'Every candidate gets two AI-generated summaries: a standard summary and a blind summary. The blind summary is explicitly prompted to exclude name, gender pronouns, age, nationality, and any demographic signals. When blind mode is active, the blind summary is displayed instead.',
      },
      {
        heading: 'What blind mode hides',
        items: ['Candidate full name → replaced with "Candidate #ID"', 'Email address → masked', 'Phone number → masked', 'Location (city/country)', 'AI summary swapped for bias-free version'],
      },
      {
        heading: 'What remains visible',
        items: ['Match score and recommendation', 'Current role and company', 'Education level and field', 'Skills (matched and missing)', 'Years of experience', 'Strengths and skill gaps'],
      },
    ],
  },
  {
    id: 'export',
    icon: Download,
    title: 'Exporting Reports',
    color: '#5a1f8a',
    bg: 'var(--purple-bg)',
    border: 'var(--purple-border)',
    content: [
      {
        heading: 'CSV export',
        body: 'Downloads a spreadsheet with all candidates ranked by score. Columns include: Rank, Name, Score, Recommendation, Stage, Experience, Education, Current Role, Location, Email, Phone, Matched Skills, Missing Skills, and Summary.',
      },
      {
        heading: 'PDF report',
        body: 'Generates a formatted PDF report with a summary table followed by individual candidate detail sections. Includes matched skills and any recruiter notes you have added. Ideal for sharing with hiring managers.',
      },
      {
        heading: 'Recruiter notes',
        body: 'You can add private notes to any candidate directly on the results page. Notes are saved instantly and included in PDF exports. They are visible only within your account.',
      },
    ],
  },
  {
    id: 'admin',
    icon: ShieldCheck,
    title: 'Admin Panel',
    color: 'var(--amber)',
    bg: 'var(--amber-bg)',
    border: 'var(--amber-border)',
    content: [
      {
        heading: 'Admin access',
        body: 'The first user who registers on the platform automatically becomes the admin. Admins can view all screening sessions across all users, access platform-wide statistics, and manage user accounts from the Admin panel.',
      },
      {
        heading: 'Admin features',
        items: ['View all sessions across all users (not just your own)', 'Platform statistics: total users, sessions, candidates, average score', 'Sessions per user bar chart', 'Full user list with email, role, and session count'],
      },
    ],
  },
]

function AccordionSection({ section }) {
  const [open, setOpen] = useState(true)
  const Icon = section.icon
  return (
    <div style={{ background: '#f', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '1.1rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-light)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ width: 36, height: 36, borderRadius: 8, background: section.bg, border: `1px solid ${section.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={17} color={section.color} />
        </div>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{section.title}</span>
        {open ? <ChevronUp size={16} color="var(--text-3)" /> : <ChevronDown size={16} color="var(--text-3)" />}
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '1.5rem' }} className="anim-in">
          {section.content.map((block, bi) => (
            <div key={bi} style={{ marginBottom: bi < section.content.length - 1 ? '1.5rem' : 0 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{block.heading}</h3>

              {block.body && <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75 }}>{block.body}</p>}

              {block.items && (
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {block.items.map((item, ii) => (
                    <li key={ii} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
                      <span style={{ color: section.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>•</span>{item}
                    </li>
                  ))}
                </ul>
              )}

              {block.steps && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {block.steps.map(step => (
                    <div key={step.num} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: section.bg, border: `1.5px solid ${section.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: section.color, flexShrink: 0 }}>{step.num}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{step.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {block.table && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '110px 120px 1fr', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', padding: '8px 14px' }}>
                    {['Score', 'Recommendation', 'Meaning'].map(h => (
                      <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
                    ))}
                  </div>
                  {block.table.map((row, ri) => (
                    <div key={ri} style={{ display: 'grid', gridTemplateColumns: '110px 120px 1fr', padding: '10px 14px', borderBottom: ri < block.table.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center', background: ri % 2 ? 'var(--surface-2)' : '#f' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{row.score}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, padding: '3px 9px', borderRadius: 99, background: row.bg, color: row.color, border: `1px solid ${row.border}`, fontWeight: 600, width: 'fit-content' }}>{row.rec}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{row.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DocumentationPage() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 900, margin: '0 auto' }}>
      <div className="anim-up" style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--blue)', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, marginBottom: 14, padding: 0 }}>
          <ArrowLeft size={14} />Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, background: 'var(--blue-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--blue-mid)' }}>
            <Book size={22} color="var(--blue)" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Documentation</h1>
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Everything you need to know about using HireSense</p>
          </div>
        </div>
      </div>

      {/* Quick nav */}
      <div className="anim-up" style={{ background: '#f', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Quick navigation</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`} style={{ fontSize: 13, fontWeight: 500, padding: '4px 12px', borderRadius: 99, background: s.bg, color: s.color, border: `1px solid ${s.border}`, transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >{s.title}</a>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="stagger">
        {sections.map(section => (
          <div key={section.id} id={section.id}>
            <AccordionSection section={section} />
          </div>
        ))}
      </div>
    </div>
  )
}
