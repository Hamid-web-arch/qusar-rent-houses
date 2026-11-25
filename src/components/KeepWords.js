// "A-frame" kimi defisli sözlərin sətir sonunda "A-" / "frame" kimi bölünməsinin qarşısını alır.
// Mətnin özü dəyişmir (Google üçün "A-frame" olduğu kimi qalır), sadəcə söz <span nowrap>-a salınır.
const PATTERN = /(A-frame)/gi

export default function KeepWords({ children }) {
  if (typeof children !== 'string') return children
  return children.split(PATTERN).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="whitespace-nowrap">{part}</span>
    ) : (
      part
    ),
  )
}
