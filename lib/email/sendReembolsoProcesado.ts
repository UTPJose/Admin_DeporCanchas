import "server-only";
import { sendMail } from "./client";

type Input = {
  to: string;
  cliente: string;
  monto: number;
  porcentaje: 50 | 100;
  destino: string;
  campus: string;
  cancha: string;
  fecha: string;
  hora: string;
  nota?: string;
};

export async function sendReembolsoProcesado(input: Input) {
  const notaBlock = input.nota
    ? `
      <div style="margin:16px 0 0;padding:12px 14px;background:#F7FAFC;border-left:3px solid #2C7A7B;border-radius:6px;">
        <p style="margin:0;font-size:13px;color:#2D3748;">
          <strong>Nota del equipo DeporCanchas:</strong><br/>
          ${input.nota.replace(/</g, "&lt;").replace(/\n/g, "<br/>")}
        </p>
      </div>
    `
    : "";

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0f2f1f;">
      <h2 style="margin:0 0 16px;">Reembolso acreditado</h2>
      <p style="margin:0;">Hola ${input.cliente},</p>
      <p style="margin:8px 0 0;">
        Te confirmamos que tu reembolso ya fue <strong>procesado</strong>. Verifica en
        tu ${input.destino.toLowerCase().includes("yape") ? "cuenta Yape" : "medio de pago"} —
        puede tardar unos minutos en reflejarse.
      </p>

      <div style="margin:20px 0 0;padding:16px 18px;background:#E2F5E8;border-radius:12px;">
        <p style="margin:0;font-weight:700;font-size:18px;">
          Monto acreditado: S/ ${input.monto.toFixed(2)}
        </p>
        <p style="margin:6px 0 0;font-size:14px;">
          Reembolso del <strong>${input.porcentaje}%</strong> — Destino: <strong>${input.destino}</strong>
        </p>
      </div>

      <p style="margin:20px 0 6px;font-size:14px;">Reserva cancelada:</p>
      <ul style="margin:0;line-height:1.6;">
        <li><strong>Sede:</strong> ${input.campus}</li>
        <li><strong>Cancha:</strong> ${input.cancha}</li>
        <li><strong>Fecha:</strong> ${input.fecha}</li>
        <li><strong>Hora:</strong> ${input.hora}</li>
      </ul>

      ${notaBlock}

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="font-size:12px;color:#718096;margin:0;">
        Si no ves el monto reflejado en las próximas 24 horas, respondé a este
        correo y lo revisamos.
      </p>
    </div>
  `;

  await sendMail({
    to: input.to,
    subject: `Reembolso acreditado — S/ ${input.monto.toFixed(2)}`,
    html,
  });
}
