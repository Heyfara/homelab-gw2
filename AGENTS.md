# AGENTS.md

gw2.home : rentabilité des promotions de matériaux GW2. API Symfony 8
(PHP 8.5, PHP-FPM) + front React/Vite/Tailwind v4 dans `assets/`. La
référence fonctionnelle est `docs/spec.md` : la lire avant toute fonctionnalité,
la mettre à jour dans la même PR si une décision change.

## Règles du projet

- **TDD** : écrire d'abord le test qui échoue, puis le code. Un correctif de bug
  commence par un test qui reproduit le bug. Pas de PR sans test.
- **Dépendances au strict nécessaire** : composants Symfony de base, PDO SQLite
  natif, pas d'ORM ni de bundle tiers. Toute nouvelle dépendance se justifie
  dans la PR et dans `docs/architecture.md`.
- **Aucune donnée personnelle dans le dépôt** : l'image est publique. Profils,
  secrets et base SQLite viennent du rôle Ansible `service-gw2`. Fixtures et
  exemples fictifs (`alice`, `bob`). Les CSV de `data/sources/` sont anonymisés.
- **Montants en cuivres entiers** (`int`), jamais de flottants pour l'argent.
- **Versions épinglées** (`.npmrc` save-exact, tags d'images exacts) : Renovate
  les met à jour.
- **Textes en français** (messages d'erreur, interface, commentaires, docs).

## Commandes

Tout passe par Docker (`make help`), mise en route dans `docs/developpement.md`.

```bash
make test-php ARGS="--filter Profiles"
make test-front ARGS="App"
make lint
docker compose run --rm gw2 bin/console debug:router
```

## Conventions

- Attributs PHP pour le framework (`#[Route]`, `#[AsCommand]`, `#[Autowire]`),
  autowiring partout.
- Contrôleurs minces : un `__invoke`, la logique dans `src/`.
- Objets du modèle et résultats en `final readonly`.
- Les types de `assets/http/types.ts` reflètent les tableaux renvoyés par les
  contrôleurs : modifier les deux ensemble.
- Aucun test ne sort sur le réseau (API GW2 simulée, `fetch` simulé en vitest).
- Style PHP : `@Symfony` (suivre le style existant).

## Découvrir plutôt que deviner

`bin/console about`, `debug:router`, `debug:container`, `debug:autowiring`, et
les sources dans `vendor/`. Les API de Symfony 8, React 19, Vite 8, Vitest 5 et
TypeScript 7 ont pu changer depuis tes connaissances.
