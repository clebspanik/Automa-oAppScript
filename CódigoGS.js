// ============================================================
// CONFIGURAÇÕES — EEB Pedro Maciel
// ============================================================
const AGENDA_ID = "info.pedromaciel@sed.sc.gov.br";
const NOME_LABORATORIO = "Laboratório de Tecnologias - Pedro Maciel";

const PERIODOS = [
  { nome: "Período 1",  inicio: [7,  30], fim: [8,  15] },
  { nome: "Período 2",  inicio: [8,  15], fim: [9,  00] },
  { nome: "Período 3",  inicio: [9,  00], fim: [9,  45] },
  { nome: "Período 4",  inicio: [10, 00], fim: [10, 45] },
  { nome: "Período 5",  inicio: [10, 45], fim: [11, 30] },
  { nome: "Período 6",  inicio: [13, 10], fim: [13, 55] },
  { nome: "Período 7",  inicio: [13, 55], fim: [14, 40] },
  { nome: "Período 8",  inicio: [14, 40], fim: [15, 25] },
  { nome: "Período 9",  inicio: [15, 40], fim: [16, 25] },
  { nome: "Período 10", inicio: [16, 25], fim: [17, 10] },
  { nome: "Período 11", inicio: [18, 30], fim: [19, 10] },
  { nome: "Período 12", inicio: [19, 10], fim: [19, 50] },
  { nome: "Período 13", inicio: [19, 50], fim: [20, 30] },
  { nome: "Período 14", inicio: [20, 40], fim: [21, 20] },
  { nome: "Período 15", inicio: [21, 20], fim: [22, 00] }
];

function doGet() {
  // Usamos evaluate() caso você venha a usar tags <? ?> no futuro, 
  // e é a forma mais estável para Web Apps.
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("Reserva - " + NOME_LABORATORIO)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function verificarDisponibilidade(dataStr) {
  try {
    const agenda = CalendarApp.getCalendarById(AGENDA_ID);
    if (!agenda) {
      throw new Error("Agenda não encontrada. Verifique o ID da agenda.");
    }
    
    const partes = dataStr.split("-");
    const ano = parseInt(partes[0]);
    const mes = parseInt(partes[1]) - 1;
    const dia = parseInt(partes[2]);

    return PERIODOS.map(function(p, index) {
      const inicio = new Date(ano, mes, dia, p.inicio[0], p.inicio[1], 0);
      const fim = new Date(ano, mes, dia, p.fim[0], p.fim[1], 0);
      
      // Busca eventos no intervalo do período
      const eventos = agenda.getEvents(inicio, fim);
      
      return {
        index: index,
        nome: p.nome,
        horario: String(p.inicio[0]).padStart(2, '0') + ":" + String(p.inicio[1]).padStart(2, '0') + " – " + String(p.fim[0]).padStart(2, '0') + ":" + String(p.fim[1]).padStart(2, '0'),
        disponivel: eventos.length === 0,
        ocupadoPor: eventos.length > 0 ? eventos[0].getTitle() : ""
      };
    });
  } catch (e) {
    Logger.log("Erro em verificarDisponibilidade: " + e.message);
    return [];
  }
}

function criarReserva(dados) {
  try {
    const agenda = CalendarApp.getCalendarById(AGENDA_ID);
    if (!agenda) throw new Error("Não foi possível acessar a agenda.");

    const partes = dados.data.split("-");
    const ano = parseInt(partes[0]);
    const mes = parseInt(partes[1]) - 1;
    const dia = parseInt(partes[2]);

    dados.periodosSelecionados.forEach(function(index) {
      const p = PERIODOS[index];
      const inicio = new Date(ano, mes, dia, p.inicio[0], p.inicio[1], 0);
      const fim = new Date(ano, mes, dia, p.fim[0], p.fim[1], 0);
      
      const titulo = "LAB: " + dados.professor.toUpperCase() + " (" + dados.turma + ")";
      const desc = "Habilidades: " + dados.habilidades;
      
      agenda.createEvent(titulo, inicio, fim, { description: desc });
    });
    
    return { sucesso: true };
  } catch (e) {
    return { sucesso: false, mensagem: "Erro ao reservar: " + e.message };
  }
}
