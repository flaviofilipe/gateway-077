'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SchemaOptions } from '@/types/event';
import Button from './Button';
import Toast from './Toast';
import TagInput from './TagInput';

interface EventFormProps { schema: SchemaOptions }
interface FieldErrors { [key: string]: string[] | undefined }

const MODALIDADES = ['Presencial', 'Online', 'Híbrido'] as const;
const FAIXAS_PRECO = ['Gratuito', 'Pago', 'A confirmar'] as const;

interface FormState {
  nome: string; descricao: string; linkSite: string;
  dataInicio: string; dataFinal: string;
  cidade: string; uf: string; tags: string[];
  modalidade: string; faixaPreco: string;
}

const empty: FormState = {
  nome: '', descricao: '', linkSite: '',
  dataInicio: '', dataFinal: '',
  cidade: '', uf: '', tags: [],
  modalidade: '', faixaPreco: '',
};

// Used only for string-keyed fields (tags managed separately via TagInput)
const FIELD_KEY: Record<keyof Omit<FormState, 'tags'>, string> = {
  nome: 'Nome do evento', descricao: 'Descrição', linkSite: 'Link do site',
  dataInicio: 'data de inicio', dataFinal: 'data final',
  cidade: 'cidade', uf: 'UF',
  modalidade: 'Modalidade', faixaPreco: 'Faixa de preço',
};

function InputField({ label, id, error, required, hint, children }: {
  label: string; id: string; error?: string[]; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-[var(--text)]">
        {label}
        {required && <span className="ml-1 text-amber-500" aria-hidden="true">*</span>}
        {hint && <span className="ml-2 text-xs font-normal text-stone-500">{hint}</span>}
      </label>
      {children}
      {error?.map((e) => <p key={e} className="text-xs text-red-500" role="alert">{e}</p>)}
    </div>
  );
}

const ic = 'w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-stone-600 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20';
const ie = 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20';

