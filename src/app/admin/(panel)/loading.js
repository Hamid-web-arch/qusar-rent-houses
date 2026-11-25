// Admin səhifəsi açılarkən dərhal göstərilir (məlumat Supabase-dən gələnə qədər)
export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse" aria-busy="true" aria-label="Yüklənir">
      <div className="h-7 w-56 rounded-lg bg-pine-100" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-pine-100/70" />
      <div className="mt-8 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-card bg-white ring-1 ring-pine-100" />
        ))}
      </div>
    </div>
  )
}
