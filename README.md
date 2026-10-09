# CABD : portfolio de Cheikh Awa Balla Diop

Site statique généré par un script Node sans dépendance, avec une fonction Vercel pour le formulaire (`api/contact.js`). Direction artistique : « African Contemporary Art Direction », papier, encre, vert profond et ocre, Cormorant Garamond et Manrope.

## Structure

```
data/case-studies.json   les 24 projets détaillés (client, rôle, année, textes, images) : une page par projet
data/projects.json       les 36 visuels de l'archive (filtres print / digital, lien vers l'étude de cas)
data/clients.json        les logos clients
src/home.html            contenu de la page d'accueil
src/content/             textes des pages légales
src/css/styles.css       système visuel complet (@layer : tokens, composants, pages, mouvement)
src/js/                  modules ES : navigation, archive, visionneuse, formulaire, statistiques
scripts/lib/html.mjs     en-tête, pied de page, <head> et images responsives communs à toutes les pages
scripts/lib/pages.mjs    gabarits : accueil, étude de cas, page de texte, sitemap
scripts/build.mjs        génère dist/ et vérifie chaque image, chaque fichier et chaque lien d'étude de cas
scripts/optimize-images.mjs  variantes WebP 960 et 1920, logos clients
public/                  servi tel quel : images, polices, APK, robots.txt
api/contact.js           envoi des demandes par e-mail via Resend (facultatif)
```

Pages générées : `/`, `/projets/<id>/` (24 études de cas), `/mentions-legales.html`, `/confidentialite.html` et `/sitemap.xml`. Les anciennes adresses `/project.html?id=…` redirigent vers `/projets/<id>/`.

## Prévisualiser

```bash
npm run preview
```

Puis ouvrir http://localhost:4321.

## Ajouter un projet

1. Déposer l'original dans `public/assets/images/` et ses versions `-640.webp` et `-1280.webp` dans `public/assets/images/optimized/`.
2. Lancer `npm run images` : crée les variantes 960 et 1920 px.
3. Ajouter le projet dans `data/case-studies.json`. Seuls `id`, `name`, `category`, `client`, `role`, `summary` et `images` sont obligatoires ; les rubriques vides ne s'affichent pas. `featured` (1 à 6) le place dans la sélection de l'accueil.
4. Pour l'archive, ajouter aussi une entrée dans `data/projects.json` avec `case` égal à l'`id`.
5. Lancer `npm run build` : il échoue si une image ou un lien manque.

## Déployer

Chaque push sur `main` déploie en production sur Vercel. Chaque autre branche crée un aperçu.

## Formulaire de contact

Sans configuration, le formulaire ouvre WhatsApp avec la demande préremplie et affiche une confirmation. Pour l'envoi par e-mail, définir dans Vercel (Production) puis redéployer : `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (domaine vérifié dans Resend) et, si besoin, `CONTACT_TO_EMAIL`.

## Statistiques

Vercel Web Analytics, chargé une seule fois et désactivé en local. Aucun contenu du formulaire n'est transmis.
