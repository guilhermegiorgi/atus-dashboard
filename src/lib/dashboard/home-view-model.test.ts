import { describe, expect, it } from "vitest";
import { buildHomeViewModel } from "./home-view-model";

describe("buildHomeViewModel", () => {
  it("uses analytics overview for conversions instead of deriving from lead list", () => {
    const model = buildHomeViewModel({
      stats: {
        total: 50,
        novos: 10,
        em_atendimento: 20,
        convertidos: 5,
        perdidos: 15,
      },
      overview: {
        total_leads: 120,
        novos_leads: 35,
        leads_em_tratativa: 40,
        takeovers_humanos: 18,
        leads_com_tracking: 95,
        conversoes_operacionais: 52,
        conversoes_comerciais: 7,
        taxa_conversao_operacional: 0.4333,
        taxa_conversao_comercial: 0.0583,
      },
      followup: {
        expired_followups: 3,
        active_followups: 10,
        followups_sent_today: 5,
        followup_responses_today: 2,
        stuck_followups: 1,
        contaminated_leads: 4,
        sent_last_7_days: 17,
        responses_last_7_days: 8,
      },
      sla: {
        dentro_do_sla: 40,
        fora_do_sla: 10,
        tempo_medio_resposta_min: 18,
        por_origem: {},
      },
    });

    expect(model.heroCards[2].value).toBe(52);
    expect(model.heroCards[3].value).toBe("5.8%");
  });
});
