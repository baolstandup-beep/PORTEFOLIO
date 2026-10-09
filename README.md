# Portfolio de Cheikh Awa Balla Diop : Baol Vision

Site statique avec une fonction Vercel (`api/contact.js`). Aucune dépendance : Node 20 ou plus suffit pour le build.

```
data/projects.json       les 36 projets (nom, type, catégories, image, dimensions, étude de cas)
data/clients.json        les logos clients
src/index.html           gabarit de la page d'accueil
src/css/styles.css       styles, organisés en @layer
src/js/                  modules ES : galerie, visionneuse, formulaire, statistiques
public/                  servi tel quel : images, polices, APK, études de cas, pages légales
scripts/build.mjs        assemble dist/ et vérifie que chaque image référencée existe
scripts/optimize-images.mjs  génère les logos WebP et les visuels 1920 px
api/contact.js           envoi des demandes par e-mail via Resend (facultatif)
```

## Prévisualiser

```bash
npm run preview
```

Puis ouvrir http://localhost:4321.

## Ajouter un projet

1. Déposer l'original dans `public/assets/images/` et ses versions `-640.webp` et `-1280.webp` dans `public/assets/images/optimized/`.
2. Ajouter une entrée dans `data/projects.json` : `cat` vaut `print`, `digital` ou les deux ; `w` et `h` sont les dimensions de la version 1280.
3. Lancer `npm run images` pour créer la version grand format si l'original dépasse 1280 px.
4. Lancer `npm run build` : il échoue si une image manque.

Pour un nouveau logo client : déposer le JPG dans `public/assets/clients/`, l'ajouter à `data/clients.json`, puis lancer `npm run images`.

## Déployer

Chaque push sur `main` déploie en production sur Vercel. Chaque autre branche crée un aperçu.

## Formulaire de contact

Sans configuration, le formulaire ouvre WhatsApp avec la demande préremplie. Pour l'envoi par e-mail, définir dans Vercel (Production) puis redéployer :

- `RESEND_API_KEY` : clé Resend autorisée à envoyer des e-mails ;
- `CONTACT_FROM_EMAIL` : expéditeur d'un domaine vérifié dans Resend ;
- `CONTACT_TO_EMAIL` : destinataire facultatif, par défaut `contact.baolvision@gmail.com`.

L'e-mail du visiteur est facultatif ; le téléphone est obligatoire.

## Statistiques

Vercel Web Analytics, chargé une seule fois et désactivé en local. Événements envoyés : `whatsapp_click`, `whatsapp_hero`, `whatsapp_contact`, `whatsapp_form`, `project_view`, `case_study_open`, `email_copy`, `contact_sent`. Aucun contenu du formulaire n'est transmis.

Voir `AUDIT.md` pour l'analyse qui a motivé la refonte.
