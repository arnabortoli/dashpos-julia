import type { RadarProvider } from "@/domain/types";
// TODO: integração será implementada pela equipe técnica da Loumar.
// Nenhuma URL, autenticação, rota ou resposta da Loumaria é presumida aqui.
export interface LoumariaProvider extends RadarProvider {
  readonly integration: "loumaria";
}
export function createLoumariaProvider(): LoumariaProvider {
  throw new Error(
    "Integração Loumaria não implementada. Use o provider de demonstração.",
  );
}
