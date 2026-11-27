# gw2.home — rentabilité des promotions de matériaux

Spec v1, rédigée le 2026-11-27.

## 1. But

Répondre à une question : *« J'ai N exemplaires d'un matériau. Vaut-il mieux le vendre, le promouvoir au palier suivant, ou enchaîner deux promotions ? »*
La réponse s'appuie sur mon stock réel, les prix actuels du comptoir (taxes déduites) et des rendements mesurés, que mes propres saisies affinent.

## 2. Périmètre

**v1**
- Promotions à la Forge mystique des matériaux de base (T1→T6), de leurs versions raffinées et des matériaux fins : 16 familles, environ 80 recettes, variantes du minerai de platine et du lingot de mithril comprises.
- Stock lu par l'API : stockage de matériaux, banque, sacs des persos, livraison au comptoir.
- Quantités modifiables à la main (simulation).
- Saisie des rendements obtenus.
- Profils Julien et Estelle, une clé GW2 chacun.
- Endpoint JSON pour une carte du dashboard.
- Relevé de l'historique réel des ventes au comptoir (§ 9).

**Plus tard**
- Magnétites (cristal mystique, vin, agent liant) et matériaux élevés.
- Historique des prix (job Dagu) pour répondre à « attendre ».
- Écrans de statistiques (les données sont collectées dès la v1).
- Valeur des éclats d'esprit tirée de fast.farming-community.eu.

## 3. Sources de données

| Donnée | Source | Rafraîchissement |
|---|---|---|
| Recettes | Page wiki « Mystic Forge/Material Promotion », oldid 3203734, relevée le 2026-11-27 | Statique, fichier versionné |
| Identifiants et noms FR des objets | `/v2/items?ids=…&lang=fr`, résolus une fois depuis les noms anglais | Commande d'import |
| Prix | `/v2/commerce/prices` (meilleur ordre d'achat / meilleure offre de vente) | Cache 5 min |
| Profondeur du carnet | `/v2/commerce/listings` | Cache 5 min |
| Stock | `/v2/account/materials`, `/v2/account/bank`, `/v2/characters?ids=all` (sacs), `/v2/commerce/delivery` | À l'ouverture + bouton |
| Éclats d'esprit | `/v2/account/wallet` (affichage) | Idem |
| Rendements initiaux | Tableur de Silveress (2014), onglets Common et Fine exportés en CSV | Import unique, `source = silveress-2014` |

**Droits de clé requis :** `account`, `inventories`, `characters`, `wallet`, `tradingpost`.

### Ce que disent les données de Silveress

| Groupe | n | min | p10 | médiane | p90 | max | moyenne |
|---|---|---|---|---|---|---|---|
| Fin T1→T2 | 90 | 8 | 10 | 15 | 32 | 40 | 18,7 |
| Fin T3→T4 | 48 | 8 | 10 | 15 | 31 | 37 | 18,7 |
| Fin T5→T6 | 60 | 5 | — | — | — | 11 | 6,8 |
| Base/raffiné T1→T5 | 612 | 40 | 49 | 75 | 138 | 200 | 86,6 |

À retenir :
- **La médiane est nettement plus basse que la moyenne.** Sur une seule promotion, on obtient le plus souvent *moins* que la moyenne. Ce n'est qu'en cumulant beaucoup de promotions que le total se rapproche de la moyenne. L'appli doit le montrer, pas seulement afficher la moyenne.
- Le « (xN) » du wiki est le minimum garanti.
- Pas de mesure pour les fins T2→T3 et T4→T5 ; le palier des matériaux de base est souvent mal saisi. On regroupe donc par **catégorie** (base/raffiné ou fin) et par **groupe de paliers** (T1–T4, T5), comme le wiki.
- Une vingtaine de réponses du CSV Common sont sous 40 (saisie de T5 ou erreur) : elles seront écartées ou rangées en T5 à l'import, après vérification ligne par ligne.
- Les CSV sont versionnés anonymisés : pseudos et commentaires libres vidés (dépôt public). Le CSV Common contient un second bloc à droite (colonnes 23 à 32, ~100 réponses « Green Wood Plank » du 05-06/07/2014), à lire aussi à l'import.

## 4. Calcul

### Prix

Pour un objet : `b` = meilleur ordre d'achat, `a` = meilleure offre de vente.

| Mode | Je vends à | J'achète à |
|---|---|---|
| **Immédiat** | `net(b)` | `a` |
| **Patient** (ordres) | `net(a − 1)` | `b + 1` |

avec `net(p) = p − frais_annonce(p) − frais_change(p)`.

Taxes : toute vente paie 5 % de frais d'annonce + 10 % de frais de change, y compris la vente immédiate à un ordre d'achat. L'achat n'est pas taxé.
Relevé en jeu le 2026-11-27 : objet à 130 c → annonce 7 c + change 13 c, net 110 c. Les montants sont toujours des cuivres entiers (affichés « X or Y a Z c », 1 a = 100 c, 1 or = 100 a). **Arrondi (tranché le 2026-11-27)** : chaque frais est calculé séparément, arrondi au plus proche (0,5 → vers le haut), avec un minimum de 1 c. Exemples pour les tests unitaires : 2 c → 1 + 1, net 0 ; 3 c → 1 + 1, net 1 ; 10 c → 1 (0,5) + 1, net 8 ; 14 c → 1 (0,7) + 1 (1,4), net 12 ; 104 c → 5 (5,2) + 10, net 89 ; 130 c → 7 (6,5) + 13, net 110. Sur les objets bon marché, le taux réel dépasse donc nettement 15 %. Calcul fait par objet unitaire, puis multiplié.

Les deux modes sont affichés côte à côte.

**Profondeur du carnet :** vendre 400 exemplaires vide les premiers ordres d'achat. Le produit de vente est calculé en descendant le carnet (`/v2/commerce/listings`), pas en multipliant par le meilleur prix. Même chose pour les achats.

### Valeur des ingrédients

- **Ce que je possède** vaut ce que j'en tirerais en le vendant (coût d'opportunité), pas zéro.
- **Ce qui me manque** coûte son prix d'achat.
- **Pierres philosophales :** valeur réglable par profil, 0 par défaut (éclats quasi gratuits). L'appli affiche le nombre de pierres nécessaires et le compare aux éclats du portefeuille (1 éclat = 10 pierres).

