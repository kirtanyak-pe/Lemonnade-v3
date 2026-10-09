import { useEffect, useState, type CSSProperties } from 'react'
import { LemonnMark } from '../components/BrandLogo/BrandArt'
import styles from './Splash.module.css'

// Site intro, like the app's splash screen: the lemon builds up slice by slice, its leaves spring up, "Lemonnade"
// slides in letter by letter, then the screen lifts away. Plays once per browser session; add ?intro to the URL to
// see it again. Any tap or key skips it. Skipped entirely for people who prefer reduced motion.

const SEEN_KEY = 'l3-intro-seen'
const WORD = 'Lemonnade'

function shouldPlay() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (/[?&]intro\b/.test(window.location.search + window.location.hash)) return true
  try {
    return !window.sessionStorage.getItem(SEEN_KEY)
  } catch {
    return true
  }
}

export function Splash() {
  const [state, setState] = useState<'playing' | 'leaving' | 'done'>(() => (shouldPlay() ? 'playing' : 'done'))

  useEffect(() => {
    if (state === 'done') return
    try {
      window.sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* storage blocked: it just plays again next time */
    }
    const skip = () => setState((s) => (s === 'playing' ? 'leaving' : s))
    const overflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      document.documentElement.style.overflow = overflow
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [state === 'done'])

  if (state === 'done') return null
  return (
    <div
      className={styles.splash}
      data-state={state}
      aria-hidden="true"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) setState('done')
      }}
    >
      <div className={styles.lockup}>
        <svg className={styles.mark} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <LemonnMark />
        </svg>
        <span className={styles.wordClip}>
          <span className={styles.word}>
            {[...WORD].map((ch, i) => (
              <span key={i} className={styles.letter} style={{ '--i': i } as CSSProperties}>
                {ch}
              </span>
            ))}
          </span>
        </span>
      </div>
    </div>
  )
}
