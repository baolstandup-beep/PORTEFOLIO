// Replace each empty logo value with the path to an approved client logo.
// The names are shown as typographic stand-ins until individual logo files are supplied.
const clients = [
  { id: 'porokhane-soow', name: 'Porokhane Soow', logo: 'assets/clients/porokhane-soow.jpg' },
  { id: 'eldasy', name: 'Restaurant Eldasy', logo: 'assets/clients/restaurant-eldasy.jpg' },
  { id: 'camusat', name: 'Camusat', logo: 'assets/clients/camusat.jpg' },
  { id: 'quincaillerie-mouridoula', name: 'Quincaillerie Mouridoulla', logo: 'assets/clients/quincaillerie-mouridoulla.jpg' },
  { id: 'bkk', name: 'Boutique Keur Khadim', logo: 'assets/clients/boutique-keur-khadim.jpg' },
  { id: 'bio-mbacke', name: 'Bio Mbacké', logo: 'assets/clients/bio-mbacke.jpg' },
  { id: 'baol-office', name: 'Baol Office', logo: 'assets/clients/baol-office.jpg' },
  { id: 'mbeete-mi', name: 'Mbeeté mi', logo: 'assets/clients/mbeete-mi.jpg' },
  { id: 'ctm', name: 'CTM — Commune de Touba Mosquée', logo: 'assets/clients/ctm-commune-touba-mosquee.jpg' }
];

function renderClientLogo(client) {
  const card = document.createElement('div');
  card.className = 'client-logo-card';
  card.setAttribute('role', 'listitem');
  card.dataset.client = client.id;

  const fallback = () => {
    card.classList.remove('client-logo-card--image');
    const name = document.createElement('span');
    name.textContent = client.name;
    card.replaceChildren(name);
  };

  if (!client.logo) {
    fallback();
    return card;
  }

  const logo = document.createElement('img');
  card.classList.add('client-logo-card--image');
  logo.src = client.logo;
  logo.alt = `Logo de ${client.name}`;
  logo.width = 130;
  logo.height = 65;
  logo.loading = 'lazy';
  logo.decoding = 'async';
  logo.addEventListener('error', fallback, { once: true });
  card.append(logo);
  return card;
}

function renderClientLogos() {
  const track = document.getElementById('client-logo-track');
  if (!track || !clients.length) return;

  const marqueeClients = [...clients, ...clients];
  const groups = [0, 1].map((copy) => {
    const group = document.createElement('div');
    group.className = 'client-logo-group';
    group.setAttribute('role', 'list');
    if (copy) group.setAttribute('aria-hidden', 'true');
    marqueeClients.slice(copy * clients.length, (copy + 1) * clients.length)
      .forEach((client) => group.append(renderClientLogo(client)));
    return group;
  });

  track.replaceChildren(...groups);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderClientLogos, { once: true });
} else {
  renderClientLogos();
}
