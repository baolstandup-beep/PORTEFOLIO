# Suñu Meññeef : refonte de l'identité visuelle

Proposition de refonte du logo et de l'identité. Ce dossier ne fait pas partie du site : `scripts/build.mjs` ne le lit pas.

```
presentation.html   cahier de marque complet (diagnostic, symbole, palette, typographie, motifs, supports, règles)
svg/                logos vectoriels, texte converti en contours (aucune police requise)
build.mjs           génère svg/ à partir de la géométrie du symbole et de Bricolage Grotesque
page.mjs            assemble presentation.html à partir de svg/
```

## Fichiers

| Fichier | Usage |
| --- | --- |
| `logo-horizontal.svg` | Logo principal |
| `logo-vertical.svg` | Version compacte (emballages, formats carrés) |
| `logo-horizontal-negatif.svg` | Sur fond forêt ou photo sombre |
| `logo-horizontal-mono.svg` | Une couleur |
| `symbole.svg`, `symbole-negatif.svg`, `symbole-mono-foret.svg` | Symbole seul |
| `mot-symbole.svg` | Nom seul |

## Palette

Forêt `#123D2B` · Feuille `#2E9A4B` · Soleil `#F2A516` · Pousse `#A9CF3D` · Sable `#F4EEDF` · Terre `#7C4F2A`

## Régénérer

```bash
npm i opentype.js@1.3.4 @fontsource/bricolage-grotesque@5.1.0
node build.mjs svg
node page.mjs presentation.html chemin/vers/logo-actuel.png
```