### Rendement

Pour une recette, on prend les observations de la recette elle-même si elle en a au moins 30, sinon celles de son groupe (catégorie × groupe de paliers).
Pour `k` promotions, l'appli **simule** 5 000 tirages de `k` rendements dans ces observations et en tire le total : p10, médiane, p90 et minimum garanti (`k × min`). C'est simple, et ça montre que le hasard compte moins quand on fait beaucoup de promotions.

### Options comparées pour un matériau en stock

Pour un matériau Tn possédé en quantité N :

1. **Vendre** les N.
2. **Promouvoir** `k` fois vers Tn+1 (par défaut, `k` = ce que N permet, `⌊N/50⌋` ou `⌊N/250⌋` ; modifiable), vendre le résultat et le reste de Tn.
3. **Enchaîner** jusqu'à Tn+2 : le rendement attendu de la 1re promotion alimente la 2e (le nombre de 2es promotions dépend du tirage et est donc simulé lui aussi).

Pour chaque option : liste d'achats (ingrédients manquants), pierres nécessaires, gain médian, fourchette p10–p90, et écart par rapport à « vendre ».
Recommandation : l'option au meilleur gain **médian** (choix validé : la médiane, pas la moyenne), avec un avertissement si p10 est sous « vendre ».

### Profit réel

Quand je saisis un résultat (« 3 promotions → 52 fioles »), l'appli enregistre aussi **les prix du moment** de chaque objet concerné et le mode de prix. Elle affiche alors :
- le **profit réel** : valeur nette de ce que j'ai obtenu − valeur des ingrédients consommés (même règle qu'au § « Valeur des ingrédients ») ;
- l'écart avec le profit **prévu** (médiane) au même moment : chanceux ou malchanceux.

Les prix étant figés à la saisie, le profit d'une promotion ne bouge plus quand le marché change.

## 5. Écrans

1. **Mon stock** (accueil) : tous les matériaux promouvables que je possède, triés par gain de la meilleure option. Pour chacun : quantité, valeur à la vente, meilleure option, gain médian, pastille (vendre / promouvoir / enchaîner).
2. **Détail d'un matériau** : quantité modifiable, nombre de promotions modifiable, les 3 options détaillées, mode immédiat/patient, liste d'achats, graphique de la distribution simulée, nombre de mesures derrière l'estimation.
3. **Toutes les recettes** : la même chose sans stock (comme gw2lunchbox), pour repérer des promotions rentables même avec des achats.
4. **Saisir un résultat** : recette, nombre de promotions, quantité totale obtenue. Accessible depuis le détail (préremplie) et depuis un bouton général. Liste de mes saisies, modifiables et supprimables.
5. **Réglages** (par profil) : clé GW2 (vérifiée, droits manquants signalés), valeur des pierres philosophales, mode de prix par défaut.

Interface en français, noms d'objets en français (API `lang=fr`), icônes de l'API.

## 6. Données (SQLite)

Un fichier `var/data/gw2.sqlite`, PDO natif, migrations en SQL simple.

