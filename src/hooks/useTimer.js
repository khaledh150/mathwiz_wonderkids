import { useState, useRef, useCallback, useEffect } from 'react'

export function useTimer(totalSeconds, onTimeUp) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)
  const onTimeUpRef = useRef(onTimeUp)

  onTimeUpRef.current = onTimeUp

  const start = useCallback(() => {
    startTimeRef.current = Date.now()
    setIsRunning(true)
  }, [])

  const stop = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const getElapsedSeconds = useCallback(() => {
    if (!startTimeRef.current) return 0
    return Math.floor((Date.now() - startTimeRef.current) / 1000)
  }, [])

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      const elapsed = getElapsedSeconds()
      const remaining = Math.max(0, totalSeconds - elapsed)
      setTimeLeft(remaining)

      if (remaining <= 0) {
        stop()
        onTimeUpRef.current?.()
      }
    }, 250)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, totalSeconds, getElapsedSeconds, stop])

  return { timeLeft, isRunning, start, stop, getElapsedSeconds }
}
