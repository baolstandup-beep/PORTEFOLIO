import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import world110 from 'world-atlas/countries-110m.json';
import world50 from 'world-atlas/countries-50m.json';

type Countries = FeatureCollection<Geometry, { name: string }>;

const toCountries = (topo: unknown): Countries => {
  const t = topo as Topology<{ countries: GeometryCollection<{ name: string }> }>;
  return feature(t, t.objects.countries) as unknown as Countries;
};

/** Monde basse définition (globe, cartes larges). */
export const WORLD: Countries = toCountries(world110);

/** Monde moyenne définition (cartes du Sénégal). */
const WORLD_50: Countries = toCountries(world50);

const byId = (id: string) =>
  WORLD_50.features.find((f) => String(f.id) === id) as Feature<Geometry, { name: string }>;

/** Codes ISO 3166 numériques. */
export const SENEGAL = byId('686');
export const GAMBIA = byId('270');
export const WEST_AFRICA_NEIGHBOURS: Feature<Geometry, { name: string }>[] = [
  '478', // Mauritanie
  '466', // Mali
  '324', // Guinée
  '624', // Guinée-Bissau
].map(byId);
