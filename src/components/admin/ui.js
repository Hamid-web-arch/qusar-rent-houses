// Admin paneldə təkrarlanan kiçik UI parçaları
export const inputCls =
  'w-full rounded-lg border border-pine-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-wood-500 focus:ring-2 focus:ring-wood-500/20'

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold text-pine-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export function Card({ title, actions, children, className = '' }) {
  return (
    <section className={`rounded-card bg-white p-5 shadow-sm ring-1 ring-pine-100 sm:p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="text-lg font-bold text-pine-900">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export function Notice({ state }) {
  if (!state) return null
  if (state.error) return <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
  if (state.ok && typeof state.ok === 'string') return <p role="status" className="rounded-lg bg-pine-50 px-3 py-2 text-sm text-pine-700">{state.ok}</p>
  return null
}

// "2026-12-05" → "05.12.2026"
export function fmtDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}.${m}.${y}`
}
