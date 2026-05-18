import { fetchEvents } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

function esc(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function toICalDate(iso: string, offsetDays = 0): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + offsetDays));
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('');
}

// RFC 5545 line folding: max 75 octets per line, continuation lines start with a space.
function fold(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let start = 0;
  while (start < line.length) {
    chunks.push((start === 0 ? '' : ' ') + line.slice(start, start + (start === 0 ? 75 : 74)));
    start += start === 0 ? 75 : 74;
  }
  return chunks.join('\r\n');
}

export async function GET() {
  const events = await fetchEvents();
  const stamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Caravana Gateway 077//Events//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Caravana Gateway 077',
    'X-WR-CALDESC:Calendário de eventos de tecnologia no Brasil',
  ];

  for (const ev of events) {
    if (!ev.dataInicio) continue;

    // iCal DTEND is exclusive, so add one day beyond the last day of the event.
    const dtend = toICalDate(ev.dataFinal ?? ev.dataInicio, 1);
    const location = [ev.cidade, ev.uf].filter(Boolean).join(', ');

    lines.push(
      'BEGIN:VEVENT',
      fold(`UID:${ev.id}@caravana-gw077`),
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${toICalDate(ev.dataInicio)}`,
      `DTEND;VALUE=DATE:${dtend}`,
      fold(`SUMMARY:${esc(ev.nome)}`),
    );

    if (ev.descricao) lines.push(fold(`DESCRIPTION:${esc(ev.descricao)}`));
    if (location)     lines.push(fold(`LOCATION:${esc(location)}`));
    if (ev.linkSite)  lines.push(fold(`URL:${ev.linkSite}`));
    if (ev.modalidade) lines.push(`CATEGORIES:${esc(ev.modalidade)}`);

    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  return new Response(lines.join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="caravana-gw077.ics"',
      'Cache-Control': 'no-store',
    },
  });
}
