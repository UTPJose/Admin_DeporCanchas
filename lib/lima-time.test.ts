import { describe, it, expect } from "vitest";
import {
  limaYMD,
  limaHour,
  limaMinutes,
  limaHM,
  addDaysYMD,
  dowYMD,
  weekStartYMD,
  limaToUtcISO,
  ymdLabel,
} from "./lima-time";

describe("limaYMD", () => {
  it("convierte un instante UTC a la fecha de pared en Lima (UTC-5)", () => {
    expect(limaYMD("2026-07-10T02:00:00Z")).toBe("2026-07-09");
  });
});

describe("limaHour / limaMinutes", () => {
  it("da la hora y minutos de pared Lima", () => {
    expect(limaHour("2026-07-10T15:30:00Z")).toBe(10);
    expect(limaMinutes("2026-07-10T15:30:00Z")).toBe(30);
  });
});

describe("limaHM", () => {
  it("da HH:MM cero-rellenado en hora Lima", () => {
    expect(limaHM("2026-07-10T15:05:00Z")).toBe("10:05");
  });

  it("rellena la hora con cero antes de mediodía Lima", () => {
    // 2026-07-10T05:00:00Z = 2026-07-10T00:00:00 hora Lima
    expect(limaHM("2026-07-10T05:00:00Z")).toBe("00:00");
  });
});

describe("addDaysYMD", () => {
  it("suma y resta días cruzando mes", () => {
    expect(addDaysYMD("2026-07-30", 3)).toBe("2026-08-02");
    expect(addDaysYMD("2026-07-01", -1)).toBe("2026-06-30");
  });
});

describe("dowYMD", () => {
  it("da el día de la semana 0=Dom..6=Sáb", () => {
    expect(dowYMD("2026-07-10")).toBe(5); // viernes
    expect(dowYMD("2026-07-12")).toBe(0); // domingo
  });
});

describe("weekStartYMD", () => {
  it("da el lunes de la semana para un día entre semana", () => {
    // 2026-07-10 es viernes -> lunes de esa semana es 2026-07-06
    expect(weekStartYMD("2026-07-10")).toBe("2026-07-06");
  });

  it("da el lunes correcto cuando la fecha ya es lunes", () => {
    expect(weekStartYMD("2026-07-06")).toBe("2026-07-06");
  });

  it("da el lunes correcto para un domingo (retrocede 6 días)", () => {
    expect(weekStartYMD("2026-07-12")).toBe("2026-07-06");
  });
});

describe("limaToUtcISO", () => {
  it("convierte hora de pared Lima a instante UTC", () => {
    expect(limaToUtcISO("2026-07-10", "08:00")).toBe("2026-07-10T13:00:00.000Z");
  });
});

describe("ymdLabel", () => {
  it("da una etiqueta corta en español", () => {
    // Node/ICU formatea el mes abreviado con punto ("may.")
    expect(ymdLabel("2026-05-22")).toBe("22 may.");
  });
});
