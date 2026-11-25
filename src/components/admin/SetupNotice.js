// Supabase açarları .env.local-da yoxdursa göstərilir
export default function SetupNotice() {
  return (
    <div className="rounded-card bg-white p-6 text-sm leading-relaxed shadow-sm ring-1 ring-pine-100">
      <p className="text-base font-bold text-pine-900">Supabase hələ qoşulmayıb</p>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted">
        <li>supabase.com-da layihə yaradın (region: Frankfurt).</li>
        <li><b>SQL Editor</b>-da <code>supabase/schema.sql</code> faylını işə salın.</li>
        <li>
          <code>.env.example</code> faylını <code>.env.local</code> adı ilə kopyalayın, <b>Project Settings → API</b>-dəki URL və
          anon açarını yazın.
        </li>
        <li><b>Authentication → Users</b>-da istifadəçi yaradın və onun id-sini <code>admins</code> cədvəlinə əlavə edin.</li>
        <li>Serveri yenidən başladın (<code>npm run dev</code>).</li>
      </ol>
    </div>
  )
}
