import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { site } from '@/lib/site';
import { Logo } from './logo';

export function SiteFooter() {
  const wa = site.contactWhatsapp.replace(/\D/g, '');
  return (
    <footer className="no-print bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div className="space-y-4">
          <Logo light size="lg" />
          <p className="max-w-xs text-sm leading-relaxed text-white/65">
            Bootcamp de renforcement de capacités en infographie et intelligence artificielle, 80 % gratuit.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <h2 className="font-bold uppercase tracking-wide text-sun">Organisation</h2>
          <p className="font-semibold">{site.organizer}</p>
          <p className="flex items-center gap-2 text-white/70">
            <MapPin className="h-4 w-4 shrink-0" /> {site.location}
          </p>
          {site.contactPhone && (
            <p className="flex items-center gap-2 text-white/70">
              <Phone className="h-4 w-4 shrink-0" />
              <a href={`tel:${site.contactPhone.replace(/\s/g, '')}`} className="hover:text-white">{site.contactPhone}</a>
            </p>
          )}
          {wa && (
            <p className="flex items-center gap-2 text-white/70">
              <Phone className="h-4 w-4 shrink-0" />
              <a href={`https://wa.me/${wa}`} className="hover:text-white" rel="noopener">WhatsApp : {site.contactWhatsapp}</a>
            </p>
          )}
          {site.contactEmail && (
            <p className="flex items-center gap-2 text-white/70">
              <Mail className="h-4 w-4 shrink-0" />
              <a href={`mailto:${site.contactEmail}`} className="hover:text-white">{site.contactEmail}</a>
            </p>
          )}
        </div>
        <div className="space-y-3 text-sm">
          <h2 className="font-bold uppercase tracking-wide text-sun">Liens</h2>
          <ul className="space-y-2 text-white/70">
            <li><Link href="/candidater" className="hover:text-white">Déposer ma candidature</Link></li>
            <li><Link href="/partenaires" className="hover:text-white">Devenir partenaire</Link></li>
            <li><Link href="/#faq" className="hover:text-white">Questions fréquentes</Link></li>
            <li><Link href="/confidentialite" className="hover:text-white">Protection des données</Link></li>
            {site.facebook && <li><a href={site.facebook} className="hover:text-white" rel="noopener">Facebook</a></li>}
            {site.instagram && <li><a href={site.instagram} className="hover:text-white" rel="noopener">Instagram</a></li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-white/50 sm:px-6">
          © {new Date().getFullYear()} {site.organizer}. GRAPHIA — Créer · Innover · Transformer.
        </p>
      </div>
    </footer>
  );
}
