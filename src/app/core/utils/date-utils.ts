// Utilitários de data para conversar com o backend, que espera dois formatos diferentes:
// - LocalDateTime (atendimentos): "yyyy-MM-ddTHH:mm:ss"
// - LocalDate (despesas e fechamento): "yyyy-MM-dd"
//
// Importante: esses formatos ISO são para LÓGICA (backend, ordenação, filtros, inputs).
// Nunca mude isso para dd/MM/yyyy — quebraria a ordenação por string e a comunicação com a API.
// Para EXIBIR datas na tela em português, use formatarParaExibicao() / formatarDataHoraParaExibicao()
// lá embaixo, só na hora de mostrar pro usuário.

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatarData(data: Date): string {
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`;
}

export function mesAtualComoDateTime(): { inicio: string; fim: string } {
  const agora = new Date();
  const primeiroDia = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);

  return {
    inicio: `${formatarData(primeiroDia)}T00:00:00`,
    fim: `${formatarData(ultimoDia)}T23:59:59`,
  };
}

export function mesAtualComoDate(): { inicio: string; fim: string } {
  const agora = new Date();
  const primeiroDia = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);

  return { inicio: formatarData(primeiroDia), fim: formatarData(ultimoDia) };
}

// Mês seguinte inteiro (do dia 1 ao último dia) — útil para despesas já programadas,
// tipo aluguel ou contas fixas do próximo mês
export function proximoMesComoDate(): { inicio: string; fim: string } {
  const agora = new Date();
  const primeiroDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);
  const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 2, 0);

  return { inicio: formatarData(primeiroDia), fim: formatarData(ultimoDia) };
}

// Intervalo de hoje (00:00:00 até 23:59:59), no formato LocalDateTime
export function hojeComoDateTime(): { inicio: string; fim: string } {
  const hoje = formatarData(new Date());
  return { inicio: `${hoje}T00:00:00`, fim: `${hoje}T23:59:59` };
}

// Converte duas datas simples (yyyy-MM-dd, vindas de um <input type="date">)
// para o intervalo completo de LocalDateTime que o endpoint de atendimentos espera
export function dataParaDateTimeRange(dataInicio: string, dataFim: string): { inicio: string; fim: string } {
  return {
    inicio: `${dataInicio}T00:00:00`,
    fim: `${dataFim}T23:59:59`,
  };
}

// Data de hoje no formato yyyy-MM-dd, útil para preencher inputs type="date" por padrão
export function hojeComoDate(): string {
  return formatarData(new Date());
}

// Data de N dias atrás no formato yyyy-MM-dd — usado pelos atalhos de filtro
// (ex: dataMenosDias(7) para "últimos 7 dias")
export function dataMenosDias(dias: number): string {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return formatarData(data);
}

// Data de N dias à frente no formato yyyy-MM-dd — usado para atalhos de período futuro
// (ex: dataMaisDias(31) para "próximos 31 dias")
export function dataMaisDias(dias: number): string {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return formatarData(data);
}

// ── Funções de EXIBIÇÃO (só para mostrar na tela, nunca para lógica/filtros) ──

// Converte "yyyy-MM-dd" para "dd/MM/yyyy"
export function formatarParaExibicao(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split('T')[0].split('-');
  return `${dia}/${mes}/${ano}`;
}

// Converte "yyyy-MM-ddTHH:mm:ss" (ou com frações de segundo, tipo o LocalDateTime do Java)
// para "dd/MM/yyyy HH:mm"
export function formatarDataHoraParaExibicao(dataHoraIso: string): string {
  const [dataParte, horaParte] = dataHoraIso.split('T');
  const [ano, mes, dia] = dataParte.split('-');
  const [hora, minuto] = horaParte.split(':');
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}
