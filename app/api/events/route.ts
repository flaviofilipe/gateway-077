import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fetchEvents, createEvent, fetchSchema } from '@/lib/airtable';
import { checkRateLimit } from '@/lib/rate-limit';

// Dynamic: events are community-submitted and must always be fresh.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = await fetchEvents();
    return Response.json({ events });
  } catch (err) {
    console.error('[GET /api/events]', err);
    return Response.json({ error: 'Falha ao buscar eventos' }, { status: 500 });
  }
}

const MODALIDADES = ['Presencial', 'Online', 'Híbrido'] as const;
const FAIXAS_PRECO = ['Gratuito', 'Pago', 'A confirmar'] as const;

const createSchema = z.object({
  'Nome do evento': z.string().min(1, 'Nome é obrigatório').max(120, 'Máximo 120 caracteres'),
  'Descrição':      z.string().min(1, 'Descrição é obrigatória').max(2000, 'Máximo 2000 caracteres'),
  // Require http(s) explicitly — z.string().url() accepts javascript: and other schemes
  'Link do site': z
    .string()
    .url('URL inválida (inclua https://)')
    .refine((u) => /^https?:\/\//i.test(u), 'URL deve começar com http:// ou https://')
    .max(500)
    .optional(),
  'data de inicio': z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de início inválida'),
  'data final':     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data final inválida').optional(),
  cidade: z.string().min(1, 'Cidade é obrigatória').max(80, 'Máximo 80 caracteres'),
  UF:     z.string().min(1, 'UF é obrigatória').max(10),
  'tags separadas por vírgola': z
    .array(z.string().max(50, 'Tag muito longa'))
    .max(10, 'Máximo 10 tags')
    .optional(),
  Modalidade:      z.enum(MODALIDADES).optional(),
  'Faixa de preço': z.enum(FAIXAS_PRECO).optional(),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';

  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return Response.json(
      { error: 'Muitas requisições. Tente novamente em 10 minutos.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  let rawBody: Record<string, unknown>;
  try {
    rawBody = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  // Normalise empty strings to undefined so Zod optional fields validate cleanly.
  const body = {
    ...rawBody,
    'Link do site': rawBody['Link do site'] || undefined,
    'data final': rawBody['data final'] || undefined,
    'tags separadas por vírgola':
      Array.isArray(rawBody['tags separadas por vírgola']) &&
      (rawBody['tags separadas por vírgola'] as unknown[]).length > 0
        ? rawBody['tags separadas por vírgola']
        : undefined,
  };

  const result = createSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: 'Dados inválidos', details: result.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = result.data;

  if (data['data final'] && data['data final'] < data['data de inicio']) {
    return Response.json(
      { error: 'Data final deve ser igual ou posterior à data de início' },
      { status: 422 },
    );
  }

  // Validate UF against live schema choices (only pre-existing options allowed — token lacks schema:write).
  let schema: { ufs: string[] };
  try {
    schema = await fetchSchema();
  } catch (err) {
    console.error('[POST /api/events] schema fetch failed', err);
    return Response.json({ error: 'Falha ao validar opções' }, { status: 500 });
  }

  if (!schema.ufs.includes(data.UF)) {
    return Response.json({ error: 'UF inválida' }, { status: 422 });
  }

  const fields: Record<string, unknown> = {
    'Nome do evento': data['Nome do evento'],
    'Descrição': data['Descrição'],
    cidade: data.cidade,
    UF: data.UF,
    'data de inicio': data['data de inicio'],
  };
  if (data['Link do site']) fields['Link do site'] = data['Link do site'];
  if (data['data final']) fields['data final'] = data['data final'];
  if (data['tags separadas por vírgola']?.length)
    fields['tags separadas por vírgola'] = data['tags separadas por vírgola'];
  if (data.Modalidade) fields.Modalidade = data.Modalidade;
  if (data['Faixa de preço']) fields['Faixa de preço'] = data['Faixa de preço'];

  try {
    const event = await createEvent(fields);
    return Response.json({ event }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/events] create failed', err);
    return Response.json({ error: 'Falha ao criar evento' }, { status: 500 });
  }
}
