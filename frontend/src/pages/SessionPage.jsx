import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft, Download, Star, CheckCircle, XCircle, HelpCircle, AlertCircle,
  ChevronDown, ChevronUp, Search, SlidersHorizontal, EyeOff, Eye,
  Copy, Filter, X, FileText, Phone, Mail, MapPin, Briefcase, GraduationCap,
  Flag, Sparkles, CheckSquare, Clock, UserCheck, UserX, Trophy, StickyNote
} from 'lucide-react'


function normalizeRec(rec) {
  if (!rec) return 'Maybe'
  const r = rec.trim().toLowerCase()
  if (r === 'strong yes') return 'Strong Yes'
  if (r === 'yes') return 'Yes'
  if (r === 'maybe') return 'Maybe'
  if (r === 'no') return 'No'
  return 'Maybe'
}

const REC_META = {
  'Strong Yes': { icon: Star, color: 'var(--green)', bg: 'var(--green-bg)', border: 'var(--green-border)' },
  'Yes': { icon: CheckCircle, color: 'var(--blue)', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
  'Maybe': { icon: HelpCircle, color: 'var(--amber)', bg: 'var(--amber-bg)', border: 'var(--amber-border)' },
  'No': { icon: XCircle, color: 'var(--red)', bg: 'var(--red-bg)', border: 'var(--red-border)' },
}

const STAGE_META = {
  new:         { label: 'New',         icon: Clock,      color: 'var(--text-3)',  bg: 'var(--bg-4)',      border: 'var(--border)' },
  reviewed:    { label: 'wed',    icon: Eye,        color: 'var(--blue)',    bg: 'var(--blue-bg)',   border: 'var(--blue-border)' },
  shortlisted: { label: 'Shortlisted', icon: CheckSquare,color: 'var(--green)',   bg: 'var(--green-bg)',  border: 'var(--green-border)' },
  rejected:    { label: 'Rejected',    icon: UserX,      color: 'var(--red)',     bg: 'var(--red-bg)',    border: 'var(--red-border)' },
  hired:       { label: 'Hired',       icon: Trophy,     color: 'var(--gold)',    bg: 'var(--gold-dim)',  border: 'rgba(201,169,110,0.3)' },
}

function ScoreRing({ score }) {
  const r = 26, circ = 2 * Math.PI * r
  const color = score >= 80 ? '#4caf82' : score >= 60 ? '#5b9bd5' : score >= 40 ? '#d4924a' : '#c95b5b'
  return (
    <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
      <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color, lineHeight: 1 }}>{Math.round(score)}</span>
      </div>
    </div>
  )
}

function RecBadge({ rec }) {
  const m = REC_META[rec] || { icon: AlertCircle, color: 'var(--text-2)', bg: 'var(--bg-3)', border: 'var(--border-2)' }
  const Icon = m.icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '4px 9px', borderRadius: 99, background: m.bg, color: m.color, fontWeight: 500, border: `1px solid ${m.border}` }}>
      <Icon size={10} />{rec}
    </span>
  )
}

function StageBadge({ stage }) {
  const m = STAGE_META[stage] || STAGE_META.new
  const Icon = m.icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '4px 9px', borderRadius: 99, background: m.bg, color: m.color, fontWeight: 500, border: `1px solid ${m.border}` }}>
      <Icon size={10} />{m.label}
    </span>
  )
}

