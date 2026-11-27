import { useEffect } from 'react'
import { usePath } from './hooks/usePath'
import { useProfiles } from './hooks/useProfiles'
import { ProfilePage } from './layout/ProfilePage'
import { ProfilePicker } from './layout/ProfilePicker'

const STORAGE_KEY = 'gw2.profile'

// Le stockage peut être indisponible (navigation privée) : on s'en passe.
const remembered = {
  get: () => {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  },
  set: (slug: string | null) => {
    try {
      if (slug) localStorage.setItem(STORAGE_KEY, slug)
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* rien */
    }
  },
}

/** Écrans : / (choix du profil) et /:profil (son stock). */
export function App() {
  const [path, navigate] = usePath()
  const { profiles, error } = useProfiles()
  const [slug = null] = path.split('/').filter(Boolean)

  useEffect(() => {
    const last = remembered.get()
    if (!slug && last) navigate(`/${last}`, { replace: true })
  }, [slug, navigate])

  if (error) return <p className="p-4">Impossible de charger les profils.</p>
  if (!profiles) return null

  const toPicker = () => {
    remembered.set(null)
    navigate('/')
  }

  if (!slug) {
    return (
      <ProfilePicker
        profiles={profiles}
        onPick={(picked) => {
          remembered.set(picked)
          navigate(`/${picked}`)
        }}
      />
    )
  }

  const profile = profiles.find((p) => p.slug === slug)
  if (!profile) {
    return (
      <main className="mx-auto max-w-md p-4">
        <p>Profil inconnu : {slug}.</p>
        <button type="button" onClick={toPicker} className="mt-2 underline">
          Choisir un profil
        </button>
      </main>
    )
  }

  return <ProfilePage profile={profile} onChangeProfile={toPicker} />
}
