// Assemble la présentation de l'identité à partir des SVG générés par build.mjs.
import fs from 'node:fs';

const [, , outFile, originalPng] = process.argv;
const f = JSON.parse(fs.readFileSync('out/inline.json', 'utf8'));
const strip = (s) => s.replace(/ width="[\d.]+" height="[\d.]+"/, '').trim();
const svg = (name, cls = '', label = '') => strip(f[name]).replace('<svg ', `<svg class="${cls}" role="img" aria-label="${label}" `);
const orig = originalPng ? 'data:image/png;base64,' + fs.readFileSync(originalPng).toString('base64') : '';

// Motif : feuilles du symbole répétées en quinconce, tracées une seule fois dans un <pattern>.
const leafPattern = (fg, bg, id) => `<svg class="pattern" viewBox="0 0 480 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><pattern id="${id}" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)"><rect width="60" height="60" fill="${bg}"/><path fill="${fg}" d="M14 50C8 40 8 22 18 8C26 22 24 40 14 50Z"/><circle cx="44" cy="22" r="5" fill="${fg}" opacity=".55"/><path fill="${fg}" opacity=".35" d="M40 54C40 46 46 40 54 38C54 46 48 52 40 54Z"/></pattern></defs><rect width="480" height="240" fill="url(#${id})"/></svg>`;

const symBody = strip(f['symbole.svg']).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

