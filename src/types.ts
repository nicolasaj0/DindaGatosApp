export type HospedagemStatus = 'agendado' | 'hospedado' | 'saindo_hoje' | 'concluido';

export type Sociabilidade = 'sociavel' | 'isolado';

export type StatusPagamento = 'pendente' | 'pago';

export type TipoServico = 'hospedagem' | 'cat_sitter' | 'transporte';

export interface HospedagemPerfil {
  sociabilidade: Sociabilidade;
  personalidade: string;
  dieta: string;
  observacoes: string;
  medicamentos?: string;
}

export interface Hospedagem {
  id: string;
  gatoId?: string; // Reference to Gato
  nomeGato: string;
  nomeTutor: string;
  fotoUrl?: string;
  dataCheckIn: string;
  dataCheckOut: string;
  status: HospedagemStatus;
  perfil: HospedagemPerfil;
  dataHoraConfirmacaoCheckIn?: string;
  dataHoraConfirmacaoCheckOut?: string;
  valorDiaria?: number;
  
  // Novos campos de pagamento e serviços
  statusPagamento: StatusPagamento;
  dataHoraConfirmacaoPagamento?: string;
  tipoServico: TipoServico;
  enderecoServico?: string;
  detalhesServico?: string;
  enderecoTutor?: string;
}

export interface Gato {
  id: string;
  nomeGato: string;
  nomeTutor: string;
  fotoUrl?: string;
  perfil: HospedagemPerfil;
  valorDiariaPadrao?: number;
  dataCadastro: string;
  enderecoTutor?: string; // Novo
}

export interface Estadia {
  id: string;
  gatoId: string;
  dataCheckIn: string;
  dataCheckOut: string;
  status: HospedagemStatus;
  dataHoraConfirmacaoCheckIn?: string;
  dataHoraConfirmacaoCheckOut?: string;
  valorDiaria?: number;
  
  // Novos campos de pagamento e serviços
  statusPagamento: StatusPagamento;
  dataHoraConfirmacaoPagamento?: string;
  tipoServico: TipoServico;
  enderecoServico?: string;
  detalhesServico?: string;
}
