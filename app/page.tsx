import { Suspense } from 'react';
import { CheckCircle, MessageCircle } from 'lucide-react';
import { fetchEvents, fetchSchema } from '@/lib/airtable';
import EventList from '@/components/EventList';
import { EventSkeletonGrid } from '@/components/EventSkeleton';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ novo?: string }>;
}

async function EventsSection() {
  const [events, schema] = await Promise.all([fetchEvents(), fetchSchema()]);
  return <EventList events={events} schema={schema} />;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const showBanner = params.novo === '1';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col gap-10">

      {/* Hero */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-2">
          Vitória da Conquista · Bahia
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
          Gateway 077
        </h1>
        <p className="mt-3 max-w-lg text-sm text-stone-500">
          Calendário de eventos tech da caravana — conferências, meetups e workshops
          pelo Brasil e pelo mundo. Adicione{' '}
          <a
            href="/novo"
            className="text-amber-500 hover:underline focus-visible:outline-none focus-visible:underline"
          >
            o seu evento
          </a>{' '}
          e entre para a rota.
        </p>
      </section>

      {/* Sobre */}
      <section aria-labelledby="sobre-heading" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
          <div className="flex-1 min-w-0">
            <h2 id="sobre-heading" className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">
              Sobre
            </h2>
            <p className="text-sm text-stone-400 leading-relaxed">
              A{' '}
              <span className="font-semibold text-[var(--text)]">Caravana Gateway 077</span>{' '}
              é uma comunidade de tecnologia nascida em{' '}
              <span className="font-semibold text-[var(--text)]">Vitória da Conquista, Bahia</span>.
              Este site reúne e divulga os eventos que a caravana irá acompanhar.
              Discussões sobre viagens, organização e caronas acontecem no grupo oficial.
            </p>
          </div>
          <a
            href="https://chat.whatsapp.com/GiI4GRoBEWdEKZAfx5v0OF"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            <MessageCircle size={16} aria-hidden="true" />
            Grupo no WhatsApp
          </a>
        </div>
      </section>

      {showBanner && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-green-800/40 bg-green-900/20 px-5 py-4 text-sm text-green-400"
        >
          <CheckCircle size={18} aria-hidden="true" />
          Evento enviado — em breve na rota.
        </div>
      )}

      <Suspense fallback={<EventSkeletonGrid />}>
        <EventsSection />
      </Suspense>
    </div>
  );
}