function StageDropdown({ current, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', background: 'var(--bg-3)', cursor: 'pointer', fontSize: 12, color: 'var(--text-2)' }}
      >
        Move to <ChevronDown size={11} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-lg)', padding: 6, zIndex: 100, minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          {Object.entries(STAGE_META).map(([key, meta]) => {
            const Icon = meta.icon
            return (
              <button
                key={key}
                onClick={e => { e.stopPropagation(); onSelect(key); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '7px 10px', borderRadius: 6, border: 'none',
                  background: current === key ? meta.bg : 'transparent',
                  color: current === key ? meta.color : 'var(--text-2)',
                  fontSize: 12, cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={e => { if (current !== key) e.currentTarget.style.background = 'var(--bg-3)' }}
                onMouseLeave={e => { if (current !== key) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={13} />{meta.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SkillTag({ label, match }) {
  return (
    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, fontWeight: 500, background: match ? 'var(--green-bg)' : 'var(--bg-3)', color: match ? 'var(--green)' : 'var(--text-3)', border: `1px solid ${match ? 'var(--green-border)' : 'var(--border)'}` }}>
      {label}
    </span>
  )
}

function InfoChip({ icon: Icon, value }) {
  if (!value) return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-3)', background: 'var(--bg-3)', padding: '4px 8px', borderRadius: 99, border: '1px solid var(--border)' }}>
      <Icon size={10} />{value}
    </span>
  )
}

function CandidateCard({ candidate: initial, rank, blindMode, onStageChange }) {
  const [open, setOpen] = useState(rank === 0)
  const [candidate, setCandidate] = useState(initial)
  const [notesOpen, setNotesOpen] = useState(false)
  const [notes, setNotes] = useState(initial.recruiter_notes || '')
  const [saving, setSaving] = useState(false)
  const rec = normalizeRec(candidate.recommendation)

  useEffect(() => { setCandidate(initial); setNotes(initial.recruiter_notes || '') }, [initial])

  const updateStage = async (stage) => {
    const updated = { ...candidate, stage }
    setCandidate(updated)
    onStageChange(candidate.id, stage)
    await axios.patch(`/api/screen/candidates/${candidate.id}`, { stage, recruiter_notes: notes })
  }

  const saveNotes = async () => {
    setSaving(true)
    await axios.patch(`/api/screen/candidates/${candidate.id}`, { stage: candidate.stage, recruiter_notes: notes })
    setCandidate(c => ({ ...c, recruiter_notes: notes }))
    setSaving(false)
    setNotesOpen(false)
  }

  const displayName = blindMode ? `Candidate #${candidate.id}` : (candidate.name || candidate.filename)

  return (
    <div className="animate-up" style={{
      background: 'var(--surface)', border: `1px solid ${candidate.is_duplicate ? 'rgba(212,146,74,0.25)' : rank === 0 ? 'rgba(76,175,130,0.2)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-xl)', overflow: 'visible', opacity: candidate.stage === 'rejected' ? 0.65 : 1,
      animationDelay: `${Math.min(rank * 0.04, 0.4)}s`,
    }}>
      {/* Duplicate warning banner */}
      {candidate.is_duplicate && (
        <div style={{ background: 'var(--amber-bg)', borderBottom: '1px solid var(--amber-border)', padding: '5px 16px', fontSize: 11, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Copy size={11} /> Duplicate resume detected — same content as another uploaded file
        </div>
      )}

      {/* Header row */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
      <input
  type="checkbox"
  onClick={e => e.stopPropagation()}
  style={{
    accentColor: 'var(--gold)',
    cursor: 'pointer',
    transform: 'scale(1.1)'
  }}
/>

        <div style={{ fontSize: 16, color: 'var(--text-3)', fontWeight: 500, minWidth: 22, textAlign: 'center' }}>
          {rank === 0 ? <span style={{
  color:
    rank === 0 ? '#22c55e' :
    rank === 1 ? '#5b9bd5' :
    rank === 2 ? '#d4924a' :
    'var(--text-3)',
  fontWeight: 600
}}>
  #{rank + 1}
</span>: `#${rank + 1}`}
        </div>
        <ScoreRing score={candidate.score} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: 16, color: 'var(--text)', marginBottom: 5 }}>{displayName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',padding : '10px'

           }}>
            <RecBadge rec={rec} />
            <StageBadge stage={candidate.stage} />
            {candidate.experience && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{candidate.experience}</span>}
            {!blindMode && candidate.location && <InfoChip icon={MapPin} value={candidate.location} />}
          </div>
        </div>
        <div style={{ display: 'flex', align: 'center', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <StageDropdown current={candidate.stage} onSelect={updateStage} />
        </div>
        <div style={{ color: 'var(--text-3)', flexShrink: 0, marginLeft: 4 }}>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </div>

      {/* Expanded */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-in">
          {/* Contact info */}
          {!blindMode && (candidate.email || candidate.phone || candidate.current_role) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {candidate.email && <InfoChip icon={Mail} value={candidate.email} />}
              {candidate.phone && <InfoChip icon={Phone} value={candidate.phone} />}
              {candidate.current_role && <InfoChip icon={Briefcase} value={candidate.current_role} />}
              {candidate.education && <InfoChip icon={GraduationCap} value={candidate.education} />}
            </div>
          )}
          {blindMode && (candidate.current_role || candidate.education) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {candidate.current_role && <InfoChip icon={Briefcase} value={candidate.current_role} />}
              {candidate.education && <InfoChip icon={GraduationCap} value={candidate.education} />}
            </div>
          )}

          {/* Score bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              <span>Match score</span>
              <span style={{ color: candidate.score >= 65 ? 'var(--green)' : 'var(--text-2)', fontWeight: 500 }}>{Math.round(candidate.score)}/100</span>
            </div>
            <div style={{ height: 3, background: 'var(--bg-4)', borderRadius: 99, overflow: 'visible' }}>
              <div style={{ height: '100%', borderRadius: 99, width: `${candidate.score}%`, background: candidate.score >= 80 ? 'var(--green)' : candidate.score >= 60 ? 'var(--blue)' : candidate.score >= 40 ? 'var(--amber)' : 'var(--red)', transition: 'width 1s cubic-bezier(0.22,1,0.36,1)' }} />
            </div>
          </div>

          {/* Two column: summary + strengths/flags */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Summary</div>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
                {blindMode ? candidate.blind_summary || candidate.summary : candidate.summary}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {candidate.strengths?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Strengths</div>
                  {candidate.strengths.map((s, i) => (
                    <div key={i} style={{ fontSize: 14, color: 'var(--text-2)', display: 'flex', gap: 6, marginBottom: 3 }}>
                      <span style={{ color: 'var(--green)', flexShrink: 0 }}>+</span>{s}
                    </div>
                  ))}
                </div>
              )}
              {candidate.red_flags?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Flag size={10} />Gaps
                  </div>
                  {candidate.red_flags.map((f, i) => (
                    <div key={i} style={{ fontSize: 14, color: 'var(--text-2)', display: 'flex', gap: 6, marginBottom: 3 }}>
                      <span style={{ color: 'var(--amber)', flexShrink: 0 }}>−</span>{f}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {candidate.skills?.length > 0 && (
            <div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 7 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Skills</div>
                {candidate.missing_skills?.length > 0 && (
                  <span style={{ fontSize: 12, color: 'var(--red)', background: 'var(--red-bg)', padding: '1px 7px', borderRadius: 99, border: '1px solid var(--red-border)' }}>
                    {candidate.missing_skills.length} missing
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {candidate.skills.map(s => (
                  <SkillTag key={s} label={s} match={candidate.matched_skills?.some(m => m.toLowerCase() === s.toLowerCase())} />
                ))}
              </div>
              {candidate.missing_skills?.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {candidate.missing_skills.map(s => (
                    <span key={s} style={{ fontSize: 12, padding: '3px 9px', borderRadius: 99, background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid var(--red-border)' }}>−{s}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recruiter notes */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <button
              onClick={e => { e.stopPropagation(); setNotesOpen(o => !o) }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: candidate.recruiter_notes ? 'var(--gold)' : 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: notesOpen ? 8 : 0 }}
            >
              <StickyNote size={12} />
              {candidate.recruiter_notes ? 'Recruiter notes (saved)' : 'Add recruiter notes'}
              {notesOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
            {notesOpen && (
              <div onClick={e => e.stopPropagation()}>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add private notes about this candidate..."
                  style={{ width: '100%', minHeight: 80, background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 13, padding: '10px 12px', resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
                />
                <button
                  onClick={saveNotes}
                  disabled={saving}
                  style={{ marginTop: 6, padding: '6px 14px', background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 'var(--radius)', color: 'var(--gold)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                >
                  {saving ? 'Saving...' : 'Save notes'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const REC_FILTERS = ['All', 'Strong Yes', 'Yes', 'Maybe', 'No']
const STAGE_FILTERS = ['all', 'new', 'reviewed', 'shortlisted', 'rejected', 'hired']

export default function SessionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('score')


  // Filter state
  const [search, setSearch] = useState('')
  const [recFilter, setRecFilter] = useState('All')
  const [stageFilter, setStageFilter] = useState('all')
  const [minScore, setMinScore] = useState('')
  const [maxScore, setMaxScore] = useState('')
  const [minExp, setMinExp] = useState('')
  const [maxExp, setMaxExp] = useState('')
  const [hideDupes, setHideDupes] = useState(false)
  const [blindMode, setBlindMode] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showJD, setShowJD] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All') // rec quick filter

  const fetchSession = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (stageFilter !== 'all') params.append('stage', stageFilter)
      if (recFilter !== 'All') params.append('recommendation', recFilter)
      if (minScore) params.append('min_score', minScore)
      if (maxScore) params.append('max_score', maxScore)
      if (minExp) params.append('min_exp', minExp)
      if (maxExp) params.append('max_exp', maxExp)
      if (hideDupes) params.append('hide_duplicates', 'true')
      if (blindMode) params.append('blind_mode', 'true')
      const res = await axios.get(`/api/screen/sessions/${id}?${params}`)
      const data = res.data
      data.candidates = data.candidates.map(c => ({ ...c, recommendation: normalizeRec(c.recommendation) }))
      setSession(data)
    } catch { navigate('/dashboard') }
    setLoading(false)
  }, [id, search, stageFilter, recFilter, minScore, maxScore, minExp, maxExp, hideDupes, blindMode])

  useEffect(() => { fetchSession() }, [fetchSession])

  const handleStageChange = (candidateId, newStage) => {
    setSession(s => ({
      ...s,
      candidates: s.candidates.map(c => c.id === candidateId ? { ...c, stage: newStage } : c)
    }))
  }

  const exportFile = async type => {
    const res = await axios.get(`/api/screen/sessions/${id}/export/${type}`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a'); a.href = url; a.download = `screening_${id}.${type}`; a.click()
    URL.revokeObjectURL(url)
  }

  const clearFilters = () => {
    setSearch(''); setRecFilter('All'); setStageFilter('all')
    setMinScore(''); setMaxScore(''); setMinExp(''); setMaxExp('')
    setHideDupes(false); setActiveFilter('All')
  }

  const hasActiveFilters = search || recFilter !== 'All' || stageFilter !== 'all' || minScore || maxScore || minExp || maxExp || hideDupes

 if (loading) return (
  <div style={{ padding: '2rem' }}>
    {[1,2,3,4,5].map(i => (
      <div key={i} style={{
        height: 80,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 10,
        opacity: 0.6
      }} />
    ))} Analyzing Candidates
  </div>
)
  if (!session) return null

  const { rec_counts = {}, stage_counts = {}, duplicate_count = 0, total_count = 0, filtered_count = 0 } = session

  const inputCls = { background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 14, padding: '7px 10px', outline: 'none' }

  const sortedCandidates = [...session.candidates].sort((a, b) => {
  if (sortBy === 'score') return b.score - a.score
  if (sortBy === 'experience') return (b.experience_years || 0) - (a.experience_years || 0)
  if (sortBy === 'stage') return a.stage.localeCompare(b.stage)
  if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
  return 0
})

  return (
    <div style={{ padding: '1.75rem 2.5rem', minWidth: 1100, margin: '0 auto', position : 'relative',overflow: 'visible' }}>
      {/* Header */}
      <div className="animate-up"  style={{
  position: 'sticky',
  top: 0,
  zIndex: 30,
  background: 'var(--bg)',
  paddingTop: 10,
  paddingBottom: 10
}}>
        <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-3)', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 10, padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
        >
          <ArrowLeft size={13} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: 1.1, marginBottom: 4 }}>{session.title}</h1>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
              {new Date(session.created_at).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · {session.user_name} · {total_count} candidates
              {duplicate_count > 0 && <span style={{ color: 'var(--amber)', marginLeft: 8 }}>· {duplicate_count} duplicate{duplicate_count > 1 ? 's' : ''} found</span>}
            </p>
          </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
  <span style={{ fontSize: 14, color: 'var(--text-3)' }}>Actions:</span>
            <button
              onClick={() => setBlindMode(b => !b)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', border: `1px solid ${blindMode ? 'rgba(201,169,110,0.4)' : 'var(--border-2)'}`, borderRadius: 'var(--radius)', background: blindMode ? 'var(--gold-dim)' : 'var(--surface)', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: blindMode ? 'var(--gold-light)' : 'var(--text-2)', transition: 'all 0.15s' }}
              title="Blind mode hides names and contact info to reduce bias"
            >
              {blindMode ? <EyeOff size={13} /> : <Eye size={13} />}
              {blindMode ? 'Blind ON' : 'Blind mode'}
            </button>
            {[{ label: 'CSV', type: 'csv' }, { label: 'PDF', type: 'pdf' }].map(({ label, type }) => (
              <button key={type} onClick={() => exportFile(type)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', background: 'var(--surface)', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: 'var(--text-2)', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)' }}
              >
                <Download size={12} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blind mode notice */}
      {blindMode && (
        <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 'var(--radius-lg)', fontSize: 13, color: 'var(--gold-light)', marginBottom: '1rem' }}>
          <Sparkles size={14} />
          <strong>Bias-reduction mode active.</strong> Names, contact info and demographic signals are hidden. Summaries show skills and experience only.
        </div>
      )}

      {/* Rec stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: '1.25rem' ,minHeight:100}} className="animate-up">
        {['Strong Yes', 'Yes', 'Maybe', 'No'].map(rec => {
          const m = REC_META[rec]; const Icon = m.icon; const isActive = activeFilter === rec
          return (
            <button key={rec} onClick={() => { const next = isActive ? 'All' : rec; setActiveFilter(next); setRecFilter(next) }}
              style={{ background: isActive ? m.bg : 'var(--surface)', border: `1px solid ${isActive ? m.border : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', padding: '12px 14px', cursor: 'pointer', textAlign: 'left', outline: 'none', transition: 'all 0.18s', position: 'relative', overflow: 'visible' }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = m.border; e.currentTarget.style.background = m.bg + '55' }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}}
            >
              {isActive && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: m.color }} />}
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: isActive ? m.color : 'var(--text)', lineHeight: 1, marginBottom: 5 }}>{rec_counts[rec] ?? 0}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: isActive ? m.color : 'var(--text-3)', fontWeight: 500 }}>
                <Icon size={11} />{rec}
              </div>
            </button>
          )
        })}
      </div>

      {/* Stage pipeline */}
      <div className="animate-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: '1.25rem',minHeight:100 }}>
        {Object.entries(STAGE_META).map(([key, meta]) => {
          const Icon = meta.icon; const count = stage_counts[key] ?? 0; const isActive = stageFilter === key
          return (
            <button key={key} onClick={() => setStageFilter(isActive ? 'all' : key)}
              style={{ background: isActive ? meta.bg : 'var(--surface)', border: `1px solid ${isActive ? meta.border : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', padding: '10px 12px', cursor: 'pointer', textAlign: 'left', outline: 'none', transition: 'all 0.15s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <Icon size={13} color={isActive ? meta.color : 'var(--text-3)'} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: isActive ? meta.color : 'var(--text)' }}>{count}</span>
              </div>
              <div style={{ fontSize: 14, color: isActive ? meta.color : 'var(--text-3)', fontWeight: 500 }}>{meta.label}</div>
            </button>
          )
        })}
      </div>

      {/* Search + filter bar */}
      <div className="animate-up" style={{
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px 14px',
    marginBottom: '1.25rem',
    position: 'sticky',
    top: 10,
    zIndex: 20,
    minHeight:50,
    backdropFilter: 'blur(6px)'
  }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center',minHeight:50 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, skill, role, location..."
              style={{ ...inputCls, width: '100%', paddingLeft: 32 }}
              onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.4)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
            />
          </div>
          <button onClick={() => setShowFilters(f => !f)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: `1px solid ${showFilters ? 'rgba(201,169,110,0.4)' : 'var(--border-2)'}`, borderRadius: 'var(--radius)', background: showFilters ? 'var(--gold-dim)' : 'var(--bg-3)', fontSize: 13, fontWeight: 500, color: showFilters ? 'var(--gold-light)' : 'var(--text-2)', cursor: 'pointer' }}
          >
            <SlidersHorizontal size={13} /> Filters {hasActiveFilters && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />}
          </button>
          <select
  value={sortBy}
  onChange={e => setSortBy(e.target.value)}
  style={{
    background: 'var(--bg-3)',
    border: '1px solid var(--border-2)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    fontSize: 12,
    padding: '7px 10px'
  }}
>
  <option value="score">Sort by Score</option>
  <option value="experience">Sort by Experience</option>
  <option value="stage">Sort by Stage</option>
  <option value="name">Sort by Name</option>
</select>
          <button onClick={() => setHideDupes(d => !d)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', border: `1px solid ${hideDupes ? 'var(--amber-border)' : 'var(--border-2)'}`, borderRadius: 'var(--radius)', background: hideDupes ? 'var(--amber-bg)' : 'var(--bg-3)', fontSize: 12, color: hideDupes ? 'var(--amber)' : 'var(--text-3)', cursor: 'pointer', fontWeight: hideDupes ? 500 : 400 }}
            title="Hide duplicate resumes"
          >
            <Copy size={12} /> {hideDupes ? 'Showing unique' : 'Hide dupes'}
          </button>
          {hasActiveFilters && (
            <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-3)', cursor: 'pointer', border: 'none', background: 'none', padding: '4px 8px' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }} className="animate-in">
            {[
              { label: 'Min score', val: minScore, set: setMinScore, placeholder: '0' },
              { label: 'Max score', val: maxScore, set: setMaxScore, placeholder: '100' },
              { label: 'Min exp (yrs)', val: minExp, set: setMinExp, placeholder: '0' },
              { label: 'Max exp (yrs)', val: maxExp, set: setMaxExp, placeholder: '20' },
            ].map(({ label, val, set, placeholder }) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{label}</div>
                <input type="number" value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
                  style={{ ...inputCls, width: '100%' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results summary + JD */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }} className="animate-up">
        <div style={{ fontSize: 14, color: 'var(--text-3)' }}>
          Showing <span style={{ color: 'var(--text)', fontWeight: 500 }}>{filtered_count}</span>  of  { total_count} candidates
        </div>
        <div style={{ position: 'relative' }}>
  <button
    onClick={() => setShowJD(v => !v)}
    style={{
      cursor: 'pointer',
      fontSize: 13,
      color: 'var(--text-3)',
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      background: 'none',
      border: 'none'
    }}
  >
    <FileText size={12} /> View job description
  </button>

  {showJD && (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: '120%',
        width: 480,
        padding: '14px',
        background: 'var(--surface-2)',
        border: '1px solid var(--border-2)',
        borderRadius: 'var(--radius-lg)',
        fontSize: 13,
        color: 'var(--text-2)',
        lineHeight: 1.75,
        whiteSpace: 'pre-wrap',
        maxHeight: 250,
        overflowY: 'auto',
        zIndex: 9999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}
    >
      {session.job_description}
    </div>
  )}
</div>
</div>

          <div style={{
  display: 'flex',
  gap: 14,
  marginBottom: '1rem',
  fontSize: 14,
  color: 'var(--text-3)',
  padding: '12px 12px',
  minHeight:50,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)'
}}>
  <span>New: {stage_counts.new || 0}</span>
  <span>Reviewed: {stage_counts.reviewed || 0}</span>
  <span>Shortlisted: {stage_counts.shortlisted || 0}</span>
  <span>Rejected: {stage_counts.rejected || 0}</span>
  <span>Hired: {stage_counts.hired || 0}</span>
</div>
      {/* Candidate cards */}
      {session.candidates.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-3)', marginBottom: 6 }}>No candidates match</div>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: '1rem' }}>Try adjusting your filters or search query</p>
          <button onClick={clearFilters} style={{ padding: '8px 18px', background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 'var(--radius)', color: 'var(--gold)', fontSize: 13, cursor: 'pointer' }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sortedCandidates.map((c, i) => (
            <CandidateCard key={c.id} candidate={c} rank={i} blindMode={blindMode} onStageChange={handleStageChange} />
          ))}
        </div>
      )}
    </div>
  )
}
