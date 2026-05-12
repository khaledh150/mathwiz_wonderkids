import canvasConfetti from 'canvas-confetti'

export function fireConfetti() {
  canvasConfetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FF6B9D', '#4ECDC4', '#FFE66D', '#A78BFA', '#FB923C', '#34D399'],
  })
}

export function fireConfettiBurst() {
  const duration = 1500
  const end = Date.now() + duration

  function frame() {
    canvasConfetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FF6B9D', '#4ECDC4', '#FFE66D'],
    })
    canvasConfetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#A78BFA', '#FB923C', '#34D399'],
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}
