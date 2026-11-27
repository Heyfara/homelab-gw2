import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

const profiles = [
  { slug: 'alice', name: 'Alice' },
  { slug: 'bob', name: 'Bob' },
]

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    if (String(input) === '/api/profiles') return Response.json(profiles)
    return new Response(null, { status: 404 })
  })
})

describe('App', () => {
  it("propose les profils sur l'accueil", async () => {
    render(<App />)

    expect(await screen.findByRole('button', { name: 'Alice' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Bob' })).toBeTruthy()
  })

  it('ouvre le profil choisi et le retient pour la prochaine visite', async () => {
    render(<App />)

    fireEvent.click(await screen.findByRole('button', { name: 'Bob' }))

    expect(window.location.pathname).toBe('/bob')
    expect(await screen.findByRole('heading', { name: /Bob/ })).toBeTruthy()
    expect(localStorage.getItem('gw2.profile')).toBe('bob')
  })

  it('rouvre le dernier profil choisi', async () => {
    localStorage.setItem('gw2.profile', 'alice')

    render(<App />)

    expect(await screen.findByRole('heading', { name: /Alice/ })).toBeTruthy()
    expect(window.location.pathname).toBe('/alice')
  })

  it("signale un profil inconnu et renvoie vers l'accueil", async () => {
    window.history.replaceState(null, '', '/carole')

    render(<App />)

    expect(await screen.findByText(/Profil inconnu/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Choisir un profil/ }))
    expect(window.location.pathname).toBe('/')
  })
})
