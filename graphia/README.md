# GRAPHIA 2026 — Plateforme de candidature

Site public (présentation + formulaire en 6 étapes) et espace d'administration sécurisé pour sélectionner les 50 participants du Bootcamp GRAPHIA 2026 (Baol Up Graphic, Touba).

**Stack** : Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL (`pg`, requêtes paramétrées) · Zod · jose (sessions JWT) · bcrypt · ExcelJS · jsPDF.

> Ce dossier est un projet indépendant du portfolio situé à la racine du dépôt. Il se déploie comme un **projet Vercel séparé** dont le « Root Directory » est `graphia`.

## Fonctionnalités

| Côté candidat | Côté organisation |
|---|---|
| Page d'accueil (programme, objectifs, public, conditions, FAQ) | Connexion par e-mail + mot de passe, 3 rôles |
| Formulaire en 6 étapes, barre de progression, validation à chaque étape | Tableau de bord : total, du jour, en attente, présélectionnés, retenus, non retenus, places restantes (actualisé toutes les 30 s) |
| Sauvegarde automatique sur l'appareil (reprise après coupure) | Liste : recherche, filtres ville / profil / niveau / statut, tri, pagination |
| Pièces jointes facultatives (3 fichiers, 4 Mo, JPG/PNG/WebP/PDF) | Fiche détaillée, modification, suppression (confirmation tapée) |
| Récapitulatif + consentement + confirmation avant envoi | Statuts : en attente, présélectionné, retenu, non retenu — **plafond de 50 retenus appliqué côté serveur** |
| Page de confirmation : n° unique, date, nom, impression / PDF | Notation facultative sur 5 critères (0–5, total /25) + notes internes |
| Pas de double inscription (téléphone et e-mail uniques, envoi idempotent) | Export Excel et PDF (respectent les filtres), fiche individuelle imprimable |
| | Notifications e-mail / WhatsApp avec historique, journal des actions |

## Installation locale

Prérequis : Node.js 20+ et PostgreSQL 14+.

```bash
cd graphia
```

```bash
npm install
```

```bash
cp .env.example .env.local
```

Renseigner au minimum `DATABASE_URL` et `SESSION_SECRET` dans `.env.local` (et copier le fichier en `.env` pour les scripts en ligne de commande, ou exporter les variables). Générer un secret :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Base de données

Créer la base (exemple local) :

```bash
createdb graphia
```

Appliquer le schéma (idempotent, à relancer après chaque mise à jour) :

```bash
npm run db:migrate
```

