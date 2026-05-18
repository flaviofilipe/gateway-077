import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { fetchSchema } from '@/lib/airtable';
import EventForm from '@/components/EventForm';

export const metadata = {
  title: 'Adicionar evento — Eventos Tech',
};

export default async function NovoPage() {
  const schema = await fetchSchema();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors mb-8 focus-visible:outline-none focus-visible:underline"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Voltar para a lista
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Adicionar evento</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Campos marcados com{' '}
          <span className="text-indigo-500" aria-label="asterisco">
            *
          </span>{' '}
          são obrigatórios.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <EventForm schema={schema} />
      </div>
    </div>
  );
}
