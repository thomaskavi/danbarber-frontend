export interface DespesaRequest {
  descricao: string;
  valor: number;
  data: string; // yyyy-MM-dd
  categoria?: string;
}
 
export interface DespesaResponse {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  categoria: string | null;
}
 












