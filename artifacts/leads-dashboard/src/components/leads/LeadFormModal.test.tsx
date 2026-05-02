import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LeadFormModal } from "./LeadFormModal";

describe("LeadFormModal", () => {
  it("submits create mode values expected by inbound ingestion mapping", async () => {
    const onSubmit = vi.fn();

    render(
      <LeadFormModal
        open
        mode="create"
        onClose={() => {}}
        onSubmit={onSubmit}
      />
    );

    const dialogContent = document.querySelector('[data-slot="dialog-content"]');

    expect(dialogContent?.className).toContain("w-[min(94vw,1400px)]");
    expect(dialogContent?.className).toContain("h-[88vh]");
    expect(dialogContent?.className).toContain("overflow-hidden");

    fireEvent.change(screen.getByLabelText("Nome completo"), {
      target: { value: "Maria Silva" },
    });
    fireEvent.change(screen.getByLabelText("Telefone"), {
      target: { value: "5565999999999" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "maria@email.com" },
    });
    fireEvent.change(screen.getByLabelText("Tipo de interesse"), {
      target: { value: "COMPRA" },
    });

    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        nome_completo: "Maria Silva",
        telefone: "5565999999999",
        email: "maria@email.com",
        tipo_interesse: "COMPRA",
      })
    );
  });
});
