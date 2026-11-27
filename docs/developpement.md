# Développement

Prérequis : Docker et `make`.

```bash
make install   # dépendances PHP et npm
make up        # front sur http://localhost:5174, API via nginx sur :8081
make test      # PHP + front
make lint
```

Les ports (8081, 5174) sont décalés par rapport à homelab-dashboard pour que les
deux tournent ensemble.

Profils de dev : `GW2_PROFILES` dans `.env` (`alice`, `bob`). Pour en changer
sans toucher au dépôt : `.env.local` (non versionné).
