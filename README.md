# A-frame Qusar

Qusarda günlük kirayə evlər və A-frame evlər üçün sayt.
Next.js 16 + Tailwind CSS 4 + Supabase.

## İşə salmaq

```bash
npm install
npm run dev        # http://localhost:3000
```

Supabase qoşulmayıbsa sayt **nümunə evlərlə** işləyir (`src/lib/houses.js`).

## Supabase-i qoşmaq

1. https://supabase.com saytında pulsuz layihə yaradın.
2. **SQL Editor** bölməsində `supabase/schema.sql` faylının hamısını yapışdırıb **Run** basın.
3. `.env.example` faylını `.env.local` adı ilə kopyalayın və **Project Settings → API** bölməsindəki URL və `anon` açarını yazın.
4. **Authentication → Users** bölməsində admin istifadəçi yaradın, sonra SQL Editor-da:
   ```sql
   insert into admins (user_id) values ('<istifadəçinin id-si>');
   ```

## Admin panel

Ünvan: `/admin` (lokalda http://localhost:3000/admin). Supabase qoşulduqdan sonra işləyir.

| Bölmə | Nə edir |
|---|---|
| **Sorğular** | Saytdakı "Onlayn sorğu göndər" formasından gələn sorğular. Təsdiqlənəndə günlər təqvimdə avtomatik dolu olur, ləğv ediləndə boşalır. |
| **Evlər** | Ev əlavə et / redaktə et / sil, "Saytda / Gizli" düyməsi, şəkil yükləmə (avtomatik kiçildilir, WebP), mövsüm qiymətləri. |
| **Təqvim** | Telefonla və ya başqa yerdən gələn rezervləri dolu kimi qeyd etmək. |

Admində edilən dəyişiklik saytda dərhal görünür.

## Struktur

```
src/
  proxy.js                  dil marşrutları: az → /evler, ru → /ru/evler
  app/
    [lang]/layout.js        <html>, şrift, ümumi SEO metadata
    [lang]/(site)/          ictimai sayt (başlıq, alt hissə, WhatsApp)
      page.js               ana səhifə + LodgingBusiness schema
      evler/page.js         evlər siyahısı
      not-found.js          404
    robots.js, sitemap.js   SEO
  components/               Header, Footer, HouseCard, ...
  dictionaries/az.json      Azərbaycan dilində mətnlər
  dictionaries/ru.json      rus dilində mətnlər
  lib/
    site.js                 telefon, WhatsApp, ünvan (TODO: real məlumat)
    houses.js               evləri Supabase-dən oxuyur
    i18n.js                 dil köməkçiləri
    supabase/               Supabase klientləri
supabase/schema.sql         verilənlər bazası + təhlükəsizlik qaydaları
```

## Qeydlər

- Next.js 16-da `middleware.js` artıq `proxy.js` adlanır.
- Next.js 16.4-də `notFound()` çağırılanda 404 səhifəsi serverdə "error shell" kimi göndərilir və məzmunu brauzerdə çəkilir. Status (404) və `noindex` düzgündür, SEO-ya təsiri yoxdur. Minimal layihədə də təkrarlanır, yəni framework davranışıdır.
