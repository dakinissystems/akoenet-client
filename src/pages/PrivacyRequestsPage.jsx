/**
 * Formulario público RGPD — canal «Privacy Requests» (sin DPO designado).
 *
 * Rutas UI: /legal/privacy-requests (EN), /legal/privacidad-solicitudes (ES).
 * Legacy /legal/dpo redirige. API: POST /dpo/message (alias /privacy-requests/message).
 */
import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import SiteFooter from '../components/SiteFooter'
import { useLandingLocale } from '../hooks/useLandingLocale'

const REQUEST_TYPES = [
  { value: 'general', labelEn: 'General privacy question', labelEs: 'Consulta general de privacidad' },
  { value: 'access', labelEn: 'Access (copy of data)', labelEs: 'Acceso (copia de datos)' },
  { value: 'rectification', labelEn: 'Rectification', labelEs: 'Rectificación' },
  { value: 'erasure', labelEn: 'Erasure', labelEs: 'Supresión' },
  { value: 'portability', labelEn: 'Portability / export', labelEs: 'Portabilidad / exportación' },
  { value: 'objection', labelEn: 'Objection', labelEs: 'Oposición' },
  { value: 'restriction', labelEn: 'Restriction', labelEs: 'Limitación' },
]

export default function PrivacyRequestsPage() {
  const { locale } = useLandingLocale()
  const location = useLocation()
  const es = locale === 'es'
  const [contact, setContact] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    request_type: 'general',
  })
  const [sent, setSent] = useState(false)
  const [refId, setRefId] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/dpo/contact')
        if (!cancelled) setContact(data)
      } catch {
        if (!cancelled) {
          setLoadError(es ? 'No se pudieron cargar los datos de contacto.' : 'Could not load contact details.')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [es])

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post('/dpo/message', {
        ...form,
        subject: form.subject.trim() || null,
      })
      setRefId(data.reference_id)
      setSent(true)
    } catch (err) {
      const d = err.response?.data
      const msg =
        d?.details?.map((x) => x.message).join(' ') ||
        d?.message ||
        d?.error ||
        (es ? 'No se pudo enviar el mensaje.' : 'Could not send your message.')
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  if (location.pathname === '/legal/dpo') {
    return <Navigate to={es ? '/legal/privacidad-solicitudes' : '/legal/privacy-requests'} replace />
  }

  if (sent) {
    return (
      <div className="auth-page legal-form-page">
        <div className="auth-card legal-form-card">
          <h1>{es ? 'Solicitud enviada' : 'Request sent'}</h1>
          <p className="muted">
            {es ? 'Referencia:' : 'Reference id:'} <strong>{refId}</strong>
          </p>
          <p className="muted small">
            {es
              ? 'Si debemos responder, usaremos el email indicado. Conserva esta referencia.'
              : 'If a reply is required, we will use the email address you provided. Keep this reference for follow-up.'}
          </p>
          <Link to="/" className="btn primary">
            {es ? 'Inicio' : 'Home'}
          </Link>
        </div>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="auth-page legal-form-page">
      <div className="auth-card legal-form-card">
        <p className="muted small" style={{ marginBottom: '0.75rem' }}>
          <Link to="/">{es ? '← Inicio' : '← Home'}</Link>
        </p>
        <h1>{es ? 'Solicitudes de privacidad' : 'Privacy Requests'}</h1>
        <p className="muted small">
          {es
            ? 'Canal para ejercer derechos RGPD y consultas de privacidad. Operador: Christian David Villar Colodro (Dakinis Systems). Tus datos se usan solo para gestionar la solicitud.'
            : 'Channel to exercise GDPR rights and privacy inquiries. Operator: Christian David Villar Colodro (Dakinis Systems). Your data is used only to handle this request.'}
        </p>

        {loadError && <div className="error-banner inline">{loadError}</div>}

        {contact && (
          <section className="legal-dpo-contact" aria-label="Published contact">
            {contact.email ? (
              <p>
                Email:{' '}
                <a href={`mailto:${contact.email}`} className="link-inline">
                  {contact.email}
                </a>
              </p>
            ) : null}
            {contact.note ? <p className="muted small">{contact.note}</p> : null}
          </section>
        )}

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={onSubmit} className="form-stack legal-form-stack">
          <label>
            {es ? 'Tu nombre *' : 'Your name *'}
            <input
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              required
              minLength={2}
              autoComplete="name"
            />
          </label>
          <label>
            {es ? 'Tu email *' : 'Your email *'}
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            {es ? 'Asunto (opcional)' : 'Subject (optional)'}
            <input value={form.subject} onChange={(e) => setField('subject', e.target.value)} maxLength={500} />
          </label>
          <label>
            {es ? 'Tipo de solicitud' : 'Type of request'}
            <select value={form.request_type} onChange={(e) => setField('request_type', e.target.value)}>
              {REQUEST_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {es ? o.labelEs : o.labelEn}
                </option>
              ))}
            </select>
          </label>
          <label>
            {es ? 'Mensaje *' : 'Message *'}
            <textarea
              value={form.message}
              onChange={(e) => setField('message', e.target.value)}
              required
              rows={6}
              minLength={10}
            />
          </label>
          <button type="submit" className="btn primary" disabled={busy}>
            {busy ? (es ? 'Enviando…' : 'Sending…') : es ? 'Enviar solicitud' : 'Send request'}
          </button>
        </form>
      </div>
      <SiteFooter />
    </div>
  )
}
