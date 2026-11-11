import { useEffect, useRef, type ReactNode } from 'react'

import { subscribeTilt } from '../lib/screenTilt'

/**
 * Leans its children with the screen: the phone's tilt on touch, the cursor on
 * desktop. The offset is written straight to the DOM inside the shared tilt
 * loop, so a whole grid of cards follows the sensor without re-rendering React
 * on every frame.
 */
export function TiltDeck({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    return subscribeTilt(({ x, y }) => {
      element.style.transform = `perspective(1400px) rotateY(${(x * 7).toFixed(2)}deg) rotateX(${(-y * 5).toFixed(2)}deg) translate3d(${(-x * 16).toFixed(2)}px, ${(y * 12).toFixed(2)}px, 0)`
    })
  }, [])

  return (
    <div ref={ref} className={className} style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>
      {children}
    </div>
  )
}
