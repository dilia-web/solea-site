# SOLÉA — Boutique de protection solaire (v2)

Site e-commerce statique (HTML / CSS / JavaScript) relié à une base **Supabase**.

## Arborescence

```
solea-site/
├── index.html            → la page (structure)
├── css/
│   └── style.css         → tout le design
├── js/
│   ├── supabase-config.js → tes clés Supabase (à remplir)
│   ├── products.js        → catalogue de secours + dessins SVG des flacons
│   └── app.js             → logique : boutique, panier, commande, quiz…
├── images/               → photos + favicon
└── supabase.sql          → script de création de la base
```

## Lancer le site

1. Ouvrir le dossier `solea-site` dans VS Code (Fichier → Ouvrir le dossier).
2. Clic droit sur `index.html` → **Open with Live Server** (ou bouton « Go Live »).
3. Le site s'ouvre sur `http://127.0.0.1:5500/index.html`.

Sans Supabase, le site marche déjà en **mode démo** (catalogue local, commandes gardées dans le navigateur).

## Brancher Supabase (5 minutes)

1. Créer un compte et un projet gratuit sur https://supabase.com.
2. Dans le projet : **SQL Editor → New query**, coller le contenu de `supabase.sql`, cliquer **Run**.
   → crée les tables `products`, `orders`, `newsletter` et insère les 12 produits.
3. **Project Settings → API** : copier *Project URL* et la clé *anon public*.
4. Les coller dans `js/supabase-config.js`.
5. Recharger le site : en bas de page s'affiche « Base Supabase connectée · 12 produits ».

Pour modifier un prix ou un stock : Supabase → **Table Editor → products**, puis recharger le site.
Les commandes passées apparaissent dans **Table Editor → orders**.
