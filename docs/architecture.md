# Architecture

- `src/` : API Symfony, servie sous `/api/` par PHP-FPM derrière nginx.
- `assets/` : front React compilé par Vite dans `public/build/` ; nginx renvoie
  toute URL hors `/api/` et `/build/` vers `index.html` (routage côté client).
- `data/` : données publiques versionnées (sources brutes, recettes).
- `var/data/` (à venir) : base SQLite, volume privé en prod, sauvegardé.

## Profils

`GW2_PROFILES` (« slug:Nom » séparés par des virgules) → `App\Profile\Profiles`,
exposés par `GET /api/profiles`. Pas de mot de passe, comme homelab-dashboard.
Le dernier profil choisi est retenu dans le navigateur (`localStorage`).

## Dépendances

| Paquet | Pourquoi |
|---|---|
| symfony/framework-bundle, runtime, dotenv, flex | socle |
| symfony/console | commandes d'import et de synchro (Dagu) |
| symfony/http-client | API GW2 |
| symfony/yaml | `data/recipes.yaml` |
| symfony/options-resolver | validation des entrées |
| phpunit, symfony/browser-kit (dev) | tests unitaires et fonctionnels |
| react, react-dom, vite, tailwindcss, vitest, testing-library | front et ses tests |