const html = `<title>Suñu Meññeef</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap">
<style>
/* Mise en page : cahier de marque en bandes pleine largeur, alternance sable / forêt, colonne de lecture 1080px. */
:root{
  --foret:#123D2B; --feuille:#2E9A4B; --pousse:#A9CF3D; --soleil:#F2A516; --sable:#F4EEDF; --terre:#7C4F2A;
  --papier:#FBF8F0; --encre:#16231C; --gris:#5E6B62; --filet:#DCD3BE;
  --display:"Bricolage Grotesque", "Arial Black", system-ui, sans-serif;
  --texte:"DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  color-scheme: light;
}
*{box-sizing:border-box}
body{background:var(--papier);color:var(--encre);font:400 16px/1.6 var(--texte)}
.band{padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:72px}
.band.sable{background:var(--sable)}
.band.foret{background:var(--foret);color:var(--papier)}
.wrap{max-width:1080px;margin-inline:auto;display:grid;gap:32px}
.eyebrow{font:700 12px/1 var(--texte);letter-spacing:.14em;text-transform:uppercase;color:var(--feuille)}
.foret .eyebrow{color:var(--pousse)}
h1,h2,h3{font-family:var(--display);text-wrap:balance;margin:0;line-height:1.05}
h1{font-size:clamp(40px,7vw,84px);font-weight:800;letter-spacing:-.02em;color:var(--foret)}
h2{font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:-.015em}
h3{font-size:20px;font-weight:700}
p{margin:0;max-width:65ch}
.lead{font-size:clamp(17px,2vw,20px);color:var(--gris)}
.foret .lead{color:#C9D8CD}
.head{display:grid;gap:12px}
.grid{display:grid;gap:24px}
.g2{grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))}
.g3{grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))}
.g4{grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))}
.g2>*,.g3>*,.g4>*{min-width:0}
.tile{background:#fff;border:1px solid var(--filet);border-radius:6px;padding:32px;display:grid;place-items:center;min-height:220px}
.tile.dark{background:var(--foret);border-color:var(--foret)}
.tile.sun{background:var(--soleil);border-color:var(--soleil)}
.tile.sand{background:var(--sable)}
.caption{font-size:13px;color:var(--gris);margin-top:10px}
.foret .caption{color:#A9BCAE}
svg{display:block;max-width:100%;height:auto}

/* Ouverture */
.hero{display:grid;gap:40px;grid-template-columns:repeat(auto-fit,minmax(min(100%,460px),1fr));align-items:center}
.hero .logo{width:100%;max-width:520px}
.meta{display:flex;flex-wrap:wrap;gap:8px 24px;font-size:14px;color:var(--gris)}
.meta b{color:var(--encre);font-weight:700}

/* Avant / après */
.ba{display:grid;gap:24px;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))}
.ba figure{margin:0;display:grid;gap:12px;min-width:0}
.ba .frame{background:#fff;border:1px solid var(--filet);border-radius:6px;padding:28px;display:grid;place-items:center;aspect-ratio:16/9;max-width:100%}
.ba .frame img,.ba .frame svg{max-height:100%;width:auto;max-width:100%}
.tag{font:700 11px/1 var(--texte);letter-spacing:.12em;text-transform:uppercase;padding:6px 10px;border-radius:99px;justify-self:start}
.tag.old{background:#EADFC8;color:var(--terre)}
.tag.new{background:var(--foret);color:var(--pousse)}
ul.points{margin:0;padding:0;list-style:none;display:grid;gap:14px}
ul.points li{display:grid;grid-template-columns:20px 1fr;gap:12px;align-items:start}
ul.points li::before{content:"";width:10px;height:10px;margin-top:8px;border-radius:50%;background:var(--soleil)}
ul.points.minus li::before{background:var(--terre);border-radius:2px;height:3px;margin-top:12px}
.conf{font:700 11px/1 var(--texte);letter-spacing:.06em;color:var(--terre);background:#EFE5CF;padding:3px 6px;border-radius:3px;margin-right:6px;white-space:nowrap}

/* Construction */
.construct{position:relative;background:#fff;border:1px solid var(--filet);border-radius:6px;padding:24px}
.construct svg{width:100%;max-width:420px;margin-inline:auto}
.legend{display:grid;gap:16px}
.legend div{display:grid;grid-template-columns:28px 1fr;gap:14px;align-items:start}
.sw{width:28px;height:28px;border-radius:50%}

/* Palette */
.pal{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,160px),1fr))}
.chip{border-radius:6px;overflow:hidden;border:1px solid var(--filet);background:#fff;min-width:0}
.chip .c{height:120px;padding:14px;display:flex;align-items:flex-end;font:700 13px/1 var(--texte)}
.chip .i{padding:12px 14px;display:grid;gap:2px;font-size:13px}
.chip .i b{font-family:var(--display);font-size:17px}
.chip code{font:500 13px/1.4 ui-monospace,"SF Mono",Menlo,monospace;color:var(--gris)}
.ratio{display:flex;height:22px;border-radius:4px;overflow:hidden}
.ratio span{display:block}

/* Typographie */
.spec{background:#fff;border:1px solid var(--filet);border-radius:6px;padding:32px;display:grid;gap:20px;min-width:0}
.spec .big{font-family:var(--display);font-weight:800;font-size:clamp(56px,9vw,104px);line-height:.9;color:var(--foret);letter-spacing:-.02em}
.spec .alpha{font-family:var(--display);font-weight:700;font-size:22px;color:var(--feuille);overflow-wrap:anywhere}
.spec .body{font-family:var(--texte);font-size:40px;font-weight:500;line-height:1;color:var(--foret)}
.scale{display:grid;gap:10px}
.scale div{display:grid;grid-template-columns:72px 1fr;gap:16px;align-items:baseline;border-top:1px solid var(--filet);padding-top:10px}
.scale code{font:500 12px/1 ui-monospace,Menlo,monospace;color:var(--gris)}

/* Motifs et supports */
.pattern{width:100%;height:auto;border-radius:6px;aspect-ratio:2/1}
.mock{border-radius:6px;overflow:hidden;position:relative;min-width:0}
.bag{background:#E6D9BC;padding:32px 24px;display:grid;place-items:center}
.bag .sack{width:min(100%,250px);aspect-ratio:3/4;background:var(--papier);border-radius:10px 10px 18px 18px;position:relative;overflow:hidden;display:grid;grid-template-rows:auto 1fr auto;box-shadow:0 18px 30px -18px rgba(60,40,10,.45)}
.sack .top{height:22px;background:repeating-linear-gradient(90deg,#d9cba9 0 6px,#e9dfc6 6px 12px)}
.sack .mid{display:grid;place-items:center;padding:16px 18px 6px;gap:10px;text-align:center}
.sack .mid svg{width:78%}
.sack .prod{font:800 22px/1 var(--display);color:var(--foret)}
.sack .kg{font:700 11px/1 var(--texte);letter-spacing:.14em;color:var(--terre);text-transform:uppercase}
.sack .foot{background:var(--foret);color:var(--pousse);font:700 10px/1 var(--texte);letter-spacing:.12em;text-transform:uppercase;padding:12px;text-align:center}
.sign{background:#7f8a83;padding:40px 24px;display:grid;place-items:center}
.sign .board{background:var(--foret);border-radius:4px;padding:22px 28px;width:min(100%,360px);border-bottom:10px solid #0b2a1d}
.sign .board svg{width:100%}
.phone{background:var(--sable);padding:28px 24px;display:grid;place-items:center}
.phone .screen{width:min(100%,230px);background:#fff;border-radius:22px;border:7px solid var(--encre);padding:18px 14px;display:grid;gap:12px;justify-items:center}
.avatar{width:84px;height:84px;border-radius:50%;background:var(--foret);display:grid;place-items:center}
.avatar svg{width:62%}
.post{width:100%;aspect-ratio:1;border-radius:8px;background:var(--feuille);display:grid;align-content:end;padding:14px;color:#fff;font:800 19px/1.05 var(--display);position:relative;overflow:hidden}
.post svg.pattern{position:absolute;inset:0;height:100%;border-radius:0;opacity:.9}
.post span{position:relative}
.card{background:#D8CFBB;padding:32px 24px;display:grid;place-items:center;gap:14px}
.card .bc{width:min(100%,300px);aspect-ratio:85/55;border-radius:4px;background:#fff;padding:18px;display:grid;align-content:space-between;box-shadow:0 10px 24px -14px rgba(0,0,0,.4)}
.card .bc.back{background:var(--foret);place-items:center}
.card .bc svg{width:62%}
.card .bc.back svg{width:30%}
.bc small{font:500 10px/1.5 var(--texte);color:var(--gris)}
.bc small b{display:block;color:var(--foret);font:700 12px/1.3 var(--texte)}

/* Règles */
.rules{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))}
.rule{background:#fff;border:1px solid var(--filet);border-radius:6px;padding:20px;display:grid;gap:12px;align-content:start;min-width:0}
.rule .v{height:110px;display:grid;place-items:center;background:var(--papier);border-radius:4px;overflow:hidden}
.rule .v svg{height:70px;width:auto}
.rule p{font-size:14px;color:var(--gris)}
.rule h3{font-size:16px;font-family:var(--texte)}
.no h3{color:#A0381E}
.clear{position:relative;padding:18px;outline:1.5px dashed var(--soleil);outline-offset:0}
.clear svg{height:56px!important}
.fx-stretch svg{transform:scaleX(1.5)}
.fx-rot svg{transform:rotate(-14deg)}
.fx-busy{background:repeating-linear-gradient(45deg,var(--feuille) 0 10px,var(--soleil) 10px 20px)!important}
.tilde-rule{width:72px;height:auto}
footer.band{padding-block:40px;font-size:13px;color:var(--gris)}
footer .wrap{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px}
@media (prefers-reduced-motion:no-preference){.hero .logo{animation:rise .9s cubic-bezier(.2,.7,.2,1) both}@keyframes rise{from{transform:translateY(10px)}to{transform:none}}}
</style>

<section class="band sable">
  <div class="wrap hero">
    <div class="head">
      <span class="eyebrow">Identité visuelle · Proposition de refonte</span>
      <h1>Suñu Meññeef</h1>
      <p class="lead">« Notre production », en wolof. Une marque de produits agricoles locaux qui doit se lire sur un sac de 25 kg, une enseigne de bord de route et une photo de profil de 40 pixels.</p>
      <div class="meta"><span><b>Marque</b> Suñu Meññeef</span><span><b>Livrables</b> logo principal, version compacte, palette, typographie, motifs, usages</span></div>
    </div>
    ${svg('logo-horizontal.svg', 'logo', 'Logo Suñu Meññeef, version horizontale')}
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="head">
      <span class="eyebrow">01 · Diagnostic du logo actuel</span>
      <h2>Le capital à garder, les défauts à corriger</h2>
    </div>
    <div class="ba">
      <figure><span class="tag old">Avant</span><div class="frame">${orig ? `<img src="${orig}" alt="Logo Suñu Meññeef actuel">` : ''}</div></figure>
      <figure><span class="tag new">Après</span><div class="frame">${svg('logo-horizontal.svg', '', 'Logo Suñu Meññeef redessiné')}</div></figure>
    </div>
    <div class="grid g2">
      <div class="grid">
        <h3>À conserver</h3>
        <ul class="points">
          <li><span>Le personnage-pousse : un cercle orange posé sur deux feuilles. C'est l'idée la plus forte du logo, elle reste au centre du symbole.</span></li>
          <li><span>Le couple vert profond et vert feuille, plus l'orange. Les nouvelles teintes restent à quelques degrés des anciennes pour ne pas perdre la reconnaissance.</span></li>
          <li><span>Le « M » dessiné par des feuilles, mais séparé du mot.</span></li>
        </ul>
      </div>
      <div class="grid">
        <h3>À corriger</h3>
        <ul class="points minus">
          <li><span>Le M fondu dans le symbole fait lire « eññeef ». Le nom n'est plus lisible sans le dessin.</span></li>
          <li><span>Le dégradé sur la grande feuille disparaît en sérigraphie, en broderie et en impression une couleur sur sac.</span></li>
          <li><span>Trois personnalités typographiques : « Suñu » en italique léger, « Meññeef » en gras compact, deux verts différents. Les deux mots ne forment pas un ensemble.</span></li>
          <li><span>Le symbole ne fonctionne pas seul : retiré du mot, il perd sa lettre. Pas de version pour un avatar ou un tampon.</span></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="band sable">
  <div class="wrap">
    <div class="head">
      <span class="eyebrow">02 · La référence GROWZA (Own Visual, Behance)</span>
      <h2>Ce qui a été analysé, et ce qui ne l'a pas été</h2>
      <p class="lead">Les planches de la référence n'étaient pas accessibles depuis l'environnement de travail. L'analyse repose sur le texte du projet et les métadonnées lisibles des images.</p>
    </div>
    <div class="grid g2">
      <ul class="points">
        <li><span><span class="conf">Confirmé</span>Positionnement : engrais organique, idée « Grow Green, Grow Healthy ».</span></li>
        <li><span><span class="conf">Confirmé</span>Intention déclarée : identité minimale et forte, logo épuré, palette verte naturelle, typographie grasse pour la lisibilité.</span></li>
        <li><span><span class="conf">Confirmé</span>Palette citée sur une planche : « Selective Yellow » et « India Green ». Un jaune d'or associé à un vert franc.</span></li>
        <li><span><span class="conf">Confirmé</span>L'identité est présentée sur un sac de 5 kg, avec les bénéfices produit en hiérarchie claire.</span></li>
      </ul>
      <ul class="points minus">
        <li><span><span class="conf">Non vérifié</span>La forme exacte du symbole GROWZA, son tracé et sa typographie. Rien n'en est repris ici, ce qui écarte aussi tout risque de copie.</span></li>
        <li><span><span class="conf">Supposition</span>Mise en page des planches en grands aplats de couleur, typique de ce studio. Reprise comme principe général, pas comme modèle.</span></li>
      </ul>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="head">
      <span class="eyebrow">03 · Principes retenus</span>
      <h2>Quatre règles tirées de la référence, adaptées à la marque</h2>
    </div>
    <div class="grid g4">
      <div class="grid"><h3>Aplats, pas de dégradé</h3><p>Toutes les formes sont des couleurs pleines. Le logo s'imprime en une, deux ou trois couleurs sans perte.</p></div>
      <div class="grid"><h3>Un vert profond, un vert vif, un or</h3><p>Le trio de la référence, recalé sur les couleurs déjà connues de Suñu Meññeef.</p></div>
      <div class="grid"><h3>Typographie grasse et lisible</h3><p>Un seul caractère, deux graisses. Le nom se lit en entier, à toute taille.</p></div>
      <div class="grid"><h3>Un symbole autonome</h3><p>Une forme simple qui tient seule sur un avatar, un tampon ou une étiquette de 15 mm.</p></div>
    </div>
  </div>
</section>

<section class="band foret">
  <div class="wrap">
    <div class="head">
      <span class="eyebrow">04 · Le symbole</span>
      <h2>Une récolte qui forme un M, une personne qui se lève</h2>
      <p class="lead">Deux grandes feuilles dressent les jambages du M. Une jeune pousse en V en dessine le creux. Le soleil posé au-dessus devient une tête : le producteur, bras levés, au milieu de sa récolte.</p>
    </div>
    <div class="grid g2" style="align-items:center">
      <div class="construct">
        <svg viewBox="-10 -10 140 140" role="img" aria-label="Construction du symbole sur une grille de 120 unités">
          <g stroke="#DCD3BE" stroke-width=".4" fill="none">${Array.from({ length: 13 }, (_, i) => `<line x1="${i * 10}" y1="0" x2="${i * 10}" y2="120"/><line x1="0" y1="${i * 10}" x2="120" y2="${i * 10}"/>`).join('')}</g>
          <g opacity=".92">${symBody}</g>
          <g fill="none" stroke="#7C4F2A" stroke-width=".6" stroke-dasharray="2 2"><circle cx="60" cy="40" r="15"/><line x1="34" y1="108" x2="24" y2="12"/><line x1="86" y1="108" x2="96" y2="12"/><line x1="60" y1="98" x2="41" y2="50"/><line x1="60" y1="98" x2="79" y2="50"/><line x1="0" y1="108" x2="120" y2="108"/></g>
          <g font-family="DM Sans, sans-serif" font-size="5" fill="#5E6B62"><text x="0" y="117">120 × 120 · base commune y 108</text></g>
        </svg>
      </div>
      <div class="legend">
        <div><span class="sw" style="background:#fff;border:6px solid var(--foret);outline:1px solid #ffffff55"></span><p><b>Les feuilles-jambages.</b> Inclinées de 6°, elles s'ouvrent vers le haut : la croissance. Leur flanc intérieur est plus bombé, pour que la forme reste organique et ne devienne pas un pictogramme.</p></div>
        <div><span class="sw" style="background:var(--feuille)"></span><p><b>La pousse en V.</b> Les deux cotylédons d'une graine qui germe, et le creux du M. En vert vif : c'est la nouvelle saison.</p></div>
        <div><span class="sw" style="background:var(--soleil)"></span><p><b>Le soleil-tête.</b> Hérité du logo actuel. Il dit à la fois la lumière qui fait pousser et la personne derrière la production.</p></div>
        <div><span class="sw" style="background:var(--pousse)"></span><p><b>Le tilde-feuille.</b> Les « ñ » du mot-symbole portent une feuille couchée à la place du tilde standard. Le signe wolof reste lisible et devient la signature de la marque.</p></div>
      </div>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="head">
      <span class="eyebrow">05 · Déclinaisons</span>
      <h2>Logo principal, version compacte, symbole</h2>
      <p class="lead">Tous les fichiers sont vectoriels, texte vectorisé. Aucune police à installer pour les ouvrir.</p>
    </div>
    <div class="grid g2">
      <div><div class="tile">${svg('logo-horizontal.svg', '', 'Logo horizontal')}</div><p class="caption">Logo principal horizontal. Documents, site, véhicules, enseignes larges.</p></div>
      <div><div class="tile sand">${svg('logo-vertical.svg', '', 'Logo vertical')}</div><p class="caption">Version compacte verticale. Emballages, étiquettes, formats carrés.</p></div>
    </div>
    <div class="grid g4">
      <div><div class="tile">${svg('symbole.svg', '', 'Symbole')}</div><p class="caption">Symbole seul, couleurs.</p></div>
      <div><div class="tile dark">${svg('symbole-negatif.svg', '', 'Symbole en négatif')}</div><p class="caption">Négatif sur forêt.</p></div>
      <div><div class="tile sun">${svg('symbole-mono-foret.svg', '', 'Symbole monochrome')}</div><p class="caption">Une couleur. Tampon, broderie, sac imprimé.</p></div>
      <div><div class="tile" style="gap:18px;display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:center">${[16, 24, 32, 48].map((h) => strip(f['symbole.svg']).replace('<svg ', `<svg style="width:${h}px" aria-hidden="true" `)).join('')}</div><p class="caption">Lisible dès 16 px de haut.</p></div>
    </div>
    <div class="grid g2">
      <div><div class="tile dark">${svg('logo-horizontal-negatif.svg', '', 'Logo horizontal en négatif')}</div><p class="caption">Négatif. Sur photo sombre ou fond forêt.</p></div>
      <div><div class="tile">${svg('logo-horizontal-mono.svg', '', 'Logo horizontal monochrome')}</div><p class="caption">Monochrome forêt. Fax, gravure, marquage à chaud.</p></div>
    </div>
  </div>
</section>

<section class="band sable">
  <div class="wrap">
    <div class="head">
      <span class="eyebrow">06 · Palette</span>
      <h2>Six couleurs, trois qui portent la marque</h2>
    </div>
    <div class="pal">
      ${[
        ['Forêt', '#123D2B', 'R18 G61 B43', 'Texte, fonds, version mono', '#fff'],
        ['Feuille', '#2E9A4B', 'R46 G154 B75', 'Couleur de marque, pousse', '#fff'],
        ['Soleil', '#F2A516', 'R242 G165 B22', 'Accent, une touche par support', '#123D2B'],
        ['Pousse', '#A9CF3D', 'R169 G207 B61', 'Accent sur fond forêt', '#123D2B'],
        ['Sable', '#F4EEDF', 'R244 G238 B223', 'Fond, papier, kraft', '#123D2B'],
        ['Terre', '#7C4F2A', 'R124 G79 B42', 'Mentions, origine, sol', '#fff'],
      ].map(([n, h, rgb, u, t]) => `<div class="chip"><div class="c" style="background:${h};color:${t}">${n}</div><div class="i"><b>${n}</b><code>${h}</code><code>${rgb}</code><span style="color:var(--gris)">${u}</span></div></div>`).join('')}
    </div>
    <div class="grid" style="gap:10px">
      <p class="caption" style="margin:0">Répartition sur un support type</p>
      <div class="ratio" aria-label="Sable 50 %, Forêt 30 %, Feuille 14 %, Soleil 6 %"><span style="flex:50;background:var(--papier);border:1px solid var(--filet)"></span><span style="flex:30;background:var(--foret)"></span><span style="flex:14;background:var(--feuille)"></span><span style="flex:6;background:var(--soleil)"></span></div>
      <p class="caption" style="margin:0">Contrastes : forêt sur sable 10,5:1, blanc sur forêt 12,2:1. Le vert feuille sur blanc (3,6:1) est réservé aux grands titres et au logo, jamais au texte courant.</p>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="head">
      <span class="eyebrow">07 · Typographie</span>
      <h2>Bricolage Grotesque pour la voix, DM Sans pour l'information</h2>
      <p class="lead">Deux familles libres (licence SIL Open Font), disponibles sur Google Fonts, avec le ñ et tous les accents du français et du wolof.</p>
    </div>
    <div class="grid g2">
      <div class="spec">
        <span class="eyebrow">Titres · Bricolage Grotesque 800 et 500</span>
        <div class="big">Meññeef</div>
        <div class="alpha">Aa Bb Cc Ëë Ññ Ŋŋ Éé 0123456789</div>
        <p>Grotesque à l'empâtement légèrement irrégulier : assez de caractère pour un produit de la terre, assez de rigueur pour une étiquette.</p>
      </div>
      <div class="spec">
        <span class="eyebrow">Texte · DM Sans 400, 500, 700</span>
        <div class="body">Mil, niébé, arachide.</div>
        <div class="scale">
          <div><code>H1 56/58</code><span style="font:800 28px/1.1 var(--display);color:var(--foret)">Récolte 2026</span></div>
          <div><code>H2 32/36</code><span style="font:700 21px/1.2 var(--display)">Arachide décortiquée</span></div>
          <div><code>Corps 16/26</code><span>Cultivé à Niayes, ensaché sans additif.</span></div>
          <div><code>Mention 12/16</code><span style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:var(--terre)">Poids net 25 kg</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="band sable">
  <div class="wrap">
    <div class="head">
      <span class="eyebrow">08 · Formes et motifs</span>
      <h2>Le symbole décomposé en vocabulaire</h2>
      <p class="lead">Feuille, pousse et graine deviennent un motif de semis en quinconce, incliné comme un champ vu en biais. Il habille les fonds, les sacs et les publications, jamais derrière le logo.</p>
    </div>
    <div class="grid g3">
      <div>${leafPattern('#2E9A4B', '#123D2B', 'p1')}<p class="caption">Semis sur forêt</p></div>
      <div>${leafPattern('#DCCFAE', '#F4EEDF', 'p2')}<p class="caption">Semis ton sur ton, kraft</p></div>
      <div>${leafPattern('#123D2B', '#F2A516', 'p3')}<p class="caption">Semis sur soleil, promotions</p></div>
    </div>
    <div class="grid g3" style="align-items:center">
      <div class="tile"><svg class="tilde-rule" viewBox="0 0 80 24" aria-label="Tilde-feuille"><path fill="#2E9A4B" d="M4 16C14 2 26 10 40 12C52 14 62 6 76 8C66 22 54 18 40 16C28 14 16 20 4 16Z"/></svg></div>
      <div class="tile"><svg viewBox="0 0 120 60" style="width:120px" aria-label="Feuille seule"><path fill="#123D2B" d="M20 54C10 40 14 16 34 6C40 22 36 42 20 54Z"/><path fill="#2E9A4B" d="M60 54C54 44 56 30 70 22C74 34 70 46 60 54Z"/><circle cx="100" cy="30" r="10" fill="#F2A516"/></svg></div>
      <div class="grid" style="gap:8px"><h3>Règle du motif</h3><p>Une seule couleur de motif par fond. Opacité pleine, pas de transparence superposée. Le logo se pose toujours sur un aplat réservé.</p></div>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="head">
      <span class="eyebrow">09 · Supports</span>
      <h2>Mises en situation</h2>
      <p class="lead">Présentations séparées du logo : les effets de volume ne concernent que les maquettes.</p>
    </div>
    <div class="grid g2">
      <div class="mock bag"><div class="sack"><div class="top"></div><div class="mid">${svg('logo-vertical.svg', '', 'Logo sur sac')}<span class="prod">Arachide</span><span class="kg">Poids net · 25 kg</span></div><div class="foot">Produit au Sénégal</div></div></div>
      <div class="mock sign"><div class="board">${svg('logo-horizontal-negatif.svg', '', 'Logo sur enseigne').replace(/<rect[^>]*\/>/, '')}</div></div>
      <div class="mock phone"><div class="screen"><div class="avatar">${strip(f['symbole-negatif.svg']).replace(/<rect[^>]*\/>/, '').replace('<svg ', '<svg aria-hidden="true" ')}</div><b style="font:700 14px var(--texte);color:var(--foret)">suñu.meññeef</b><div class="post">${leafPattern('#3DAA59', '#2E9A4B', 'p4')}<span>Récolte de mil :<br>les sacs arrivent lundi.</span></div></div></div>
      <div class="mock card"><div class="bc">${svg('logo-horizontal.svg', '', 'Logo sur carte de visite')}<small><b>Aminata Ndiaye</b>Responsable commerciale<br>+221 77 000 00 00</small></div><div class="bc back">${strip(f['symbole-negatif.svg']).replace(/<rect[^>]*\/>/, '').replace('<svg ', '<svg aria-hidden="true" ')}</div></div>
    </div>
    <p class="caption">Nom, numéro et produits des maquettes sont des exemples.</p>
  </div>
</section>

<section class="band sable">
  <div class="wrap">
    <div class="head">
      <span class="eyebrow">10 · Règles d'usage</span>
      <h2>Protéger le logo</h2>
    </div>
    <div class="rules">
      <div class="rule"><div class="v"><div class="clear">${strip(f['symbole.svg']).replace('<svg ', '<svg aria-hidden="true" ')}</div></div><h3>Zone de protection</h3><p>Un espace libre égal au diamètre du soleil, multiplié par deux, autour du logo.</p></div>
      <div class="rule"><div class="v" style="font:700 15px var(--texte);color:var(--foret);text-align:center;line-height:1.5">Symbole ≥ 16 px<br>Horizontal ≥ 30 mm<br>Vertical ≥ 20 mm</div><h3>Tailles minimales</h3><p>En dessous, utiliser le symbole seul.</p></div>
      <div class="rule no"><div class="v fx-stretch">${strip(f['symbole.svg']).replace('<svg ', '<svg aria-hidden="true" ')}</div><h3>Ne pas déformer</h3><p>Toujours redimensionner en proportion.</p></div>
      <div class="rule no"><div class="v fx-rot">${strip(f['symbole.svg']).replace('<svg ', '<svg aria-hidden="true" ')}</div><h3>Ne pas pivoter</h3><p>Le symbole reste vertical, la base au sol.</p></div>
      <div class="rule no"><div class="v fx-busy">${strip(f['symbole.svg']).replace('<svg ', '<svg aria-hidden="true" ')}</div><h3>Pas de fond chargé</h3><p>Poser sur un aplat de la palette ou une photo calme.</p></div>
      <div class="rule no"><div class="v" style="font:800 26px var(--display);color:var(--foret)">Menneef</div><h3>Ne jamais retirer le tilde</h3><p>« Meññeef » sans ñ change le mot. Les fichiers fournis le dessinent déjà.</p></div>
    </div>
  </div>
</section>

<footer class="band">
  <div class="wrap"><span>Suñu Meññeef · Proposition d'identité visuelle · Octobre 2026</span><span>Fichiers SVG vectorisés dans branding/sunu-menneef/</span></div>
</footer>
`;

fs.writeFileSync(outFile, html);
console.log('ok', (html.length / 1024).toFixed(0) + ' Ko');
