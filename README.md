# Caravana Gateway 077

Calendário comunitário de eventos de tecnologia no Brasil. Organizado pela comunidade Gateway 077 — qualquer membro pode propor um evento.

Construído com Next.js 16 (App Router), TypeScript, Tailwind CSS v4 e Airtable como banco de dados.

## Funcionalidades

- Listagem de eventos agrupada por proximidade (Esta semana / Este mês / Próximos)
- Filtros por UF, modalidade, tags e busca por texto
- Três visualizações: Grade, Linha do tempo e Calendário mensal
- Feed iCal (`/api/ical`) para assinar em Google Calendar, Apple Calendar etc.
- Formulário de proposta com validação (Zod), rate limiting por IP e autocomplete de tags
- Seção de eventos passados colapsável
- Dark mode com persistência em `localStorage`
- Moderação opcional via campo `Aprovado` no Airtable

## Pré-requisitos

- Node.js 18+
- Personal Access Token do Airtable com permissão de leitura e escrita na base

## Rodando localmente

```bash
npm install
npm run dev
```

O servidor sobe em `http://localhost:3000`.

### Variável de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
AIRTABLE_TOKEN=seu_token_aqui
```

> **Importante:** nunca use o prefixo `NEXT_PUBLIC_` no token — ele deve existir apenas no servidor.

Para ativar a moderação de eventos (exibir apenas registros aprovados):

```env
AIRTABLE_MODERATION=true
```

Requer um campo `Aprovado` (checkbox) na tabela do Airtable.

## Deploy na Vercel

1. Faça push do repositório para o GitHub.
2. Importe o projeto em [vercel.com/new](https://vercel.com/new).
3. Em **Settings → Environment Variables**, adicione:
   - `AIRTABLE_TOKEN` — seu Personal Access Token
   - `AIRTABLE_MODERATION` — `true` (opcional)
4. Clique em **Deploy**.

O Airtable Base ID e Table ID estão em `lib/airtable.ts`.

## Estrutura

```
app/
  api/
    events/route.ts     # GET lista + POST cria evento
    schema/route.ts     # GET opções de UF, tags e modalidades
    ical/route.ts       # GET feed iCal (RFC 5545)
  novo/page.tsx         # Formulário de proposta
  page.tsx              # Página principal com listagem
  layout.tsx            # Layout global (fonte, tema, header)
  globals.css           # Variáveis CSS e Tailwind

components/
  EventList.tsx         # Lista com filtros e alternância de view
  EventCard.tsx         # Card individual de evento
  EventFilters.tsx      # Filtros (UF, modalidade, tags, busca)
  EventForm.tsx         # Formulário de proposta (client component)
  TagInput.tsx          # Input com autocomplete e criação de tags
  TimelineView.tsx      # Visualização em linha do tempo
  CalendarView.tsx      # Visualização em calendário mensal
  ViewToggle.tsx        # Alternador Grade / Rota / Calendário
  EventSkeleton.tsx     # Skeleton de loading
  Header.tsx            # Cabeçalho com nav e toggle de tema
  ThemeProvider.tsx     # Contexto de dark mode
  Badge.tsx             # Badge de UF e tag
  Button.tsx            # Botão reutilizável
  Toast.tsx             # Notificação flutuante

lib/
  airtable.ts           # Cliente Airtable (somente servidor)
  rate-limit.ts         # Rate limit em memória por IP

types/
  event.ts              # Interfaces TypeScript

tests/
  novo.spec.ts          # Testes E2E com Playwright
```

## Scripts

| Comando              | Descrição                          |
|----------------------|------------------------------------|
| `npm run dev`        | Servidor de desenvolvimento        |
| `npm run build`      | Build de produção                  |
| `npm start`          | Servidor de produção               |
| `npm run lint`       | Lint com ESLint                    |
| `npx playwright test`| Testes E2E                         |
