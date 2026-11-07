import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { site } from '@/lib/site';

export const metadata: Metadata = { title: 'Protection des données' };

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-black sm:text-4xl">Protection des données personnelles</h1>
        <div className="mt-8 space-y-6 leading-relaxed text-ink/80 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink">
          <p>
            Les informations recueillies par le formulaire de candidature GRAPHIA sont traitées par {site.organizer},
            organisateur du Bootcamp, conformément à la loi sénégalaise n° 2008-12 sur la protection des données à caractère personnel.
          </p>
          <h2>Pourquoi ces données ?</h2>
          <p>Uniquement pour étudier votre candidature, sélectionner les 50 participants, vous contacter au sujet de votre candidature et organiser le Bootcamp.</p>
          <h2>Qui y a accès ?</h2>
          <p>Seuls les membres de l’équipe d’organisation disposant d’un compte sécurisé. Vos données ne sont jamais publiées, vendues ni cédées à des tiers.</p>
          <h2>Combien de temps ?</h2>
          <p>Jusqu’à la fin de cette édition et de son rapport final, puis elles sont supprimées ou anonymisées, sauf si vous acceptez d’être recontacté pour les prochaines éditions.</p>
          <h2>Vos droits</h2>
          <p>
            Vous pouvez demander l’accès, la correction ou la suppression de vos données en contactant l’équipe d’organisation
            {site.contactEmail ? <> à <a className="font-semibold text-brand underline" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a></> : null}
            , en indiquant votre numéro de candidature.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
