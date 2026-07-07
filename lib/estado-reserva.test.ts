import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { estadoMostrado, pasaFiltro } from "./estado-reserva";

describe("estadoMostrado", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("pagada + futuro -> programada", () => {
    expect(estadoMostrado("pagada", "2026-07-20T00:00:00Z")).toBe("programada");
  });

  it("pagada + pasado -> finalizada", () => {
    expect(estadoMostrado("pagada", "2026-07-01T00:00:00Z")).toBe("finalizada");
  });

  it("pendiente -> pendiente", () => {
    expect(estadoMostrado("pendiente", "2026-07-20T00:00:00Z")).toBe("pendiente");
  });

  it("cancelada -> cancelada", () => {
    expect(estadoMostrado("cancelada", "2026-07-20T00:00:00Z")).toBe("cancelada");
  });

  it("expirada (o cualquier otro valor) -> expirada", () => {
    expect(estadoMostrado("expirada", "2026-07-20T00:00:00Z")).toBe("expirada");
    expect(estadoMostrado("bloqueada", "2026-07-20T00:00:00Z")).toBe("expirada");
  });

  it("es insensible a mayúsculas/minúsculas", () => {
    expect(estadoMostrado("PAGADA", "2026-07-20T00:00:00Z")).toBe("programada");
  });

  it("acepta fechaTermina como Date", () => {
    expect(estadoMostrado("pagada", new Date("2026-07-20T00:00:00Z"))).toBe("programada");
  });
});

describe("pasaFiltro", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("'todas' siempre pasa", () => {
    expect(pasaFiltro("todas", "cancelada", "2026-07-20T00:00:00Z")).toBe(true);
  });

  it("filtra programadas correctamente", () => {
    expect(pasaFiltro("programadas", "pagada", "2026-07-20T00:00:00Z")).toBe(true);
    expect(pasaFiltro("programadas", "pagada", "2026-07-01T00:00:00Z")).toBe(false);
  });

  it("filtra finalizadas correctamente", () => {
    expect(pasaFiltro("finalizadas", "pagada", "2026-07-01T00:00:00Z")).toBe(true);
    expect(pasaFiltro("finalizadas", "pagada", "2026-07-20T00:00:00Z")).toBe(false);
  });

  it("filtra pendientes/canceladas/expiradas correctamente", () => {
    expect(pasaFiltro("pendientes", "pendiente", "2026-07-20T00:00:00Z")).toBe(true);
    expect(pasaFiltro("canceladas", "cancelada", "2026-07-20T00:00:00Z")).toBe(true);
    expect(pasaFiltro("expiradas", "expirada", "2026-07-20T00:00:00Z")).toBe(true);
  });

  it("no confunde filtros distintos", () => {
    expect(pasaFiltro("canceladas", "pendiente", "2026-07-20T00:00:00Z")).toBe(false);
  });
});
