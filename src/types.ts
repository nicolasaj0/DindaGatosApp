export type HospedagemStatus = 'agendado' | 'hospedado' | 'saindo_hoje' | 'concluido';

export type Sociabilidade = 'sociavel' | 'isolado';

export type StatusPagamento = 'pendente' | 'parcial' | 'pago';

export type TipoServico = 'hospedagem' | 'cat_sitter' | 'transporte';

export interface TransporteAdicional {
  valor: number;
  detalhes?: string;
}

export interface HistoricoPagamento {
  id: string;
  valor: number;
  dataHora: string;
  tipo: 'entrada' | 'saldo' | 'pagamento_unico';
}

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
  valorPago?: number;
  historicoPagamentos?: HistoricoPagamento[];
  transporteAdicional?: TransporteAdicional;
  dataHoraConfirmacaoPagamento?: string;
  dataHoraReversaoPagamento?: string;
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
  valorPago?: number;
  historicoPagamentos?: HistoricoPagamento[];
  transporteAdicional?: TransporteAdicional;
  dataHoraConfirmacaoPagamento?: string;
  dataHoraReversaoPagamento?: string;
  tipoServico: TipoServico;
  enderecoServico?: string;
  detalhesServico?: string;
}
