import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { fireEvent, getAllByRole, getByRole } from "@testing-library/dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import QalyExplorer from "./QalyExplorer";
import * as model from "../lib/mackenzie-qaly";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function renderExplorer() {
  await act(async () => root.render(React.createElement(QalyExplorer)));
  await act(async () => vi.advanceTimersByTime(100));
}

describe("explorer controls", () => {
  it("names all sliders, associates help, and reports selected controls", async () => {
    await renderExplorer();
    const sliders = getAllByRole(container, "slider", { hidden: true }) as HTMLInputElement[];
    expect(sliders).toHaveLength(17);
    expect(new Set(sliders.map((slider) => slider.id)).size).toBe(sliders.length);
    for (const slider of sliders) {
      expect(slider.labels?.length).toBe(1);
      expect(slider.getAttribute("aria-valuetext")).toBeTruthy();
    }
    const evidence = getByRole(container, "slider", { name: "Evidence stance" });
    expect(evidence.getAttribute("aria-valuetext")).toBe("best guess");
    const help = document.getElementById(evidence.getAttribute("aria-describedby")!);
    expect(help?.textContent).toContain("study identifies causation");
    expect(getByRole(container, "button", { name: "v1.2" }).getAttribute("aria-pressed")).toBe("true");
    expect(getByRole(container, "button", { name: "Standard" }).getAttribute("aria-pressed")).toBe("true");
    await act(async () => fireEvent.click(getByRole(container, "button", { name: "v1.1" })));
    expect(getByRole(container, "button", { name: "v1.1" }).getAttribute("aria-pressed")).toBe("true");
    expect(getByRole(container, "button", { name: "v1.2" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("exposes native keyboard sort buttons and sorts in both directions", async () => {
    await renderExplorer();
    const sort = getByRole(container, "button", { name: "Sort by Cause" }) as HTMLButtonElement;
    sort.focus();
    expect(document.activeElement).toBe(sort);
    expect(sort.type).toBe("button");
    await act(async () => fireEvent.click(sort));
    expect(sort.closest("th")?.getAttribute("aria-sort")).toBe("ascending");
    expect(container.querySelector("tbody tr td")?.textContent).toBe("Arts & culture");
    await act(async () => fireEvent.click(sort));
    expect(sort.closest("th")?.getAttribute("aria-sort")).toBe("descending");
    expect(container.querySelector("tbody tr td")?.textContent).toBe("Workforce & mobility");
    await act(async () => fireEvent.click(getByRole(container, "button", { name: "By geography" })));
    expect(getByRole(container, "button", { name: "By geography" }).getAttribute("aria-pressed")).toBe("true");
    expect(getByRole(container, "button", { name: "By cause" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("passes exact giving dollars to the model and table", async () => {
    const compute = vi.spyOn(model, "computeAll");
    await renderExplorer();
    expect(compute.mock.lastCall?.[0].totalGiving).toBe(model.PARAMS.meta.total_giving_usd);
    const exactTotal = "$" + Math.round(model.PARAMS.meta.total_giving_usd).toLocaleString("en-US");
    expect(container.querySelector(`td[title="${exactTotal}"]`)).not.toBeNull();
  });

  it("keeps near-RCT histogram markers and ticks inside the shared chart domain", async () => {
    await renderExplorer();
    const evidence = getByRole(container, "slider", { name: "Evidence stance" });
    await act(async () => fireEvent.change(evidence, { target: { value: "0" } }));
    await act(async () => vi.advanceTimersByTime(100));
    expect(evidence.getAttribute("aria-valuetext")).toBe("RCT-only");
    const chart = getByRole(container, "img", { name: /Distribution of estimated QALYs, median 9k/ });
    for (const marker of chart.querySelectorAll("line")) {
      expect(Number(marker.getAttribute("x1"))).toBeGreaterThanOrEqual(8);
      expect(Number(marker.getAttribute("x1"))).toBeLessThanOrEqual(632);
    }
    for (const label of chart.querySelectorAll("text")) {
      expect(Number(label.getAttribute("x"))).toBeGreaterThanOrEqual(8);
      expect(Number(label.getAttribute("x"))).toBeLessThanOrEqual(632);
    }
  });

  it("keeps tick labels finite at the largest representable positive value", async () => {
    const ordinary = model.computeAll({ n: 100, seed: 0 });
    vi.spyOn(model, "computeAll").mockReturnValue({
      ...ordinary,
      ...model.histogramOf([Number.MAX_VALUE]),
      medianLog: Math.log10(Number.MAX_VALUE),
      summary: { ...ordinary.summary, median: Number.MAX_VALUE, mean: Number.MAX_VALUE },
    });
    await renderExplorer();
    const chart = getByRole(container, "img", { name: /Distribution of estimated QALYs/ });
    expect(chart.textContent).not.toContain("Infinity");
  });

  it("distinguishes positive sub-QALY log ticks for the allowed arts-only endpoint", async () => {
    const shares = model.ARCHETYPE_KEYS.map((key) => key === "arts_culture" ? 0.3 : 0);
    const endpoint = model.computeAll({ credulity: 0, shares, n: 10000, seed: 0 });
    vi.spyOn(model, "computeAll").mockReturnValue(endpoint);
    await renderExplorer();
    const chart = getByRole(container, "img", { name: /Distribution of estimated QALYs/ });
    const ticks = Array.from(chart.querySelectorAll("text")).slice(-6)
      .map((node) => node.textContent);
    expect(ticks).not.toContain("0");
    expect(new Set(ticks).size).toBe(6);
  });
});
