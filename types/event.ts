export interface AirtableRecord {
  id: string;
  fields: AirtableFields;
  createdTime: string;
}

export interface AirtableFields {
  'Nome do evento': string;
  'Descrição'?: string;
  'Link do site'?: string;
  'data de inicio'?: string;
  'data final'?: string;
  cidade?: string;
  UF?: string;
  'tags separadas por vírgola'?: string[];
  Modalidade?: string;
  'Faixa de preço'?: string;
  'Participantes esperados'?: number;
}

export interface Event {
  id: string;
  nome: string;
  descricao: string;
  linkSite?: string;
  dataInicio: string;
  dataFinal?: string;
  cidade: string;
  uf?: string;
  tags: string[];
  modalidade?: string;
  faixaPreco?: string;
  participantes?: number;
  isPast: boolean;
  createdTime: string;
}

export interface SchemaOptions {
  ufs: string[];
  tags: string[];
  modalidades: string[];
}

export type ViewMode = 'grid' | 'timeline' | 'calendar';
