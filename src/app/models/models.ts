export type FormaPagamento = 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'DINHEIRO';

export interface LoginRequest {
  login: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  nome: string;
  role: 'DONO' | 'BARBEIRO';
}

export interface AtendimentoRequest {
  barbeiroId?: number | null; // só é usado quando o DONO está lançando em nome de outro barbeiro
  nomeCliente?: string;
  formaPagamento: FormaPagamento;
  servicoIds: number[];
  observacao?: string;
}

export interface AtendimentoResponse {
  id: number;
  barbeiroNome: string;
  nomeCliente: string | null;
  dataHora: string; // ISO string vindo do backend (LocalDateTime)
  formaPagamento: FormaPagamento;
  nomesServicos: string[];
  valorTotal: number;
  valorComissao: number;
  observacao: string | null;
}

export interface ServicoResponse {
  id: number;
  nome: string;
  preco: number;
  ativo: boolean;
}
