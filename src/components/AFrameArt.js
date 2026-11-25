// Real şəkillər yüklənənə qədər istifadə olunan A-frame illüstrasiyası
export default function AFrameArt({ className = '', variant = 'night' }) {
  const sky = variant === 'night' ? ['#16291f', '#3f6b4f'] : ['#dce9df', '#f6e7d6']
  const id = `sky-${variant}`
  return (
    <svg viewBox="0 0 400 260" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill={`url(#${id})`} />
      {/* dağlar */}
      <path d="M0 170 90 70l50 55 60-85 90 110 40-30 70 50v90H0z" fill="#274636" opacity=".85" />
      <path d="m150 70 50-30 24 28-30-8z" fill="#f8f4ee" opacity=".9" />
      <path d="M0 200 70 140l60 40 80-50 90 70 100-40v140H0z" fill="#16291f" />
      {/* A-frame ev */}
      <path d="M200 120 140 230h120z" fill="#b5733a" />
      <path d="M200 120 140 230h12l48-92 48 92h12z" fill="#96592a" />
      <path d="M200 160 178 205h44z" fill="#f6c27a" />
      <rect x="192" y="205" width="16" height="25" fill="#f6c27a" />
      {/* şamlar */}
      {[60, 95, 300, 340].map((x, i) => (
        <path key={x} d={`M${x} ${150 + (i % 2) * 15} l-16 80h32z`} fill="#0e1c15" />
      ))}
      <rect y="228" width="400" height="32" fill="#0e1c15" />
    </svg>
  )
}
