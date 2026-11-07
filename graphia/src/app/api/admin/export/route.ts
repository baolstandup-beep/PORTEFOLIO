import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { adminFor } from '@/lib/auth';
import { audit, listCandidates, type Candidate } from '@/lib/candidates';
import { DURATIONS, LEVELS, PROFILES, SOFTWARE, STATUSES, WORK_MODES, GENDERS, labelOf } from '@/lib/constants';
import { formatPhone } from '@/lib/phone';
import { jsonError } from '@/lib/request';

export const runtime = 'nodejs';

const yn = (b: boolean | null) => (b === true ? 'Oui' : b === false ? 'Non' : '');
const date = (d: Date | string | null) =>
  d ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Dakar' }).format(new Date(d)) : '';
const profile = (c: Candidate) =>
  c.professional_profile === 'autre' && c.professional_profile_other
    ? `Autre : ${c.professional_profile_other}`
    : labelOf(PROFILES, c.professional_profile);

export async function GET(req: Request) {
  const admin = await adminFor('export');
  if (!admin) return jsonError('Accès refusé.', 403);
  const sp = new URL(req.url).searchParams;
  const format = sp.get('format') === 'pdf' ? 'pdf' : 'xlsx';
  const { rows } = await listCandidates({
    q: sp.get('q') ?? undefined,
    city: sp.get('ville') ?? undefined,
    profile: sp.get('profil') ?? undefined,
    level: sp.get('niveau') ?? undefined,
    status: sp.get('statut') ?? undefined,
    sort: sp.get('tri') ?? undefined,
    dir: sp.get('ordre') ?? undefined,
    perPage: 10_000,
  });
  await audit(null, admin.id, null, 'export', { format, count: rows.length, filters: Object.fromEntries(sp) });
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === 'xlsx') {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'GRAPHIA';
    const ws = wb.addWorksheet('Candidatures', { views: [{ state: 'frozen', ySplit: 1 }] });
    ws.columns = [
      { header: 'N° candidature', key: 'num', width: 14 },
      { header: 'Prénom', key: 'first', width: 16 },
      { header: 'Nom', key: 'last', width: 16 },
      { header: 'Téléphone', key: 'phone', width: 18 },
      { header: 'WhatsApp', key: 'wa', width: 18 },
      { header: 'E-mail', key: 'email', width: 26 },
      { header: 'Ville', key: 'city', width: 14 },
      { header: 'Quartier', key: 'nb', width: 14 },
      { header: 'Date de naissance', key: 'birth', width: 14 },
      { header: 'Sexe', key: 'gender', width: 8 },
      { header: 'Profil', key: 'profile', width: 28 },
      { header: 'Niveau', key: 'level', width: 13 },
      { header: 'Expérience', key: 'duration', width: 16 },
      { header: 'Cadre de travail', key: 'work', width: 22 },
      { header: 'Clients', key: 'clients', width: 8 },
      { header: 'Portfolio', key: 'pf', width: 9 },
      { header: 'Logiciels', key: 'soft', width: 40 },
      { header: 'Utilise l’IA', key: 'ai', width: 10 },
      { header: 'Outils IA', key: 'aitools', width: 24 },
      { header: 'Compétence à améliorer', key: 'skill', width: 28 },
      { header: 'Principal défi', key: 'challenge', width: 34 },
      { header: 'Motivation', key: 'motivation', width: 50 },
      { header: 'Attentes', key: 'expect', width: 50 },
      { header: 'Ambitions', key: 'ambition', width: 50 },
      { header: 'Utilisation des acquis', key: 'usage', width: 50 },
      { header: 'Portfolio (lien)', key: 'pfurl', width: 30 },
      { header: 'Behance', key: 'be', width: 30 },
      { header: 'Instagram', key: 'ig', width: 30 },
      { header: 'Facebook', key: 'fb', width: 30 },
      { header: 'Disponible 5 jours', key: 'avail', width: 10 },
      { header: 'Engagement', key: 'commit', width: 10 },
      { header: 'Statut', key: 'status', width: 14 },
      { header: 'Score /25', key: 'score', width: 9 },
      { header: 'Notes internes', key: 'notes', width: 40 },
      { header: "Date d'inscription", key: 'created', width: 17 },
    ];
    for (const c of rows) {
      ws.addRow({
        num: c.application_number,
        first: c.first_name,
        last: c.last_name,
        phone: formatPhone(c.phone_normalized),
        wa: c.whatsapp ? formatPhone(c.whatsapp) : '',
        email: c.email ?? '',
        city: c.city,
        nb: c.neighborhood ?? '',
        birth: c.birth_date ? String(c.birth_date).slice(0, 10) : '',
        gender: labelOf(GENDERS, c.gender),
        profile: profile(c),
        level: labelOf(LEVELS, c.experience_level),
        duration: labelOf(DURATIONS, c.experience_duration),
        work: c.work_mode ? labelOf(WORK_MODES, c.work_mode) : '',
        clients: yn(c.has_clients),
        pf: yn(c.has_portfolio),
        soft: [...c.software_skills.map((s) => labelOf(SOFTWARE, s)), c.software_other].filter(Boolean).join(', '),
        ai: yn(c.uses_ai),
        aitools: c.ai_tools ?? '',
        skill: c.skill_to_improve ?? '',
        challenge: c.main_challenge ?? '',
        motivation: c.motivation,
        expect: c.expectations,
        ambition: c.professional_ambition,
        usage: c.knowledge_usage,
        pfurl: c.portfolio_url ?? '',
        be: c.behance_url ?? '',
        ig: c.instagram_url ?? '',
        fb: c.facebook_url ?? '',
        avail: yn(c.available_five_days),
        commit: yn(c.commitment),
        status: labelOf(STATUSES, c.status),
        score: c.selection_score ?? '',
        notes: c.admin_notes ?? '',
        created: date(c.created_at),
      });
    }
    const header = ws.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF078D43' } };
    ws.autoFilter = { from: 'A1', to: { row: 1, column: ws.columns.length } };
    // Empêche l'interprétation de formules dans Excel (injection CSV/XLSX)
    ws.eachRow((row, i) => {
      if (i === 1) return;
      row.eachCell((cell) => {
        if (typeof cell.value === 'string' && /^[=+\-@]/.test(cell.value)) cell.value = `'${cell.value}`;
        cell.alignment = { vertical: 'top', wrapText: false };
      });
    });
    const buf = await wb.xlsx.writeBuffer();
    return new Response(new Uint8Array(buf as ArrayBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="graphia-candidatures-${stamp}.xlsx"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(7, 141, 67);
  doc.text('GRAPHIA — Liste des candidatures', 14, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(`${rows.length} candidature(s) — export du ${date(new Date())} — document confidentiel`, 14, 21);
  autoTable(doc, {
    startY: 26,
    head: [['N°', 'Nom complet', 'Téléphone', 'Ville', 'Profil', 'Niveau', 'Dispo.', 'Score', 'Statut', 'Inscription']],
    body: rows.map((c) => [
      c.application_number,
      `${c.last_name.toUpperCase()} ${c.first_name}`,
      formatPhone(c.phone_normalized),
      c.city,
      profile(c),
      labelOf(LEVELS, c.experience_level),
      yn(c.available_five_days),
      c.selection_score ?? '—',
      labelOf(STATUSES, c.status),
      date(c.created_at),
    ]),
    styles: { fontSize: 8, cellPadding: 1.8 },
    headStyles: { fillColor: [7, 141, 67], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawPage: () => {
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`Page ${doc.getNumberOfPages()}`, doc.internal.pageSize.getWidth() - 25, doc.internal.pageSize.getHeight() - 8);
    },
  });
  const pdf = doc.output('arraybuffer');
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="graphia-candidatures-${stamp}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