```
items              (id INTEGER PK  -- id GW2
                    name_en, name_fr, icon, category, family, tier)
recipes            (id PK, output_item_id, category, tier_from, source_ref)
recipe_ingredients (recipe_id, item_id, quantity)
observations       (id PK, recipe_id, profile, promotions, quantity_total,
                    observed_at, source,     -- source : silveress-2014 | <profil>
                    price_mode, stone_value, -- NULL pour silveress-2014
                    expected_median)         -- profit prévu au moment de la saisie
observation_prices (observation_id, item_id, role,   -- role : input | output
                    quantity, buy_price, sell_price) -- prix bruts du moment, en cuivres
sales              (id INTEGER PK  -- id de transaction GW2
                    profile, item_id, quantity, price,  -- prix unitaire brut, en cuivres
                    created, purchased)                 -- dates GW2 (mise en vente, vente)
profiles_settings  (profile PK, api_key_encrypted, stone_value, price_mode)
```

- Les recettes sont décrites dans un fichier versionné (`data/recipes.yaml`) et importées par une commande. Le dépôt reste la référence, relue en PR.
- Les observations de Silveress sont importées une fois depuis les CSV par une commande ; les CSV restent dans le dépôt pour pouvoir rejouer l'import.
- Une observation peut regrouper plusieurs promotions (« 10 promotions → 192 »). Elle sert à la moyenne et au profit réel ; seules les observations à 1 promotion servent à la distribution (décidé le 2026-11-27).
- Les prix bruts sont stockés (pas les nets) : on peut recalculer les profits si la règle de taxe change.
- Clés GW2 chiffrées (sodium, clé dérivée d'`APP_SECRET`), comme « Ma config » du dashboard.

## 7. Profils

`/julien`, `/estelle`, sans mot de passe, comme le dashboard. Chaque profil a sa clé et ses réglages. Les observations sont partagées entre profils (le hasard est le même pour tout le monde) mais gardent leur auteur.

## 8. Carte du dashboard

Endpoint `GET /api/profiles/{slug}/top?limit=5` : les meilleures options de mon stock (matériau, option, gain médian, lien vers le détail).
Nouvelle carte `gw2-forge` dans homelab-dashboard, qui lit cet endpoint et renvoie vers `https://gw2.home/<profil>/…`. Le dashboard n'a pas besoin de la clé GW2.

## 9. Statistiques (plus tard, données prévues dès la v1)

Grâce à `observations` + `observation_prices`, sans changer le schéma :
- profit réel total, par jour / semaine / mois ;
- matériaux et recettes les plus profitables ;
- chance : rendement obtenu vs médiane, par recette ;
- nombre de promotions faites, pierres consommées.

**Ventes réelles (v1, décidé le 2026-11-27)** : en plus du profit réel théorique calculé à la saisie, l'appli relève `/v2/commerce/transactions/history/sells` (droit `tradingpost`, 90 derniers jours, paginé) pour chaque profil qui a une clé :
- commande `app:sales:sync`, lancée toutes les heures par Dagu (le job `dagu_jobs` vit dans le rôle Ansible) ; dédoublonnage par l'id de transaction, donc relance sans risque ; l'historique est conservé au-delà de 90 jours ;
- seules les ventes d'objets présents dans `items` sont gardées (matériaux promouvables + ingrédients) ;
- affichage v1 : sur le détail d'un matériau, mes ventes récentes (quantité, prix unitaire, net encaissé) ; total vendu par matériau.
- Rapprocher une vente d'une promotion précise n'est pas fiable (les stocks se mélangent) : les ventes sont affichées par matériau, à côté des promotions, sans lien entre elles.
- Les achats (`history/buys`) pourront être relevés de la même façon si besoin, pas en v1.

## 10. Technique et déploiement

- Dépôt `homelab-gw2` (GitHub, image GHCR publique, aucune donnée perso), Symfony + React + Vite + Tailwind, même organisation que homelab-dashboard (PHP-FPM + nginx dans le compose).
- Dépendances PHP : composants Symfony (http-client, yaml, console, options-resolver), PDO SQLite. Pas d'ORM.
- TDD, fixtures fictives ; versions épinglées, Renovate.
- Rôle Ansible `service-gw2` sur helium : service + Caddy (`gw2.home`), DNS Pi-hole sur krypton, certificat mkcert à régénérer (copie sur helium faite par Julien).
- Sauvegarde de `var/data/` (SQLite via `.backup`) vers `argon:/mnt/raid/backups/services/gw2/`, puis restic.
- `APP_SECRET` stable au vault.

## 11. Décisions

- Recommandation sur la médiane.
- Taxes : 5 % + 10 % sur toute vente, achat sans taxe ; chaque frais arrondi au plus proche (demi vers le haut), minimum 1 c.
- Observations multi-promotions : moyenne et profit réel seulement.
- Poussière comme ingrédient : prix du marché, pas d'optimisation croisée entre familles en v1.
- Historique réel des ventes relevé dès la v1 (§ 9).

## 12. Questions ouvertes

Aucune.
