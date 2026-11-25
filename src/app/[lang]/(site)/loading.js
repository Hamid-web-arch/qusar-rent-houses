// Səhifə dəyişəndə dərhal göstərilir: başlıq və alt hissə yerində qalır, məzmun yüklənir
export default function Loading() {
  return (
    <div className="container-page animate-pulse pt-10 sm:pt-14" aria-busy="true">
      <div className="h-9 w-72 max-w-full rounded-lg bg-pine-100" />
      <div className="mt-3 h-4 w-96 max-w-full rounded bg-pine-100/70" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-[4/5] rounded-card bg-white ring-1 ring-pine-100" />
        ))}
      </div>
    </div>
  )
}
