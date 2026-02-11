import { describe, expect, test } from 'vitest';

// Extract the pure math functions for testing
const IPD_CM = 6.3;
const FOVEA_DEG = 2;

function deg(rad: number) {
  return (rad * 180) / Math.PI;
}

/** Angular separation of two eyes at given distance */
function angularSeparation(distCm: number): number {
  return 2 * deg(Math.atan((IPD_CM / 2) / distCm));
}

/** Blur amount for the unfocused eye */
function blurAmount(distCm: number): number {
  const separation = angularSeparation(distCm);
  const excessDeg = Math.max(0, separation - FOVEA_DEG);
  return excessDeg * 0.4;
}

/** Exponential slider mapping */
function sliderToDist(v: number): number {
  return 15 * Math.exp((v / 100) * Math.log(500 / 15));
}

function distToSlider(d: number): number {
  return (Math.log(d / 15) / Math.log(500 / 15)) * 100;
}

describe('angular separation', () => {
  test('15cm should be ~23.7° (way beyond fovea)', () => {
    const sep = angularSeparation(15);
    expect(sep).toBeCloseTo(23.7, 0);
    expect(sep).toBeGreaterThan(10);
  });

  test('30cm should be ~12° (beyond fovea)', () => {
    const sep = angularSeparation(30);
    expect(sep).toBeCloseTo(12.0, 0);
    expect(sep).toBeGreaterThan(5);
  });

  test('100cm should be ~3.6° (near foveal range)', () => {
    const sep = angularSeparation(100);
    expect(sep).toBeCloseTo(3.6, 0);
    expect(sep).toBeGreaterThan(2);
    expect(sep).toBeLessThan(5);
  });

  test('300cm should be ~1.2° (within fovea)', () => {
    const sep = angularSeparation(300);
    expect(sep).toBeCloseTo(1.2, 0);
    expect(sep).toBeLessThan(2);
  });
});

describe('blur amount', () => {
  test('at 15cm, blur should be heavy (~8+)', () => {
    expect(blurAmount(15)).toBeGreaterThan(8);
  });

  test('at 30cm, blur should be moderate (~4)', () => {
    const b = blurAmount(30);
    expect(b).toBeGreaterThan(3);
    expect(b).toBeLessThan(6);
  });

  test('at 100cm, blur should be slight (~0.6)', () => {
    const b = blurAmount(100);
    expect(b).toBeGreaterThan(0);
    expect(b).toBeLessThan(1.5);
  });

  test('at 300cm, blur should be zero (within fovea)', () => {
    expect(blurAmount(300)).toBe(0);
  });

  test('at 500cm, blur should be zero', () => {
    expect(blurAmount(500)).toBe(0);
  });

  test('blur decreases monotonically as distance increases', () => {
    const distances = [15, 30, 50, 100, 200, 300, 500];
    for (let i = 1; i < distances.length; i++) {
      expect(blurAmount(distances[i])).toBeLessThanOrEqual(blurAmount(distances[i - 1]));
    }
  });
});

describe('slider mapping', () => {
  test('slider 0 maps to 15cm', () => {
    expect(sliderToDist(0)).toBeCloseTo(15, 0);
  });

  test('slider 100 maps to 500cm', () => {
    expect(sliderToDist(100)).toBeCloseTo(500, 0);
  });

  test('round-trip: distToSlider(sliderToDist(v)) ≈ v', () => {
    for (const v of [0, 25, 50, 75, 100]) {
      expect(distToSlider(sliderToDist(v))).toBeCloseTo(v, 5);
    }
  });
});

type UnitSystem = 'metric' | 'imperial';

function formatDist(cm: number, units: UnitSystem): string {
  if (units === 'imperial') {
    const inches = cm / 2.54;
    if (inches < 24) return `${Math.round(inches)} in`;
    const feet = inches / 12;
    return `${feet.toFixed(1)} ft`;
  }
  return cm < 100 ? `${Math.round(cm)} cm` : `${(cm / 100).toFixed(1)} m`;
}

function rangeLabels(units: UnitSystem): [string, string] {
  return units === 'imperial' ? ['6 in', '16 ft'] : ['15 cm', '5 m'];
}

describe('formatDist', () => {
  test('metric: small distances in cm', () => {
    expect(formatDist(15, 'metric')).toBe('15 cm');
    expect(formatDist(30, 'metric')).toBe('30 cm');
    expect(formatDist(87, 'metric')).toBe('87 cm');
  });

  test('metric: large distances in m', () => {
    expect(formatDist(100, 'metric')).toBe('1.0 m');
    expect(formatDist(250, 'metric')).toBe('2.5 m');
    expect(formatDist(500, 'metric')).toBe('5.0 m');
  });

  test('imperial: small distances in inches', () => {
    expect(formatDist(15, 'imperial')).toBe('6 in');
    expect(formatDist(30, 'imperial')).toBe('12 in');
  });

  test('imperial: large distances in feet', () => {
    expect(formatDist(100, 'imperial')).toBe('3.3 ft');
    expect(formatDist(300, 'imperial')).toBe('9.8 ft');
  });

  test('imperial: threshold at 24 inches (61cm)', () => {
    // Just under 24 inches → still in
    expect(formatDist(60, 'imperial')).toContain('in');
    // Over 24 inches → feet
    expect(formatDist(62, 'imperial')).toContain('ft');
  });
});

describe('rangeLabels', () => {
  test('metric labels', () => {
    expect(rangeLabels('metric')).toEqual(['15 cm', '5 m']);
  });

  test('imperial labels', () => {
    expect(rangeLabels('imperial')).toEqual(['6 in', '16 ft']);
  });
});
