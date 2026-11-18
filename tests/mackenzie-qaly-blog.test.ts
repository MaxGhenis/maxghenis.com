import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import diagnostics from '../src/data/mackenzie-qaly-matching-diagnostics.json';
import summary from '../src/data/mackenzie-qaly-summary.json';

const blog = readFileSync('src/content/blog/mackenzie-scott-giving-in-qalys/index.md', 'utf8');
const wholeNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const thousands = (value: number) => wholeNumber.format(1_000 * Math.round(value / 1_000));

describe('MacKenzie Scott blog figures', () => {
  it('quotes the current default median and interval', () => {
    const { median, p05, p95 } = summary.total_qalys;
    expect(blog).toContain(`**${thousands(median)} quality-adjusted life-years (QALYs)**`);
    expect(blog).toContain(`90% simulation interval of ${thousands(p05)}–${thousands(p95)}`);
  });

  it('quotes the current Form 990 calibration', () => {
    const { elasticity, r_squared, n_pairs } = diagnostics.calibration;
    expect(blog).toContain(`**${wholeNumber.format(n_pairs)} disclosed gifts**`);
    expect(blog).toContain(`**${(10 ** elasticity).toFixed(1)} times the fitted gift amount**`);
    expect(blog).toContain(`elasticity ${elasticity.toFixed(2)}, R² ${r_squared.toFixed(2)}`);
  });

  it('links the synced stance figure to the explorer', () => {
    const image = '/mackenzie-scott-qaly/paper-assets/index_files/figure-html/fig-stance-output-1.png';
    expect(blog).toContain(`](${image})](/mackenzie-scott-qaly)`);
    expect(existsSync(`public${image}`)).toBe(true);
  });
});
