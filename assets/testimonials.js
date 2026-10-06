(() => {
  'use strict';

  // Contenus fournis par le propriétaire du portfolio.
  const testimonials = [
    {
      name: 'Abdou Salam Lô',
      role: 'Gérant — Restaurant Mbecte Mi',
      quote: 'Nous avons apprécié la qualité du travail, la créativité et surtout la compréhension rapide de nos besoins. Notre communication est aujourd’hui beaucoup plus professionnelle et attractive.'
    },
    {
      name: 'Ndiaya Sylla',
      role: 'Gérante — Boutique Keur Khadim',
      quote: 'Un service sérieux, réactif et très professionnel. Le résultat correspond parfaitement à l’image que nous voulions donner à notre boutique. Nous sommes très satisfaits de cette collaboration.'
    },
    {
      name: 'Dr Penda Diop',
      role: 'Directrice — BIO Mbacké',
      quote: 'J’ai particulièrement apprécié l’écoute, la disponibilité et la qualité des propositions. Le travail réalisé nous a permis d’avoir une communication plus claire, moderne et cohérente.'
    },
    {
      name: 'Ibrahima Sow',
      role: 'Fondateur — Ndamatou Fitness',
      quote: 'Une excellente collaboration, avec des visuels modernes et adaptés à notre univers. Le travail apporte une vraie valeur à l’image de Ndamatou Fitness et à notre présence sur les réseaux sociaux.'
    },
    {
      name: 'Aissatou',
      role: 'Gérante — Élégance by Aïcha',
      quote: 'Le travail réalisé reflète parfaitement l’élégance et l’identité de notre marque. J’ai apprécié la créativité, le souci du détail et la capacité à transformer nos idées en une communication professionnelle.'
    },
    {
      name: 'Mamadou Moustapha Dieng',
      role: 'Directeur — SETRANS SARL',
      quote: 'Nous avons trouvé un partenaire à l’écoute, capable de comprendre les exigences de notre secteur et de proposer une communication professionnelle, moderne et cohérente avec l’image de SETRANS.'
    }
  ];

  function createTestimonialCard(testimonial) {
    const card = document.createElement('article');
    card.className = 'testimonial-card';
    // Only static markup enters innerHTML; client content uses textContent.
    card.innerHTML = `
      <span class="testimonial-mark" aria-hidden="true">“</span>
      <header class="testimonial-card-header"><h3></h3><p class="testimonial-role"></p></header>
      <div class="testimonial-rating" role="img" aria-label="5 étoiles sur 5">
        ${Array.from({ length: 5 }, () => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01Z"/></svg>').join('')}
      </div>
      <blockquote><p></p></blockquote>`;
    card.querySelector('h3').textContent = testimonial.name;
    card.querySelector('.testimonial-role').textContent = testimonial.role;
    card.querySelector('blockquote p').textContent = `« ${testimonial.quote} »`;
    return card;
  }

  function renderTestimonialsSection(container, items) {
    if (container) container.replaceChildren(...items.map(createTestimonialCard));
  }

  renderTestimonialsSection(document.querySelector('[data-testimonials]'), testimonials);
})();
