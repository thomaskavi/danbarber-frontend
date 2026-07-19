export type FormaPagamento = 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'DINHEIRO';
export type Modulo = 'ATENDIMENTOS' | 'ESTOQUE_VENDAS';
export type TipoAjusteEstoque = 'ENTRADA' | 'SAIDA';


export interface LoginRequest {
  login: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  nome: string;
  role: 'EMPREGADOR' | 'FUNCIONARIO';
  modulosAtivos: Modulo[];
}

export interface AtendimentoRequest {
  funcionarioId?: number | null; // só é usado quando o DONO está lançando em nome de outro funcionario
  nomeCliente?: string;
  formaPagamento: FormaPagamento;
  servicoIds: number[];
  observacao?: string;
}

export interface AtendimentoResponse {
  id: number;
  funcionarioNome: string;
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

// --- Produto / Estoque ---

export interface ProdutoRequest {
  nome: string;
  preco: number;
  quantidadeEstoque: number;
}

export interface ProdutoResponse {
  id: number;
  nome: string;
  preco: number;
  quantidadeEstoque: number;
  ativo: boolean;
}

export interface AjusteEstoqueRequest {
  quantidade: number;
  tipo: TipoAjusteEstoque;
}

// --- Venda ---

export interface ItemVendaRequest {
  produtoId: number;
  quantidade: number;
}

export interface VendaRequest {
  nomeCliente?: string;
  formaPagamento: FormaPagamento;
  itens: ItemVendaRequest[];
  observacao?: string;
}

export interface ItemVendaResponse {
  nomeProduto: string;
  quantidade: number;
  precoUnitarioCobrado: number;
  subtotal: number;
}

export interface VendaResponse {
  id: number;
  nomeVendedor: string;
  nomeCliente: string | null;
  dataHora: string;
  formaPagamento: FormaPagamento;
  itens: ItemVendaResponse[];
  valorTotal: number;
  valorComissao: number;
  observacao: string | null;
}

export interface CriarFuncionarioRequest {
  nome: string;
  login: string;
  senha: string;
  temComissao: boolean;
  percentualComissao: number | null;
}