export default function EventForm({ schema }: EventFormProps) {
  const router = useRouter();
  const [form, setForm]               = useState<FormState>(empty);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading]         = useState(false);
  const [toast, setToast]             = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const dismissToast                  = useCallback(() => setToast(null), []);

  function set(key: keyof Omit<FormState, 'tags'>, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [FIELD_KEY[key]]: undefined }));
  }

  function setTags(tags: string[]) {
    setForm((prev) => ({ ...prev, tags }));
    setFieldErrors((prev) => ({ ...prev, 'tags separadas por vírgola': undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError('');

    const required: Array<keyof Omit<FormState, 'tags'>> = ['nome', 'descricao', 'dataInicio', 'cidade', 'uf'];
    const clientErrors: FieldErrors = {};
    for (const f of required) {
      if (!form[f]) clientErrors[FIELD_KEY[f]] = ['Campo obrigatório'];
    }
    if (Object.keys(clientErrors).length > 0) { setFieldErrors(clientErrors); return; }

    setLoading(true);

    const body: Record<string, unknown> = {
      'Nome do evento': form.nome,
      'Descrição':      form.descricao,
      'Link do site':   form.linkSite,
      'data de inicio': form.dataInicio,
      'data final':     form.dataFinal,
      cidade: form.cidade,
      UF: form.uf,
      'tags separadas por vírgola': form.tags,
    };
    if (form.modalidade)  body['Modalidade']     = form.modalidade;
    if (form.faixaPreco)  body['Faixa de preço'] = form.faixaPreco;

    try {
      const res  = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = (await res.json()) as { error?: string; details?: FieldErrors };

      if (!res.ok) {
        if (data.details) setFieldErrors(data.details);
        setGlobalError(data.error ?? 'Erro ao enviar evento.');
        setToast({ message: data.error ?? 'Erro ao enviar evento.', type: 'error' });
        return;
      }

      setToast({ message: 'Evento enviado — obrigado pela contribuição!', type: 'success' });
      setTimeout(() => router.push('/?novo=1'), 1200);
    } catch {
      const msg = 'Erro de rede. Verifique sua conexão e tente novamente.';
      setGlobalError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <InputField label="Nome do evento" id="nome" error={fieldErrors['Nome do evento']} required>
          <input id="nome" type="text" value={form.nome} onChange={(e) => set('nome', e.target.value)}
            placeholder="React Conf Brasil 2026" aria-required="true"
            className={`${ic} ${fieldErrors['Nome do evento'] ? ie : ''}`} />
        </InputField>

        <InputField label="Descrição" id="descricao" error={fieldErrors['Descrição']} required>
          <textarea id="descricao" value={form.descricao} onChange={(e) => set('descricao', e.target.value)}
            placeholder="Descreva o evento, palestrantes, formato..." rows={4} aria-required="true"
            className={`${ic} resize-y ${fieldErrors['Descrição'] ? ie : ''}`} />
        </InputField>

        <InputField label="Site do evento" id="linkSite" error={fieldErrors['Link do site']}>
          <input id="linkSite" type="url" value={form.linkSite} onChange={(e) => set('linkSite', e.target.value)}
            placeholder="https://evento.com.br" className={`${ic} ${fieldErrors['Link do site'] ? ie : ''}`} />
        </InputField>

        <div className="grid gap-5 sm:grid-cols-2">
          <InputField label="Data de início" id="dataInicio" error={fieldErrors['data de inicio']} required>
            <input id="dataInicio" type="date" value={form.dataInicio} onChange={(e) => set('dataInicio', e.target.value)}
              aria-required="true" className={`${ic} ${fieldErrors['data de inicio'] ? ie : ''}`} />
          </InputField>
          <InputField label="Data final" id="dataFinal" error={fieldErrors['data final']}>
            <input id="dataFinal" type="date" value={form.dataFinal} min={form.dataInicio}
              onChange={(e) => set('dataFinal', e.target.value)} className={`${ic} ${fieldErrors['data final'] ? ie : ''}`} />
          </InputField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <InputField label="Cidade" id="cidade" error={fieldErrors['cidade']} required>
            <input id="cidade" type="text" value={form.cidade} onChange={(e) => set('cidade', e.target.value)}
              placeholder="São Paulo" aria-required="true" className={`${ic} ${fieldErrors['cidade'] ? ie : ''}`} />
          </InputField>
          <InputField label="UF" id="uf" error={fieldErrors['UF']} required>
            <select id="uf" value={form.uf} onChange={(e) => set('uf', e.target.value)}
              aria-required="true" className={`${ic} ${fieldErrors['UF'] ? ie : ''}`}>
              <option value="">Selecione o estado</option>
              {schema.ufs.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </InputField>
        </div>

        <div className="border-t border-[var(--border)] pt-5 grid gap-5 sm:grid-cols-2">
          <InputField label="Modalidade" id="modalidade" hint="opcional" error={fieldErrors['Modalidade']}>
            <select id="modalidade" value={form.modalidade} onChange={(e) => set('modalidade', e.target.value)}
              className={ic}>
              <option value="">—</option>
              {MODALIDADES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </InputField>

          <InputField label="Faixa de preço" id="faixaPreco" hint="opcional" error={fieldErrors['Faixa de preço']}>
            <select id="faixaPreco" value={form.faixaPreco} onChange={(e) => set('faixaPreco', e.target.value)}
              className={ic}>
              <option value="">—</option>
              {FAIXAS_PRECO.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </InputField>
        </div>

        <InputField label="Tags" id="tags" hint="opcional" error={fieldErrors['tags separadas por vírgola']}>
          <TagInput
            id="tags"
            value={form.tags}
            suggestions={schema.tags}
            onChange={setTags}
            hasError={!!fieldErrors['tags separadas por vírgola']}
          />
        </InputField>

        {globalError && (
          <p className="rounded-lg bg-red-900/20 border border-red-500/20 px-4 py-3 text-sm text-red-400" role="alert">
            {globalError}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <a href="/" className="text-sm text-stone-500 hover:text-amber-500 transition-colors focus-visible:outline-none focus-visible:underline">
            Cancelar
          </a>
          <Button type="submit" loading={loading} size="lg">
            {loading ? 'Enviando…' : 'Entrar na rota'}
          </Button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={dismissToast} />}
    </>
  );
}
