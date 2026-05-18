import { Suspense } from 'react';
import { CheckCircle } from 'lucide-react';
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
          Calendário de eventos
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
          Próximas paradas<br />
          <span className="text-stone-500 font-normal">da caravana tech.</span>
        </h1>
        <p className="mt-3 max-w-lg text-sm text-stone-500">
          Conferências, meetups e workshops de tecnologia no Brasil.
          Adicione{' '}
          <a
            href="/novo"
            className="text-amber-500 hover:underline focus-visible:outline-none focus-visible:underline"
          >
            o seu evento
          </a>{' '}
          e entre para a rota.
        </p>
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