Tables : `candidates`, `candidate_attachments`, `administrators`, `notifications`, `rate_limits`, `audit_log`. Le schéma est dans `db/migrations/001_init.sql` (contraintes, index, unicité du téléphone normalisé et de l'e-mail, séquence des numéros `GRA26-0001`).

## Créer le premier administrateur

```bash
npm run admin:create -- --email vous@exemple.com --name "Prénom Nom" --role superadmin
```

Le mot de passe (12 caractères minimum) est demandé dans le terminal. Relancer la commande avec la même adresse réinitialise le mot de passe et ferme les sessions ouvertes de ce compte.

Rôles : `superadmin` et `admin` (tous les droits), `evaluateur` (consultation et notation uniquement : pas de changement de statut, d'export, de modification ni de suppression).

## Lancer le serveur

```bash
npm run dev
```

Site : http://localhost:3000 · Administration : http://localhost:3000/admin

Production locale :

```bash
npm run build && npm start
```

Vérifications :

```bash
npm run lint && npm test
```

## Notifications

Rien n'est simulé : sans service configuré, chaque tentative est enregistrée avec le statut « service non configuré » et le tableau de bord l'indique. La confirmation d'inscription part automatiquement ; les messages de présélection, sélection et non-sélection sont envoyés **manuellement** depuis la fiche du candidat (un statut peut encore changer).

**E-mail (Resend)** : créer un compte sur resend.com, vérifier un domaine, puis définir `RESEND_API_KEY` et `EMAIL_FROM` (ex. `GRAPHIA 2026 <candidatures@votre-domaine.com>`). Seuls les candidats ayant saisi un e-mail le reçoivent.

**WhatsApp (WhatsApp Business Cloud API de Meta)** : WhatsApp interdit d'écrire en premier avec un texte libre ; il faut des **modèles de message approuvés**.
1. Créer une app Meta Business, ajouter WhatsApp, enregistrer un numéro professionnel.
2. Dans le WhatsApp Manager, créer 4 modèles (catégorie « Utility », langue « French ») avec deux variables : `{{1}}` = prénom, `{{2}}` = numéro de candidature. Exemple : « Bonjour {{1}}, votre candidature GRAPHIA 2026 ({{2}}) a bien été reçue… ».
3. Définir `WHATSAPP_TOKEN` (jeton permanent d'utilisateur système), `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TEMPLATE_LANG=fr` et les noms des modèles : `WHATSAPP_TEMPLATE_CONFIRMATION`, `WHATSAPP_TEMPLATE_PRESELECTION`, `WHATSAPP_TEMPLATE_SELECTION`, `WHATSAPP_TEMPLATE_NON_SELECTION`.

L'approbation des modèles par Meta prend de quelques minutes à quelques jours.

## Déploiement (Vercel + PostgreSQL hébergé)

1. Créer une base PostgreSQL managée (Neon, Supabase ou Vercel Postgres), région Europe de préférence. Récupérer l'URL de connexion avec `?sslmode=require`.
2. Depuis votre poste, avec cette URL dans `.env` : `npm run db:migrate` puis `npm run admin:create -- …`.
3. Sur Vercel : **Add New Project** → ce dépôt → **Root Directory : `graphia`** → Framework Next.js.
4. Variables d'environnement (Production) : `DATABASE_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL` (URL publique), `MAX_PARTICIPANTS=50`, et selon les besoins les variables de notifications, de contact (`NEXT_PUBLIC_CONTACT_*`) et `APPLICATIONS_CLOSE_AT` (date de clôture ISO, ex. `2026-11-20T23:59:00Z`).
5. Déployer, puis tester une candidature et la connexion admin.

Le portfolio à la racine du dépôt n'est pas affecté : il reste un projet Vercel distinct.

**Limite d'envoi** : Vercel refuse les requêtes de plus de 4,5 Mo, d'où la limite de 4 Mo de pièces jointes par candidature. Les fichiers sont stockés dans PostgreSQL (table `candidate_attachments`) et ne sont servis qu'aux administrateurs connectés.

## Sauvegarde

```bash
npm run db:backup
```

Écrit un fichier `backups/graphia-<date>.dump` (nécessite `pg_dump`). Restauration : `pg_restore --clean --no-owner -d "$DATABASE_URL" <fichier>`. Copier les sauvegardes hors du serveur. Les hébergeurs managés (Neon, Supabase) proposent aussi des sauvegardes automatiques : activez-les.

## Sécurité

- Pages et API `/admin` protégées deux fois : par le proxy (jeton signé) puis par une vérification du compte en base à chaque requête (rôle, session révoquée).
- Mots de passe hachés avec bcrypt (coût 12), comparaison à temps constant même pour une adresse inconnue.
- Cookie de session `HttpOnly`, `SameSite=Strict`, `Secure` en production, durée 8 h ; contrôle de l'en-tête `Origin` sur toutes les requêtes de modification.
- Validation Zod côté serveur de toutes les entrées ; SQL exclusivement paramétré (tri par liste blanche).
- Limitation des tentatives stockée en base : connexion (5 / 15 min par e-mail, 20 par IP), soumissions (20 / h par IP, large pour les cybercafés).
- Anti-robots : champ piège invisible et durée minimale de remplissage.
- Fichiers : type vérifié sur le contenu réel (octets), nom nettoyé, servis en `Content-Disposition` avec `nosniff` et CSP `sandbox`.
- Exports protégés contre l'injection de formules Excel ; toutes les actions sensibles sont journalisées (`audit_log`).
- En-têtes : CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `noindex` sur l'administration.

## Structure

```
db/migrations/        schéma SQL
scripts/              migration, création d'admin, sauvegarde
src/proxy.ts          protection des routes /admin et /api/admin
src/app/              pages (accueil, candidater, confirmation, confidentialité, admin) et API
src/components/       interface (ui, logo, récapitulatif, composants admin)
src/lib/              validation, base, auth, notifications, limitation, constantes
tests/                tests unitaires (Vitest)
```
