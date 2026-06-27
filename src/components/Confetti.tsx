'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export function Confetti({ trigger }: { trigger: boolean }) {
  useEffect(() => {
    if (!trigger) return

    const end = Date.now() + 1500
    const colors = ['#00e5ff', '#00ff88', '#ffffff']

    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors })
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors })
      if (Date.now() < end) requestAnimationFrame(frame)
    }

    frame()
  }, [trigger])

  return null
}
