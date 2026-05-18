import { cache } from 'react';
import type { AirtableRecord, Event, SchemaOptions } from '@/types/event';

const BASE_URL = 'https://api.airtable.com/v0';
const BASE_ID = 'appYTSd9iaa04vcec';
const TABLE_ID = 'tbltZLRW3qBvQo3R3';

function auth(): HeadersInit {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) throw new Error('[Airtable] AIRTABLE_TOKEN não definido. Configure em .env.local');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function mapRecord(record: AirtableRecord): Event {
  const today = new Date().toISOString().split('T')[0];
  const endDate = record.fields['data final'];
  const startDate = record.fields['data de inicio'] ?? '';
  const refDate = endDate ?? startDate;

  return {
    id: record.id,
    nome: record.fields['Nome do evento'] ?? '',
    descricao: record.fields['Descrição'] ?? '',
    linkSite: record.fields['Link do site'],
    dataInicio: startDate,
    dataFinal: endDate,
    cidade: record.fields['cidade'] ?? '',
    uf: record.fields['UF'],
    tags: record.fields['tags separadas por vírgola'] ?? [],
    modalidade: record.fields['Modalidade'],
    faixaPreco: record.fields['Faixa de preço'],
    participantes: record.fields['Participantes esperados'],
    isPast: !!refDate && refDate < today,
    createdTime: record.createdTime,
  };
}

async function fetchPage(params: URLSearchParams): Promise<{ records: AirtableRecord[]; offset?: string }> {
  const res = await fetch(`${BASE_URL}/${BASE_ID}/${TABLE_ID}?${params}`, {
    headers: auth(),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errData = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw Object.assign(new Error(errData.error?.message ?? `Airtable error: ${res.status}`), {
      airtableMessage: errData.error?.message ?? '',
    });
  }

  return res.json();
}

// Memoized per-request. fetchSchema reuses this result via React.cache deduplication.
export const fetchEvents = cache(async (): Promise<Event[]> => {
  const events: Event[] = [];
  let offset: string | undefined;
  const moderationEnabled = process.env.AIRTABLE_MODERATION === 'true';

  do {
    const params = new URLSearchParams();
    params.set('sort[0][field]', 'data de inicio');
    params.set('sort[0][direction]', 'asc');
    if (offset) params.set('offset', offset);

    // Always show only active events — blank STATUS is treated as pendente.
    // Optionally also require moderation approval via AIRTABLE_MODERATION env var.
    const filters = ['{STATUS} = "ativo"'];
    if (moderationEnabled) filters.push('{Aprovado}');
    params.set('filterByFormula', filters.length === 1 ? filters[0] : `AND(${filters.join(', ')})`);

    let data: { records: AirtableRecord[]; offset?: string };
    try {
      data = await fetchPage(params);
    } catch (err) {
      const msg = (err as { airtableMessage?: string }).airtableMessage ?? '';

      if (msg.includes('STATUS')) {
        console.warn('[Airtable] Campo "STATUS" não encontrado — filtro de status desativado.');
        const fallback = new URLSearchParams(params);
        if (moderationEnabled) {
          fallback.set('filterByFormula', '{Aprovado}');
        } else {
          fallback.delete('filterByFormula');
        }
        data = await fetchPage(fallback);
      } else if (moderationEnabled && msg.includes('Aprovado')) {
        console.warn('[Airtable] Campo "Aprovado" não encontrado — exibindo apenas eventos ativos.');
        const fallback = new URLSearchParams(params);
        fallback.set('filterByFormula', '{STATUS} = "ativo"');
        data = await fetchPage(fallback);
      } else {
        throw err;
      }
    }

    events.push(...data.records.map(mapRecord));
    offset = data.offset;
  } while (offset);

  return events;
});

// Retries stripping one unknown field at a time until Airtable accepts the record.
// This allows optional extended fields (Modalidade, Faixa de preço, etc.) to be
// submitted gracefully even if they haven't been created in Airtable yet.
export async function createEvent(fields: Record<string, unknown>): Promise<Event> {
  let current = { ...fields };

  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(`${BASE_URL}/${BASE_ID}/${TABLE_ID}`, {
      method: 'POST',
      headers: auth(),
      body: JSON.stringify({ fields: current }),
      cache: 'no-store',
    });

    if (res.ok) return mapRecord((await res.json()) as AirtableRecord);

    const err = (await res.json().catch(() => ({}))) as { error?: { type?: string; message?: string } };

    if (err.error?.type === 'UNKNOWN_FIELD_NAME') {
      const match = /Unknown field name: "(.+?)"/.exec(err.error.message ?? '');
      if (match) {
        console.warn(`[Airtable] Campo desconhecido removido: "${match[1]}". Crie o campo no Airtable para salvá-lo.`);
        const { [match[1]]: _dropped, ...rest } = current;
        current = rest;
        continue;
      }
    }

    // Handle invalid select option (token lacks schema:write — new option can't be created).
    // Strip the offending field and retry so the event is still saved without it.
    if (err.error?.type === 'INVALID_MULTIPLE_CHOICE_OPTION') {
      const fieldMatch = /for the (?:single|multiple) select field (.+)$/.exec(err.error.message ?? '');
      const fieldName = fieldMatch ? fieldMatch[1].replace(/['"]/g, '').trim() : null;
      if (fieldName && fieldName in current) {
        console.warn(`[Airtable] Opção inválida removida do campo "${fieldName}". Adicione a opção no Airtable para salvá-la.`);
        const { [fieldName]: _dropped, ...rest } = current;
        current = rest;
        continue;
      }
    }

    throw new Error(err.error?.message ?? `Airtable error: ${res.status}`);
  }

  throw new Error('Airtable: muitos campos desconhecidos removidos — verifique os nomes dos campos.');
}

// UFs and modalidades are derived from existing records so we only show values
// already configured in Airtable (the token lacks schema write permission).
export async function fetchSchema(): Promise<SchemaOptions> {
  const events = await fetchEvents();
  const ufs = [...new Set(events.map((e) => e.uf).filter((u): u is string => !!u))].sort();
  const tags = [...new Set(events.flatMap((e) => e.tags))].sort();
  const modalidades = [...new Set(events.map((e) => e.modalidade).filter((m): m is string => !!m))].sort();
  return { ufs, tags, modalidades };
}
