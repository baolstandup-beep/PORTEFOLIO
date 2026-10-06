# Portfolio de Cheikh Awa Balla Diop

Site statique prêt à être publié sur Vercel.

## Prévisualisation locale

```bash
python3 -m http.server 4173
```

Puis ouvrir `http://localhost:4173`.

## Déploiement

Importer ce dossier dans un dépôt GitHub, puis le connecter à Vercel sans commande de build. Le dossier de sortie est la racine du projet.
# Configuration du contact et des statistiques

Le site est statique, avec une fonction Vercel dans `api/contact.js`.

Pour activer l’envoi email, définir en production sur Vercel :

- `RESEND_API_KEY` : clé Resend autorisée à envoyer des emails.
- `CONTACT_FROM_EMAIL` : expéditeur appartenant à un domaine vérifié dans Resend.
- `CONTACT_TO_EMAIL` : destinataire facultatif ; par défaut `contact.baolvision@gmail.com`.

Redéployer après configuration. Sans ces paramètres, le formulaire prépare une demande WhatsApp et annonce explicitement ce comportement. L’API expose seulement un booléen de disponibilité, jamais les secrets. La confirmation signifie que le prestataire email a accepté la demande ; elle ne garantit pas sa remise en boîte de réception.

Activer Web Analytics dans le projet Vercel. Les pages vues fonctionnent avec le script intégré. Les événements `whatsapp_click`, `case_study_open` et `contact_sent` nécessitent un abonnement Vercel qui prend en charge les événements personnalisés. Aucun contenu du formulaire n’est transmis aux statistiques.

Les 48 médias ont deux variantes WebP avec dimensions explicites. Les originaux restent disponibles pour les aperçus grand format.

Les six études approfondies sont PRIZENT, CASS ONLINE, VACREA, SET-TRANS, KHELCOM et NGS. Les témoignages, chiffres commerciaux et coordonnées légales complémentaires doivent être fournis et validés par le propriétaire avant publication.
