// Gera o primeiro e o último dia do mês atual.
// O backend espera dois formatos diferentes:
// - LocalDateTime (atendimentos): "yyyy-MM-ddTHH:mm:ss"
// - LocalDate (fechamento): "yyyy-MM-dd"

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function mesAtualComoDateTime(): { inicio: string; fim: string } {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = agora.getMonth(); // 0-indexado

  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0); // dia 0 do próximo mês = último dia deste mês

  const inicio = `${ano}-${pad(mes + 1)}-${pad(primeiroDia.getDate())}T00:00:00`;
  const fim = `${ano}-${pad(mes + 1)}-${pad(ultimoDia.getDate())}T23:59:59`;

  return { inicio, fim };
}

export function mesAtualComoDate(): { inicio: string; fim: string } {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = agora.getMonth();

  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  const inicio = `${ano}-${pad(mes + 1)}-${pad(primeiroDia.getDate())}`;
  const fim = `${ano}-${pad(mes + 1)}-${pad(ultimoDia.getDate())}`;

  return { inicio, fim };
}
