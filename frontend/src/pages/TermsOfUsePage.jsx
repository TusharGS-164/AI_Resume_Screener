import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using HireSense ("the Service"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Service. These terms apply to all users, including recruiters, hiring managers, and administrators.',
  },
  {
    title: '2. Description of Service',
    body: 'HireSense is an AI-powered resume screening platform that uses Google Gemini to analyze uploaded resumes against job descriptions. The Service provides candidate ranking, skill matching, duplicate detection, bias-reduction features, and hiring pipeline management tools.',
  },
  {
    title: '3. User Accounts',
    items: [
      'You must provide accurate and complete information when registering.',
      'You are responsible for maintaining the security of your account credentials.',
      'You must notify us immediately of any unauthorized use of your account.',
      'One account per user. You may not share credentials with others.',
      'The first registered user is granted administrator access. Admins are responsible for the platform\'s use within their organization.',
    ],
  },
  {
    title: '4. Acceptable Use',
    body: 'You agree to use the Service only for lawful recruitment and hiring purposes. You must not:',
    items: [
      'Upload resumes without appropriate consent from the candidates.',
      'Use the Service to discriminate against candidates based on protected characteristics.',
      'Attempt to reverse-engineer, hack, or disrupt the Service.',
      'Upload malicious files, malware, or content intended to harm the system.',
      'Use AI-generated scores as the sole basis for hiring decisions without human review.',
      'Resell or sublicense access to the Service to third parties.',
    ],
  },
  {
    title: '5. AI-Generated Results',
    body: 'AI screening results, scores, and recommendations are provided as decision-support tools only. You acknowledge that:',
    items: [
      'AI scores are not guaranteed to be accurate or free from error.',
      'All hiring decisions must involve human judgment and review.',
      'HireSense is not responsible for hiring decisions made based on AI outputs.',
      'Blind mode reduces but does not eliminate all forms of bias.',
      'You are solely responsible for ensuring your use of AI screening complies with applicable employment law.',
    ],
  },
  {
    title: '6. Candidate Data & Compliance',
    body: 'You are responsible for ensuring that your use of HireSense complies with applicable data protection laws (including GDPR, CCPA, and local employment regulations). This includes:',
    items: [
      'Obtaining necessary consent from candidates before uploading their resumes.',
      'Informing candidates if AI tools are being used in your screening process, where required by law.',
      'Honoring candidate requests to access or delete their data.',
      'Not retaining candidate data longer than necessary for your recruitment process.',
    ],
  },
  {
    title: '7. Intellectual Property',
    body: 'All software, UI, logos, and content within HireSense are the property of HireSense and its developers. You may not copy, modify, distribute, or create derivative works without express written permission. Resume content uploaded by users remains the intellectual property of the respective candidates.',
  },
  {
    title: '8. Limitation of Liability',
    body: 'To the maximum extent permitted by law, HireSense and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to: hiring decisions, loss of business, data loss, or unauthorized access to your account.',
  },
  {
    title: '9. Disclaimer of Warranties',
    body: 'The Service is provided "as is" without warranty of any kind. We do not warrant that the Service will be uninterrupted, error-free, or that AI analysis will be accurate for all resumes. Use the Service at your own discretion.',
  },
  {
    title: '10. Modifications to Terms',
    body: 'We reserve the right to update these Terms of Use at any time. Continued use of the Service after changes are posted constitutes your acceptance of the updated terms. We will make reasonable efforts to notify users of significant changes.',
  },
  {
    title: '11. Governing Law',
    body: 'These terms are governed by applicable law. Any disputes arising from the use of this Service shall be resolved through good-faith negotiation before resorting to formal legal proceedings.',
  },
  {
    title: '12. Contact',
    body: 'For questions regarding these Terms of Use, please contact us at legal@hiresense.com.',
  },
]

export default function TermsOfUsePage() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 820, margin: '0 auto' }}>
      <div className="anim-up" style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--blue)', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, marginBottom: 14, padding: 0 }}>
          <ArrowLeft size={14} />Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, background: 'var(--blue-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--blue-mid)' }}>
            <FileText size={22} color="var(--blue)" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Terms of Use</h1>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Warning card */}
      <div className="anim-up" style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: 14, color: 'var(--amber)', lineHeight: 1.7, fontWeight: 500 }}>
          Please read these terms carefully before using HireSense. By using this platform you agree to these terms. AI screening results are decision-support tools — all final hiring decisions must involve human review.
        </p>
      </div>

      <div style={{ background: '#f', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem 2.5rem', boxShadow: 'var(--shadow-sm)' }} className="anim-up">
        {sections.map((section, si) => (
          <div key={si} style={{ marginBottom: si < sections.length - 1 ? '2rem' : 0 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>{section.title}</h2>
            {section.body && <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: section.items ? 10 : 0 }}>{section.body}</p>}
            {section.items && (
              <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {section.items.map((item, ii) => (
                  <li key={ii} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65 }}>
                    <span style={{ color: 'var(--blue)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>•</span>{item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
