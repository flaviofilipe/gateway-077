import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import Header from '@/components/Header';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

export const metadata: Metadata = {
  title: 'Caravana Gateway 077 — Calendário de Eventos Tech',
  description:
    'Calendário comunitário de eventos de tecnologia no Brasil. Encontre conferências, meetups e workshops próximos de você.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} h-full dark`} suppressHydrationWarning>
      {/* Inline script prevents flash of light mode before JS hydrates */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||'dark';if(t==='dark'||t==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}})()`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--bg)] antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-amber-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black focus:outline-none"
        >
          Ir para o conteúdo principal
        </a>
        <ThemeProvider>
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 outline-none">{children}</main>
          <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-stone-500 dark:text-stone-600">
            Caravana Gateway 077 — feito pela comunidade, para a comunidade
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
