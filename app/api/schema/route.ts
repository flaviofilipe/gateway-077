import { fetchSchema } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const schema = await fetchSchema();
    return Response.json(schema);
  } catch (err) {
    console.error('[GET /api/schema]', err);
    return Response.json({ error: 'Falha ao buscar opções' }, { status: 500 });
  }
}
