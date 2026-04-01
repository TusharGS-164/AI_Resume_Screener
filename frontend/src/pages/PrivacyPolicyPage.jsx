import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

const sections = [
  {
    title: '1. Information We Collect',
    content: [
      {
        sub: 'Account information',
        body: 'When you register, we collect your full name, email address, and a hashed password. We never store passwords in plain text.',
      },
      {
        sub: 'Resume data',
        body: 'Resumes you upload are temporarily stored on the server to enable AI analysis. Resume content is sent to Google Gemini AI for processing and is not used to train AI models. Extracted candidate data (name, skills, scores, etc.) is stored in the application database linked to your screening session.',
      },
      {
        sub: 'Usage data',
        body: 'We store screening sessions, candidate records, recruiter notes, and pipeline stage changes you make within the application. This data is tied to your user account.',
      },
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      { sub: 'Providing the service',        body: 'Your data is used solely to operate HireSense — to run AI screenings, display results, and enable your hiring pipeline management.' },
      { sub: 'Improving accuracy',           body: 'Aggregate, anonymized statistics (e.g. average scores, session counts) may be used to monitor system performance. Individual resume content is never used for model training.' },
      { sub: 'No advertising',               body: 'We do not sell your data to third parties. We do not use your data to serve advertisements.' },
    ],
  },
  {
    title: '3. Data Sharing',
    content: [
      { sub: 'Google Gemini AI',             body: 'Resume text is sent to Google\'s Gemini API for analysis. This is subject to Google\'s AI usage policies. Resume text is processed transiently and is not retained by Google for training purposes under standard API terms.' },
      { sub: 'No other third-party sharing', body: 'We do not share your data with any other third parties, advertisers, or data brokers.' },
      { sub: 'Legal requirements',           body: 'We may disclose data if required by law, court order, or government regulation.' },
    ],
  },
  {
    title: '4. Data Retention',
    content: [
      { sub: 'Session data',    body: 'Screening sessions and candidate data are retained until you explicitly delete them from your dashboard. Deleted sessions are permanently removed from the database.' },
      { sub: 'Uploaded files',  body: 'Resume files uploaded to the server are stored in the uploads directory. You are responsible for managing your server storage. Files are not automatically deleted after processing.' },
      { sub: 'Account data',    body: 'Your account data is retained while your account is active. Contact us to request account deletion.' },
    ],
  },
  {
    title: '5. Security',
    content: [
      { sub: 'Password hashing',         body: 'All passwords are hashed using bcrypt before storage. Plain text passwords are never stored.' },
      { sub: 'JWT authentication',       body: 'Sessions are secured using JSON Web Tokens (JWT) with a configurable expiry. Tokens are signed with a server-side secret key.' },
      { sub: 'Data transmission',        body: 'We recommend deploying HireSense over HTTPS in production to encrypt data in transit.' },
    ],
  },
  {
    title: '6. Your Rights',
    content: [
      { sub: 'Access',    body: 'You can access all your screening data through the application dashboard at any time.' },
      { sub: 'Deletion',  body: 'You can delete any screening session and all associated candidate data directly from the dashboard. To delete your account, contact us at the email below.' },
      { sub: 'Portability', body: 'You can export your screening results as CSV or PDF reports at any time.' },
    ],
  },
  {
    title: '7. Cookies',
    content: [
      { sub: 'Authentication token', body: 'HireSense stores your authentication token in your browser\'s localStorage to keep you logged in. No tracking or advertising cookies are used.' },
    ],
  },
  {
    title: '8. Changes to This Policy',
    content: [
      { sub: '', body: 'We may update this privacy policy from time to time. Significant changes will be communicated via email or an in-app notice. Continued use of HireSense after changes constitutes acceptance of the updated policy.' },
    ],
  },
  {
    title: '9. Contact',
    content: [
      { sub: '', body: 'For privacy-related questions, data deletion requests, or concerns, contact us at privacy@hiresense.com.' },
    ],
  },
]

export default function PrivacyPolicyPage() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 820, margin: '0 auto' }}>
      <div className="anim-up" style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--blue)', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, marginBottom: 14, padding: 0 }}>
          <ArrowLeft size={14} />Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, background: 'var(--green-bg)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--green-border)' }}>
            <Shield size={22} color="var(--green)" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Privacy Policy</h1>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Intro card */}
      <div className="anim-up" style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: 14, color: 'var(--green)', lineHeight: 1.7, fontWeight: 500 }}>
          HireSense is committed to protecting your privacy. This policy explains what data we collect, how we use it, and what controls you have over it. We do not sell your data or use it for advertising.
        </p>
      </div>

      <div style={{ background: '#f', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem 2.5rem', boxShadow: 'var(--shadow-sm)' }} className="anim-up">
        {sections.map((section, si) => (
          <div key={si} style={{ marginBottom: si < sections.length - 1 ? '2rem' : 0 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>{section.title}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {section.content.map((block, bi) => (
                <div key={bi}>
                  {block.sub && <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>{block.sub}</div>}
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75 }}>{block.body}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
