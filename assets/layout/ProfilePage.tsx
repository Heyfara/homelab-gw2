import type { Profile } from '../http/types'

/** Accueil d'un profil : « Mon stock » (à venir). */
export function ProfilePage({ profile, onChangeProfile }: { profile: Profile; onChangeProfile: () => void }) {
  return (
    <main className="mx-auto max-w-5xl p-4">
      <header className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-slate-100">Mon stock — {profile.name}</h1>
        <button type="button" onClick={onChangeProfile} className="text-sm underline">
          Changer de profil
        </button>
      </header>
      <p>Rien à afficher pour l'instant.</p>
    </main>
  )
}
