import { notFound } from 'next/navigation'

// Mövcud olmayan bütün yollar: saytın öz dizaynında 404 göstərilsin
export default function CatchAll() {
  notFound()
}
