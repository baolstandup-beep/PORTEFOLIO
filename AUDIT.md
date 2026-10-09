# Audit de cabd-portfolio.vercel.app

Analyse du site en ligne le 9 octobre 2026 : HTML source complet, CSS et JS inline, scripts externes, en-têtes HTTP et mesures dans un navigateur.

## Ce qui est déjà bien fait

- Métadonnées SEO locales sérieuses : `title`, `description`, `canonical`, `og:*`, `geo.*`, JSON-LD `Person` + `ProfessionalService`.
- Images en WebP, avec `width`/`height` (pas de décalage de mise en page) et `loading="lazy"`.
- JS soigné : `prefers-reduced-motion` respecté, `IntersectionObserver`, `requestAnimationFrame`, délégation d'événements, piège à robots dans le formulaire, `textContent` plutôt que `innerHTML` pour les avis.
- Accessibilité pensée : lien d'évitement, `aria-pressed` sur les filtres, focus piégé dans la visionneuse, `inert` sur le menu mobile.

## Problèmes relevés, par gravité

### Performance

| Problème | Mesure | Correction |
|---|---|---|
| Premier affichage tardif | FCP ≈ 3,4 s mesuré | Préchargeur supprimé, 2 familles de polices au lieu de 6 graisses de Poppins, portrait préchargé |
| Logos clients énormes | JPG de 2530×1515 px, 200 à 500 Ko chacun, affichés à ~105 px. Le marquee les charge en double (18 balises `<img>`) | Une seule liste. **À faire** : réexporter les logos en WebP 400 px (~10 Ko chacun) |
| Visionneuse lourde | Ouvre le PNG d'origine (755 Ko pour Prizent) | Ouvre la version 1280 px WebP (~85 Ko) |
| Pas de `srcset` | Le mobile télécharge les vignettes 1280 px alors qu'une version 640 px existe déjà sur le serveur | `srcset` 640/1280 + `sizes` sur toutes les vignettes |
| Vercel Insights chargé deux fois | 2 requêtes `insights/script.js` observées (balise dans `<head>` + injection par `analytics.js`) | Injection unique, avec garde |
| HTML de 184 Ko | 63 Ko de CSS inline et 21 Ko de JS inline, non mis en cache entre les pages | HTML de 54 Ko, CSS et JS dans des fichiers séparés |
| Boucles d'animation permanentes | Curseur personnalisé, halo, parallaxe 3D, boutons magnétiques, barre de progression, marquee : tous liés à `mousemove`/`scroll` | Supprimés : ils n'aidaient pas à vendre le travail |

### Maintenabilité

- CSS monolithique : 51 `@media`, 28 `!important`, 25 couleurs en dur. Le commentaire annonce « Plus Jakarta Sans, Inter, IBM Plex Mono » alors que seule Poppins est chargée, et les trois variables `--font-title`, `--font-body`, `--font-mono` pointent vers Poppins.
- Les 36 projets sont écrits à la main dans le HTML. Ajouter un projet oblige à copier 10 lignes de balisage.
- Avis et logos injectés en JS : invisibles pour Google et sans JS.
- 24 gestionnaires `on*=""` inline, ce qui empêche une CSP stricte.
- `theme-color` sombre (#080808) alors que le thème par défaut est clair.

### Accessibilité

- Orange `#FF5E1A` sur blanc : contraste d'environ 3:1, insuffisant pour le petit texte (AA demande 4,5:1).
- Vignettes en `div role="button"` au lieu de vrais `<button>`.
- Fausses notes 5 étoiles sur chaque avis : information non vérifiable.
- 13 `h2` pour une seule page, avec des titres racoleurs (« Services & Solutions Sur‑Mesure ») plutôt que descriptifs.

### Sécurité et en-têtes

- Aucune CSP, ni `X-Content-Type-Options`, ni `Referrer-Policy`, ni `frame-ancestors` (HSTS est bien présent, fourni par Vercel).
- `cache-control: max-age=0` sur tout, y compris les images.

### Contenu et design

- Le site reprend les marqueurs d'un modèle générique : fond noir avec un accent orange vif, intertitres numérotés « 01 / Portfolio Visuel » (ce n'est pas une séquence), étiquettes en capitales espacées, marquee de mots-clés, compteurs animés, « 100 % Solutions Sur-Mesure ».
- Le formulaire exige un e-mail, alors que le message part sur WhatsApp.
- Une seule expérience dans « Parcours », présentée comme une frise.

## Ce que fait la refonte

**Direction visuelle.** Papier clair, encre presque noire et un seul accent : le vert de la Grande Mosquée de Touba (`#0d5c42`, contraste 7,6:1). Typographie Bricolage Grotesque en largeur condensée pour le nom, Instrument Sans pour le texte. Le moment fort est le « mur d'affiches » du hero : le portrait encadré par deux vraies affiches (Magal Ngabou, 115e Appel Layène) qui se posent au chargement. C'est la seule animation non déclenchée par l'utilisateur.

**Galerie.** Grille en colonnes qui garde les proportions de chaque visuel (les affiches ne sont plus rognées en carré), filtres accessibles, pagination par 12, visionneuse en `<dialog>` natif (focus, Échap et fond gérés par le navigateur), navigation au clavier et au doigt.

**Architecture.**

```
data/projects.json     36 projets : nom, type, catégories, image, dimensions, étude de cas
src/index.html         gabarit, contenu statique indexable (avis, logos, FAQ)
src/css/styles.css     @layer reset, tokens, base, layout, components, utilities ; 0 !important
src/js/main.js         point d'entrée (module ES)
src/js/works.js        filtres, pagination, visionneuse
src/js/contact.js      validation, message WhatsApp ou envoi via /api/contact
src/js/analytics.js    Vercel Analytics chargé une seule fois, événements sans donnée personnelle
scripts/build.mjs      build Node sans dépendance : injecte les projets, vérifie le gabarit
vercel.json            CSP stricte, en-têtes de sécurité, cache des images
```

**Autres points.**
- Menu mobile en `popover` natif : aucun JS pour ouvrir, fermer, ni gérer Échap.
- FAQ en `<details name>` (accordéon exclusif sans JS) + JSON-LD `FAQPage`.
- Mode sombre automatique via `prefers-color-scheme`, avec ses propres `theme-color`.
- `og:image` et `twitter:card` grand format ajoutés : le lien partagé sur WhatsApp affiche enfin une image.
- E-mail facultatif dans le formulaire ; erreurs reliées aux champs par `aria-describedby`.

## Corrections complémentaires appliquées

- Logos clients réexportés en WebP 400 px : 4,2 Mo → 80 Ko pour les 9 logos.
- Version 1920 px générée pour les 8 visuels dont l'original dépasse 1280 px ; la visionneuse l'utilise automatiquement.
- Polices hébergées sur le site (WOFF2 variables, sous-ensemble latin, 161 Ko au total, préchargées) : plus aucune requête vers Google.
- API `/api/contact` : e-mail facultatif (le formulaire ne l'exige plus), `reply_to` seulement s'il est fourni ; testée sur 7 cas.
- CSP stricte limitée à la page d'accueil : `project.html` et les pages légales utilisent encore du code intégré.
- Le build vérifie que chaque image référencée existe et échoue sinon.

## Reste à faire

1. Moderniser `project.html` (études de cas) et les pages légales dans le même style ; elles chargent encore Poppins depuis Google.
2. Ajouter de vrais intitulés de poste et dates si d'autres expériences existent.
3. Activer l'envoi e-mail en définissant les variables Resend dans Vercel.
