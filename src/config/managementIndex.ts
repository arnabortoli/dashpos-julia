// Indicador experimental. Pesos e limites podem ser revistos pela gestão.
// Não usa duração, reclamações, sensibilidade nem eventos operacionais.
export const MANAGEMENT_INDEX = {
  weights: {
    csat: 0.25,
    communication: 0.35,
    consistency: 0.15,
    volume: 0.15,
    evolution: 0.1,
  },
  volumeTarget: 280,
  qualityValues: {
    "Precisa evoluir": 20,
    Atenção: 40,
    Bom: 60,
    "Muito bom": 80,
    Excelente: 100,
  },
} as const;
