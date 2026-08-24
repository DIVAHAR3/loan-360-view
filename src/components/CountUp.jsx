import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'

export default function CountUp({ value, format, duration = 0.6, className }) {
  const [display, setDisplay] = useState(0)
  const prevValue = useRef(0)

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(latest),
    })
    prevValue.current = value
    return () => controls.stop()
  }, [value, duration])

  return <span className={className}>{format ? format(display) : Math.round(display)}</span>
}
