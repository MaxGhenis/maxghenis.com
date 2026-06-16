# D.C. mayor LLM forecast design

This directory turns the Cuomo/Mamdani housing exercise into a reproducible forecast harness for the 2026 D.C. mayoral race between Kenyan McDuffie and Janeese Lewis George.

The design separates three things:

1. Primary-source baseline metrics from government data.
2. A prompt grid that varies the election winner and margin.
3. Model responses saved against a JSON schema, so the post can report medians, spreads, model effects, and close-election contrasts without hand-entered tables.

## Metrics

The metric rule is: outcome series must come from a primary government source.

| Metric | Primary source | Forecast unit | Note |
|---|---|---:|---|
| D.C. real GDP | Bureau of Economic Analysis GDP by state | Millions of chained 2017 dollars | Quarterly state GDP, D.C. row |
| Bike lanes | DC Open Data / DDOT Bicycle Lanes ArcGIS layer | Route miles | Current stock layer; lane-miles are also fetched as context |
| Traffic fatalities | DC Open Data / DDOT Crashes in DC ArcGIS layer | Fatal persons per calendar year | Sums all fatality fields in crash records |
| Housing starts proxy | Census Building Permits Survey | New privately owned units authorized by permit | Census does not publish true D.C.-level starts; permits are the primary-source city-level proxy |

## Election design

The prompt grid uses Janeese Lewis George's margin over Kenyan McDuffie as the running variable:

`-20, -10, -1, +1, +10, +20`

Negative margins mean McDuffie wins; positive margins mean George wins. The close-election estimand is the jump from `-1` to `+1`, not the contrast between `-20` and `+20`.

The wider margins are still useful because they ask models to separate:

- candidate effect near the cutoff
- mandate or coalition strength among winners
- correlated political environment that changes with the spread

The paired agent-implied RD is computed within run:

`forecast_i(George wins by 1) - forecast_i(McDuffie wins by 1)`

That differs from subtracting the two aggregated cell medians. The paired estimate preserves the model draw as the unit of analysis.

## Run

From the repo root:

```bash
uv venv --python 3.13
uv pip install -r analysis/dc-mayor-2026/requirements.txt
.venv/bin/python analysis/dc-mayor-2026/scripts/fetch_baselines.py
.venv/bin/python analysis/dc-mayor-2026/scripts/generate_prompts.py
```

Outputs:

- `outputs/baselines.json`
- `outputs/baselines.md`
- `prompts/forecast-cells.jsonl`
- `prompts/base-context.md`

## Model collection

Each JSONL row in `prompts/forecast-cells.jsonl` is one model task. Save raw model responses as JSON objects that validate against `schemas/model-response.schema.json`.

After collecting one or more response files, aggregate them:

```bash
.venv/bin/python analysis/dc-mayor-2026/scripts/aggregate_responses.py
.venv/bin/python analysis/dc-mayor-2026/scripts/export_site_data.py
```

By default, the aggregator reads `analysis/dc-mayor-2026/responses/*.jsonl` and writes:

- `outputs/model-summary.json`
- `outputs/model-summary.md`
- `outputs/agent-rd-pairs.json`
- `outputs/agent-rd-pairs.csv`
- `outputs/agent-rd-summary.json`
- `outputs/agent-rd-summary.md`
- `outputs/forecast-series.json`
- `outputs/forecast-series.csv`
- `outputs/plots/*-mcduffie-margin.svg`
- `../../src/data/dc-mayor-forecast-series.json`

The model summary reports the cell-median close-election contrast as `George close win` minus `McDuffie close win`. The agent RD summary reports paired within-run close-election differences. The plot-ready series flips the prompt margin into McDuffie's margin over George, so the chart runs from `McD -20` to `McD +20`; negative values are George wins and positive values are McDuffie wins. The SVG plots split the line at zero rather than connecting across the discontinuity.

The aggregator also reads `responses/*.compact.json` files. Those store repeated close-cutoff agent outputs compactly as paired quantile arrays, then expand them into schema-compatible records during aggregation.

Recommended sampling plan:

- 6 scenarios x 4 metrics = 24 scenario-metric cells per model
- 3-5 frontier models
- 2 temperatures per model if cost allows
- one blinded run with candidate names masked as Candidate A/B, then one unmasked run
- randomized prompt order
- independent scenario-level calls, ideally one call per margin that asks for all outcomes together

Use the masked and unmasked split to estimate how much responses rely on ideology or name recognition rather than the stated platforms and baseline data.
