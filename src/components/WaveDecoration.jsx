export default function WaveDecoration({ color = '#059669', className = '' }) {
  return (
    <svg
      viewBox="0 0 200 60"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M60 60 C75 40 90 46 105 34 C120 22 140 30 155 18 C170 8 185 14 205 4 L205 60 Z"
        fill={color}
        fillOpacity={0.4}
        stroke="none"
      />
    </svg>
  )
}
