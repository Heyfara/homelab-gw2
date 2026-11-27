import { useEffect, useState } from 'react'
import type { Profile } from '../http/types'

/** Profils configurés ; null tant qu'ils ne sont pas chargés. */
export function useProfiles(): { profiles: Profile[] | null; error: boolean } {
  const [profiles, setProfiles] = useState<Profile[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/profiles')
      .then((r) => (r.ok ? (r.json() as Promise<Profile[]>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => !cancelled && setProfiles(data))
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [])

  return { profiles, error }
}
