import type { Profile } from '../http/types'

export function ProfilePicker({ profiles, onPick }: { profiles: Profile[]; onPick: (slug: string) => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-4">
      <h1 className="text-center text-2xl font-semibold text-zinc-900 dark:text-slate-100">Forge mystique</h1>
      <ul className="flex flex-col gap-3">
        {profiles.map((p) => (
          <li key={p.slug}>
            <button
              type="button"
              onClick={() => onPick(p.slug)}
              className="w-full rounded-lg bg-white px-4 py-3 text-lg font-medium shadow-sm ring-1 ring-zinc-200 hover:ring-zinc-400 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-slate-600"
            >
              {p.name}
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
