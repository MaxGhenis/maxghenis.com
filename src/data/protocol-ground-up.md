# Protocol Ground-Up Estimates

Fresh, personalized ground-up estimates using the live protocol inventory from `protocol-data.json` and personalization from `health.db`, rather than the existing protocol-page QALY outputs.

## Reference Case

- Base reference case: US Second Panel health care sector reference case
- Perspective: health_care_sector
- Reference-case discounting: 3.0% health, 3.0% costs
- Current protocol discounting: 3.0% health, 3.0% costs
- Reference-case alignment: reference_case_discounting_with_fallback_utility_lineage; formal reference case: no
- Utility gap: The current personal protocol model now uses reference-case discounting. Sleep, sexual-function, hair, GI, musculoskeletal, vision, stress, and functional QOL overlays carry explicit utility lineage; rows without a defensible mapped utility source get no generic QOL overlay. Some symptom overlays and direct harms still use disability-weight fallback lineage rather than preferred EQ-5D/SF-6D/HUI sources, so the output is reference-case aligned, not a formal reference-case cost-utility analysis.

## Baseline

- Generated: 2026-04-28
- 90-day combined sleep: 6.44 h/night (Whoop 6.49 h, Eight Sleep 6.4 h)
- 90-day Whoop recovery: 53.7; Eight Sleep score: 79.4
- Modeled annual sleep-burden drag: 0.0185 QALY/year from direct sleep-related utility loss
- Sleep burden components: duration 0.0021, quality 0.0010, regularity 0.0013, daytime 0.0026, breathing 0.0114
- Latest labs (2026-03-04): LDL 64.0, HDL 73.0, TG 137.0, HbA1c 5.1, Vitamin D 51.5, eGFR 76.0, creatinine 1.24

- Reference-case audit: 0 items still need explicit preference-based utility lineage; 52 items use fallback disability-weight lineage

## Current State

- Full-state value: 0.1326 QALY (48.4 days)
- Additive standalone value: 0.2465 QALY; shared stack adjustment: -0.1139 QALY
- Shared interaction adjustments: benefit_overlap:sleep_duration_support -0.0402, benefit_overlap:sleep_continuity_support -0.0217, benefit_overlap:sleep_quality_support -0.0148, sedation_stack -0.0130, benefit_overlap:neurotrophic_support -0.0079, benefit_overlap:sleep_breathing_support -0.0049, benefit_overlap:anti_inflammatory -0.0036, benefit_overlap:cardiometabolic_support -0.0032, benefit_overlap:gut_support -0.0025, bleeding_stack -0.0016, benefit_overlap:antioxidant_support -0.0004

## Marginal Decisions

Decision rows are computed as V(new full state) - V(current full state), so shared stack effects are counted once.

| Action | Item | ΔQALY | Δdays | P(+Δ) | Δcost | $/QALY | Stack Δ |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| add | HIIT 2x/week | +0.0274 | +10.0 | 95.4% | $0 | free/bundled | +0.0000 |
| add | Tempo run 1x/week | +0.0207 | +7.6 | 95.1% | $0 | free/bundled | +0.0000 |
| add | HIIT 3x/week | +0.0177 | +6.5 | 95.2% | $0 | free/bundled | +0.0000 |
| add | HIIT 1x/week | +0.0170 | +6.2 | 95.2% | $0 | free/bundled | +0.0000 |
| add | APAP nightly | +0.0164 | +6.0 | 89.9% | $3,514 | $214,052 | -0.0238 |
| add | Zone 2 cardio 2x/week | +0.0109 | +4.0 | 95.2% | $0 | free/bundled | +0.0000 |
| add | Custom oral appliance | +0.0087 | +3.2 | 81.9% | $4,393 | $505,714 | -0.0218 |
| add | Traditional dry sauna 4x/week | +0.0051 | +1.8 | 71.7% | $26,781 | $5,298,916 | -0.0048 |
| add | Strength maintenance | +0.0031 | +1.1 | 95.1% | $0 | free/bundled | +0.0000 |
| add | Low-dose lithium 5mg | +0.0025 | +0.9 | 95.4% | $738 | $299,998 | +0.0000 |
| drop | Ashwagandha 600mg | +0.0021 | +0.8 | 56.8% | $-527 | dominant | +0.0107 |
| add | Urolithin A 500mg | +0.0016 | +0.6 | 72.1% | $7,997 | $4,931,576 | -0.0015 |
| add | Infrared sauna 4x/week | +0.0013 | +0.5 | 63.1% | $31,525 | $24,408,164 | -0.0018 |
| drop | Vitamin D 2000 IU | +0.0010 | +0.4 | 46.2% | $-369 | dominant | +0.0000 |
| add | NR 300mg (unbundled) | +0.0009 | +0.3 | 61.0% | $3,479 | $3,911,112 | -0.0027 |
| add | Humidifier nightly | +0.0004 | +0.2 | 58.3% | $703 | $1,613,375 | -0.0025 |
| drop | Curcumin 250mg | +0.0002 | +0.1 | 47.4% | $-351 | dominant | +0.0030 |
| add | Daridorexant 25mg | +0.0001 | +0.0 | 51.5% | $44,510 | $447,436,291 | -0.0096 |
| add | Quercetin 500mg | +0.0001 | +0.0 | 53.1% | $527 | $4,402,953 | -0.0026 |
| add | Rapamycin 5mg/wk | +0.0000 | +0.0 | 0.0% | $5,272 | net negative | +0.0000 |
| add | 17α-estradiol (topical) | +0.0000 | +0.0 | 0.0% | $3,163 | net negative | +0.0000 |
| drop | Vitamin K2 MK-7+MK-4 | +0.0000 | +0.0 | 0.0% | $-383 | net negative | +0.0000 |
| drop | Astaxanthin 12mg | +0.0000 | +0.0 | 0.0% | $0 | net negative | +0.0000 |
| drop | Lycopene 15mg | +0.0000 | +0.0 | 0.0% | $0 | net negative | +0.0000 |
| drop | Fisetin 100mg | +0.0000 | +0.0 | 0.0% | $0 | net negative | +0.0000 |
| add | Fisetin 100mg (unbundled) | +0.0000 | +0.0 | 0.0% | $1,169 | net negative | +0.0000 |
| drop | Spermidine 10mg | +0.0000 | +0.0 | 0.0% | $0 | net negative | +0.0000 |
| drop | Luteolin 100mg | +0.0000 | +0.0 | 0.0% | $0 | net negative | +0.0000 |
| add | Luteolin 100mg (unbundled) | +0.0000 | +0.0 | 0.0% | $1,010 | net negative | +0.0000 |
| drop | Ubiquinol 50mg | +0.0000 | +0.0 | 0.0% | $0 | net negative | +0.0000 |

## Constrained Optimizer

The optimizer searches full protocol states with exclusive groups enforced (for example, one cardio mode and one primary OSA therapy), rather than treating every positive marginal as independently addable.

| Objective | ΔQALY | Δdays | P(+Δ) | Δcost | Net benefit | Adds | Drops | Steps |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: |
| net benefit | +0.0358 | +13.1 | 68.4% | $-29,945 | $37,110 | APAP nightly, HIIT 2x/week, Strength maintenance | Apigenin 50mg, Ashwagandha 600mg, Cistanche 200mg, Cocoa flavanols ~500mg, Collagen 22g, Curcumin 250mg, Garlic 1200mg, Glycine 2g bedtime, Lions Mane 1g, NAC 1200mg, Nasacort nightly, Nasal strips nightly, Omega-3 CLO ~500mg, High-EPA Omega-3 +2g, Prebiotics combo, Daily probiotics, Taurine 500mg top-up, Trazodone 50mg, Vitamin D 2000 IU, Vitamin K2 MK-7+MK-4, Zinc carnosine 75mg | 24 |
| qaly | +0.0769 | +28.1 | 98.2% | $71,495 | $-56,110 | APAP nightly, HIIT 2x/week, Humidifier nightly, Infrared sauna 4x/week, Low-dose lithium 5mg, NR 300mg (unbundled), Quercetin 500mg, Strength maintenance, Traditional dry sauna 4x/week, Urolithin A 500mg | Apigenin 50mg, Ashwagandha 600mg, Glycine 2g bedtime, Trazodone 50mg, Vitamin D 2000 IU | 16 |

## Current Stack Drop Table

Positive Drop ΔQALY means stopping the item is expected to help; negative means stopping is expected to hurt. These are full-state marginal drop values.

| Item | Status | Drop ΔQALY | Drop days | Drop helps | Continue $/QALY | Lineage |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Ashwagandha 600mg | testing | +0.0021 | +0.8 | 56.8% | $60,553 | fallback_utility_lineage |
| Vitamin D 2000 IU | taking | +0.0010 | +0.4 | 46.2% | net negative | reference_case_ready |
| Curcumin 250mg | taking | +0.0002 | +0.1 | 47.4% | $125,830 | fallback_utility_lineage |
| Vitamin K2 MK-7+MK-4 | taking | +0.0000 | +0.0 | 0.0% | net negative | reference_case_ready |
| Astaxanthin 12mg | taking | +0.0000 | +0.0 | 0.0% | flat | reference_case_ready |
| Lycopene 15mg | taking | +0.0000 | +0.0 | 0.0% | flat | reference_case_ready |
| Fisetin 100mg | taking | +0.0000 | +0.0 | 0.0% | flat | reference_case_ready |
| Spermidine 10mg | taking | +0.0000 | +0.0 | 0.0% | flat | reference_case_ready |
| Luteolin 100mg | taking | +0.0000 | +0.0 | 0.0% | flat | reference_case_ready |
| Ubiquinol 50mg | taking | +0.0000 | +0.0 | 0.0% | flat | reference_case_ready |
| Boron 3mg | taking | +0.0000 | +0.0 | 0.0% | flat | reference_case_ready |
| Lithium 1mg orotate | taking | +0.0000 | +0.0 | 0.0% | flat | reference_case_ready |
| Broccoli Seed Ext 200mg | taking | +0.0000 | +0.0 | 0.0% | flat | reference_case_ready |
| Taurine 500mg top-up | testing | +0.0000 | +0.0 | 0.0% | net negative | reference_case_ready |
| Ginger 400mg | taking | -0.0002 | -0.1 | 41.9% | free/bundled | fallback_utility_lineage |
| High-EPA Omega-3 +2g | testing | -0.0002 | -0.1 | 45.0% | $3,702,559 | reference_case_ready |
| Omega-3 CLO ~500mg | taking | -0.0003 | -0.1 | 44.2% | $2,160,587 | reference_case_ready |
| Apigenin 50mg | testing | -0.0004 | -0.1 | 46.8% | $90,347 | fallback_utility_lineage |
| Zinc carnosine 75mg | testing | -0.0006 | -0.2 | 28.1% | $300,000 | fallback_utility_lineage |
| Nasal strips nightly | taking | -0.0007 | -0.2 | 44.9% | $156,911 | fallback_utility_lineage |
| Lutein+Zeaxanthin | taking | -0.0008 | -0.3 | 14.0% | free/bundled | fallback_utility_lineage |
| NAC 1200mg | taking | -0.0009 | -0.3 | 37.2% | $61,353 | fallback_utility_lineage |
| Head elevation nightly | taking | -0.0011 | -0.4 | 43.5% | free/bundled | fallback_utility_lineage |
| Cocoa flavanols ~500mg | taking | -0.0012 | -0.4 | 43.6% | $1,209,193 | reference_case_ready |
| Garlic 1200mg | taking | -0.0015 | -0.5 | 43.0% | $1,206,988 | reference_case_ready |
| Melatonin 300mcg | taking | -0.0015 | -0.5 | 41.8% | $18,784 | fallback_utility_lineage |
| Nasacort nightly | taking | -0.0016 | -0.6 | 35.7% | $71,399 | fallback_utility_lineage |
| Hyaluronic acid (oral) | taking | -0.0016 | -0.6 | 13.3% | free/bundled | fallback_utility_lineage |
| Glycine 2g bedtime | testing | -0.0016 | -0.6 | 35.8% | $22,993 | fallback_utility_lineage |
| Daily probiotics | testing | -0.0017 | -0.6 | 29.8% | $682,500 | fallback_utility_lineage |
| Collagen 22g | taking | -0.0021 | -0.8 | 13.4% | $1,481,530 | fallback_utility_lineage |
| Trazodone 50mg | taking | -0.0027 | -1.0 | 43.3% | $80,025 | fallback_utility_lineage |
| Lions Mane 1g | testing | -0.0030 | -1.1 | 32.5% | $478,333 | fallback_utility_lineage |
| NR 300mg | taking | -0.0036 | -1.3 | 13.5% | free/bundled | fallback_utility_lineage |
| Creatine 5g | taking | -0.0037 | -1.4 | 24.1% | $170,788 | fallback_utility_lineage |
| Cistanche 200mg | testing | -0.0043 | -1.6 | 35.5% | $308,000 | fallback_utility_lineage |
| Prebiotics combo | taking | -0.0052 | -1.9 | 11.0% | $225,000 | fallback_utility_lineage |
| Magnesium 400mg | taking | -0.0097 | -3.5 | 28.7% | $55,126 | fallback_utility_lineage |
| Finasteride 1.25mg | taking | -0.0113 | -4.1 | 28.0% | $185,284 | fallback_utility_lineage |
| Tadalafil 2.5mg | taking | -0.0422 | -15.4 | 5.7% | $73,378 | fallback_utility_lineage |

## Decision Slices

### Actionable By Total QALY

| Item | Status | Type | Total QALY | Days | Cost | $/QALY | P(harm) |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| APAP nightly | considering | sleep | 0.0402 | 14.7 | $3,514 | $87,442 | 0.1% |
| Custom oral appliance | considering | sleep | 0.0304 | 11.1 | $4,393 | $144,359 | 0.1% |
| HIIT 2x/week | watching | exercise | 0.0274 | 10.0 | $0 | dominant | 4.6% |
| Tempo run 1x/week | watching | exercise | 0.0207 | 7.6 | $0 | dominant | 4.9% |
| HIIT 3x/week | watching | exercise | 0.0177 | 6.5 | $0 | dominant | 4.8% |
| HIIT 1x/week | watching | exercise | 0.0170 | 6.2 | $0 | dominant | 4.8% |
| Zone 2 cardio 2x/week | watching | exercise | 0.0109 | 4.0 | $0 | dominant | 4.8% |
| Glycine 2g bedtime | testing | supplement | 0.0107 | 3.9 | $246 | $22,993 | 0.8% |
| Lemborexant 5mg | considering | sleep | 0.0100 | 3.7 | $31,452 | $3,131,440 | 0.0% |
| Traditional dry sauna 4x/week | watching | service | 0.0098 | 3.6 | $26,781 | $2,722,500 | 13.3% |
| Daridorexant 25mg | considering | sleep | 0.0097 | 3.5 | $44,510 | $4,597,228 | 0.0% |
| Cistanche 200mg | testing | supplement | 0.0092 | 3.4 | $2,840 | $308,000 | 21.3% |
| Ashwagandha 600mg | testing | supplement | 0.0087 | 3.2 | $527 | $60,553 | 5.1% |
| Apigenin 50mg | testing | supplement | 0.0074 | 2.7 | $668 | $90,347 | 6.4% |
| Lions Mane 1g | testing | supplement | 0.0074 | 2.7 | $3,529 | $478,333 | 13.3% |

### Actionable By $/QALY

| Item | Status | Type | Total QALY | Days | Cost | $/QALY | P(harm) |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Glycine 2g bedtime | testing | supplement | 0.0107 | 3.9 | $246 | $22,993 | 0.8% |
| Ashwagandha 600mg | testing | supplement | 0.0087 | 3.2 | $527 | $60,553 | 5.1% |
| Doxepin 3mg | considering | sleep | 0.0061 | 2.2 | $434 | $71,190 | 5.4% |
| APAP nightly | considering | sleep | 0.0402 | 14.7 | $3,514 | $87,442 | 0.1% |
| Apigenin 50mg | testing | supplement | 0.0074 | 2.7 | $668 | $90,347 | 6.4% |
| Custom oral appliance | considering | sleep | 0.0304 | 11.1 | $4,393 | $144,359 | 0.1% |
| Quercetin 500mg | watching | supplement | 0.0026 | 1.0 | $527 | $200,000 | 4.8% |
| Humidifier nightly | considering | sleep | 0.0029 | 1.1 | $703 | $242,006 | 8.8% |
| Low-dose lithium 5mg | considering | rx | 0.0025 | 0.9 | $738 | $300,000 | 4.6% |
| Zinc carnosine 75mg | testing | supplement | 0.0018 | 0.6 | $527 | $300,000 | 4.8% |
| Cistanche 200mg | testing | supplement | 0.0092 | 3.4 | $2,840 | $308,000 | 21.3% |
| Mouth tape nightly | considering | sleep | 0.0063 | 2.3 | $1,933 | $308,102 | 15.7% |
| Lions Mane 1g | testing | supplement | 0.0074 | 2.7 | $3,529 | $478,333 | 13.3% |
| Daily probiotics | testing | supplement | 0.0035 | 1.3 | $2,399 | $682,500 | 13.3% |
| NR 300mg (unbundled) | watching | supplement | 0.0036 | 1.3 | $3,479 | $977,778 | 13.2% |

### Supplement Candidates By $/QALY

| Item | Status | Type | Total QALY | Days | Cost | $/QALY | P(harm) |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Glycine 2g bedtime | testing | supplement | 0.0107 | 3.9 | $246 | $22,993 | 0.8% |
| Ashwagandha 600mg | testing | supplement | 0.0087 | 3.2 | $527 | $60,553 | 5.1% |
| Apigenin 50mg | testing | supplement | 0.0074 | 2.7 | $668 | $90,347 | 6.4% |
| Quercetin 500mg | watching | supplement | 0.0026 | 1.0 | $527 | $200,000 | 4.8% |
| Zinc carnosine 75mg | testing | supplement | 0.0018 | 0.6 | $527 | $300,000 | 4.8% |
| Cistanche 200mg | testing | supplement | 0.0092 | 3.4 | $2,840 | $308,000 | 21.3% |
| Lions Mane 1g | testing | supplement | 0.0074 | 2.7 | $3,529 | $478,333 | 13.3% |
| Daily probiotics | testing | supplement | 0.0035 | 1.3 | $2,399 | $682,500 | 13.3% |
| NR 300mg (unbundled) | watching | supplement | 0.0036 | 1.3 | $3,479 | $977,778 | 13.2% |
| Urolithin A 500mg | watching | supplement | 0.0031 | 1.1 | $7,997 | $2,600,000 | 13.3% |
| High-EPA Omega-3 +2g | testing | supplement | 0.0008 | 0.3 | $2,791 | $3,702,559 | 43.6% |

### Free Positive Actions

| Item | Status | Type | Total QALY | Days | Cost | $/QALY | P(harm) |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| HIIT 2x/week | watching | exercise | 0.0274 | 10.0 | $0 | dominant | 4.6% |
| Tempo run 1x/week | watching | exercise | 0.0207 | 7.6 | $0 | dominant | 4.9% |
| HIIT 3x/week | watching | exercise | 0.0177 | 6.5 | $0 | dominant | 4.8% |
| HIIT 1x/week | watching | exercise | 0.0170 | 6.2 | $0 | dominant | 4.8% |
| Zone 2 cardio 2x/week | watching | exercise | 0.0109 | 4.0 | $0 | dominant | 4.8% |
| Strength maintenance | watching | exercise | 0.0031 | 1.1 | $0 | dominant | 4.9% |

### Negative Actionable Items

| Item | Status | Type | Total QALY | Days | Cost | $/QALY | P(harm) |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| GLP-1 RA (semaglutide) | considering | rx | -0.0444 | -16.2 | $52,717 | net negative | 100.0% |
| Low-dose aspirin 81mg | considering | rx | -0.0062 | -2.3 | $154 | net negative | 52.4% |
| Berberine 500mg | watching | supplement | -0.0046 | -1.7 | $1,582 | net negative | 75.5% |
| Acarbose 50mg | considering | rx | -0.0044 | -1.6 | $1,054 | net negative | 95.3% |
| Statin (rosuvastatin 5mg) | considering | rx | -0.0009 | -0.3 | $1,839 | net negative | 45.2% |
| TB-500 cycle | watching | supplement | -0.0009 | -0.3 | $2,956 | net negative | 99.3% |
| EGCG 400mg (green tea) | watching | supplement | -0.0008 | -0.3 | $527 | net negative | 0.9% |
| BPC-157 cycle | watching | supplement | -0.0008 | -0.3 | $2,365 | net negative | 99.6% |
| Metformin 500mg | considering | rx | -0.0005 | -0.2 | $492 | net negative | 46.1% |
| SGLT2i (empagliflozin) | considering | rx | -0.0004 | -0.2 | $31,630 | net negative | 46.6% |
| HBOT 60-session course | watching | service | -0.0003 | -0.1 | $8,491 | net negative | 1.5% |

## Ranking

| Item | Status | Type | Total QALY | Days | Cost | $/QALY | Mortality QALY | Direct Harm | QOL QALY |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Tadalafil 2.5mg | taking | rx | 0.0422 | 15.4 | $3,099 | $73,378 | 0.0035 | -0.0006 | 0.0393 |
| APAP nightly | considering | sleep | 0.0402 | 14.7 | $3,514 | $87,442 | 0.0017 | 0.0000 | 0.0385 |
| Custom oral appliance | considering | sleep | 0.0304 | 11.1 | $4,393 | $144,359 | 0.0013 | 0.0000 | 0.0291 |
| HIIT 2x/week | watching | exercise | 0.0274 | 10.0 | $0 | — | 0.0000 | 0.0000 | 0.0274 |
| Magnesium 400mg | taking | supplement | 0.0272 | 9.9 | $1,497 | $55,126 | 0.0023 | 0.0000 | 0.0248 |
| Trazodone 50mg | taking | rx | 0.0245 | 8.9 | $1,959 | $80,025 | 0.0016 | -0.0105 | 0.0334 |
| Tempo run 1x/week | watching | exercise | 0.0207 | 7.6 | $0 | — | 0.0000 | 0.0000 | 0.0207 |
| HIIT 3x/week | watching | exercise | 0.0177 | 6.5 | $0 | — | 0.0000 | 0.0000 | 0.0177 |
| HIIT 1x/week | watching | exercise | 0.0170 | 6.2 | $0 | — | 0.0000 | 0.0000 | 0.0170 |
| Nasacort nightly | taking | sleep | 0.0148 | 5.4 | $1,054 | $71,399 | 0.0006 | 0.0000 | 0.0141 |
| Melatonin 300mcg | taking | supplement | 0.0140 | 5.1 | $264 | $18,784 | 0.0011 | -0.0011 | 0.0140 |
| Head elevation nightly | taking | sleep | 0.0133 | 4.9 | $0 | — | 0.0006 | 0.0000 | 0.0127 |
| Finasteride 1.25mg | taking | rx | 0.0113 | 4.1 | $2,103 | $185,284 | 0.0000 | -0.0182 | 0.0295 |
| Zone 2 cardio 2x/week | watching | exercise | 0.0109 | 4.0 | $0 | — | 0.0000 | 0.0000 | 0.0109 |
| Glycine 2g bedtime | testing | supplement | 0.0107 | 3.9 | $246 | $22,993 | 0.0004 | 0.0000 | 0.0103 |
| Nasal strips nightly | taking | sleep | 0.0101 | 3.7 | $1,582 | $156,911 | 0.0005 | 0.0000 | 0.0096 |
| Lemborexant 5mg | considering | sleep | 0.0100 | 3.7 | $31,452 | $3,131,440 | 0.0007 | -0.0020 | 0.0113 |
| Traditional dry sauna 4x/week | watching | service | 0.0098 | 3.6 | $26,781 | $2,722,500 | 0.0000 | 0.0000 | 0.0098 |
| Daridorexant 25mg | considering | sleep | 0.0097 | 3.5 | $44,510 | $4,597,228 | 0.0007 | -0.0016 | 0.0106 |
| Cistanche 200mg | testing | supplement | 0.0092 | 3.4 | $2,840 | $308,000 | 0.0000 | 0.0000 | 0.0092 |
| Ashwagandha 600mg | testing | supplement | 0.0087 | 3.2 | $527 | $60,553 | 0.0004 | -0.0031 | 0.0115 |
| Creatine 5g | taking | supplement | 0.0086 | 3.2 | $1,476 | $170,788 | 0.0000 | 0.0000 | 0.0086 |
| Apigenin 50mg | testing | supplement | 0.0074 | 2.7 | $668 | $90,347 | 0.0000 | 0.0000 | 0.0074 |
| Lions Mane 1g | testing | supplement | 0.0074 | 2.7 | $3,529 | $478,333 | 0.0000 | 0.0000 | 0.0074 |
| Prebiotics combo | taking | supplement | 0.0070 | 2.6 | $1,582 | $225,000 | 0.0000 | 0.0000 | 0.0070 |
| Suvorexant 10mg | considering | sleep | 0.0069 | 2.5 | $41,111 | $5,947,479 | 0.0006 | -0.0032 | 0.0095 |
| Mouth tape nightly | considering | sleep | 0.0063 | 2.3 | $1,933 | $308,102 | 0.0003 | -0.0016 | 0.0075 |
| Doxepin 3mg | considering | sleep | 0.0061 | 2.2 | $434 | $71,190 | 0.0004 | -0.0025 | 0.0082 |
| NAC 1200mg | taking | supplement | 0.0057 | 2.1 | $351 | $61,353 | 0.0001 | 0.0000 | 0.0056 |
| NR 300mg | taking | supplement | 0.0036 | 1.3 | $0 | — | 0.0000 | 0.0000 | 0.0036 |
| NR 300mg (unbundled) | watching | supplement | 0.0036 | 1.3 | $3,479 | $977,778 | 0.0000 | 0.0000 | 0.0036 |
| Daily probiotics | testing | supplement | 0.0035 | 1.3 | $2,399 | $682,500 | 0.0000 | 0.0000 | 0.0035 |
| Strength maintenance | watching | exercise | 0.0031 | 1.1 | $0 | — | 0.0000 | 0.0000 | 0.0031 |
| Garlic 1200mg | taking | supplement | 0.0031 | 1.1 | $3,689 | $1,206,988 | 0.0031 | 0.0000 | 0.0000 |
| Urolithin A 500mg | watching | supplement | 0.0031 | 1.1 | $7,997 | $2,600,000 | 0.0000 | 0.0000 | 0.0031 |
| Infrared sauna 4x/week | watching | service | 0.0031 | 1.1 | $31,525 | $10,251,429 | 0.0000 | 0.0000 | 0.0031 |
| Humidifier nightly | considering | sleep | 0.0029 | 1.1 | $703 | $242,006 | 0.0001 | 0.0000 | 0.0028 |
| Curcumin 250mg | taking | supplement | 0.0028 | 1.0 | $351 | $125,830 | 0.0000 | -0.0004 | 0.0032 |
| Cocoa flavanols ~500mg | taking | supplement | 0.0026 | 1.0 | $3,197 | $1,209,193 | 0.0026 | 0.0000 | 0.0000 |
| Quercetin 500mg | watching | supplement | 0.0026 | 1.0 | $527 | $200,000 | 0.0000 | 0.0000 | 0.0026 |
| Low-dose lithium 5mg | considering | rx | 0.0025 | 0.9 | $738 | $300,000 | 0.0000 | 0.0000 | 0.0025 |
| Collagen 22g | taking | supplement | 0.0021 | 0.8 | $3,163 | $1,481,530 | 0.0000 | 0.0000 | 0.0021 |
| Zinc carnosine 75mg | testing | supplement | 0.0018 | 0.6 | $527 | $300,000 | 0.0000 | 0.0000 | 0.0018 |
| Hyaluronic acid (oral) | taking | supplement | 0.0016 | 0.6 | $0 | — | 0.0000 | 0.0000 | 0.0016 |
| Ginger 400mg | taking | supplement | 0.0013 | 0.5 | $0 | — | 0.0000 | 0.0000 | 0.0013 |
| Lutein+Zeaxanthin | taking | supplement | 0.0012 | 0.4 | $0 | — | 0.0000 | 0.0000 | 0.0012 |
| Omega-3 CLO ~500mg | taking | supplement | 0.0010 | 0.4 | $2,213 | $2,160,587 | 0.0010 | 0.0000 | 0.0000 |
| High-EPA Omega-3 +2g | testing | supplement | 0.0008 | 0.3 | $2,791 | $3,702,559 | 0.0008 | 0.0000 | 0.0000 |
| Rapamycin 5mg/wk | considering | rx | 0.0000 | 0.0 | $5,272 | — | 0.0000 | 0.0000 | 0.0000 |
| 17α-estradiol (topical) | considering | rx | 0.0000 | 0.0 | $3,163 | — | 0.0000 | 0.0000 | 0.0000 |
| Vitamin K2 MK-7+MK-4 | taking | supplement | 0.0000 | 0.0 | $383 | — | 0.0000 | 0.0000 | 0.0000 |
| Astaxanthin 12mg | taking | supplement | 0.0000 | 0.0 | $0 | — | 0.0000 | 0.0000 | 0.0000 |
| Lycopene 15mg | taking | supplement | 0.0000 | 0.0 | $0 | — | 0.0000 | 0.0000 | 0.0000 |
| Fisetin 100mg | taking | supplement | 0.0000 | 0.0 | $0 | — | 0.0000 | 0.0000 | 0.0000 |
| Fisetin 100mg (unbundled) | watching | supplement | 0.0000 | 0.0 | $1,169 | — | 0.0000 | 0.0000 | 0.0000 |
| Spermidine 10mg | taking | supplement | 0.0000 | 0.0 | $0 | — | 0.0000 | 0.0000 | 0.0000 |
| Luteolin 100mg | taking | supplement | 0.0000 | 0.0 | $0 | — | 0.0000 | 0.0000 | 0.0000 |
| Luteolin 100mg (unbundled) | watching | supplement | 0.0000 | 0.0 | $1,010 | — | 0.0000 | 0.0000 | 0.0000 |
| Ubiquinol 50mg | taking | supplement | 0.0000 | 0.0 | $0 | — | 0.0000 | 0.0000 | 0.0000 |
| Ubiquinol 50mg (unbundled) | watching | supplement | 0.0000 | 0.0 | $1,054 | — | 0.0000 | 0.0000 | 0.0000 |
| Boron 3mg | taking | supplement | 0.0000 | 0.0 | $0 | — | 0.0000 | 0.0000 | 0.0000 |
| Lithium 1mg orotate | taking | supplement | 0.0000 | 0.0 | $0 | — | 0.0000 | 0.0000 | 0.0000 |
| Broccoli Seed Ext 200mg | taking | supplement | 0.0000 | 0.0 | $0 | — | 0.0000 | 0.0000 | 0.0000 |
| Taurine 500mg top-up | testing | supplement | 0.0000 | 0.0 | $39 | — | 0.0000 | 0.0000 | 0.0000 |
| Ergothioneine 5mg | watching | supplement | 0.0000 | 0.0 | $2,109 | — | 0.0000 | 0.0000 | 0.0000 |
| Sulforaphane 20mg (extra) | watching | supplement | 0.0000 | 0.0 | $1,582 | — | 0.0000 | 0.0000 | 0.0000 |
| Pterostilbene 50mg | watching | supplement | 0.0000 | 0.0 | $1,054 | — | 0.0000 | 0.0000 | 0.0000 |
| Alpha-lipoic acid 300mg | watching | supplement | 0.0000 | 0.0 | $527 | — | 0.0000 | 0.0000 | 0.0000 |
| PQQ 20mg | watching | supplement | 0.0000 | 0.0 | $1,582 | — | 0.0000 | 0.0000 | 0.0000 |
| TMG/Betaine 1g | watching | supplement | 0.0000 | 0.0 | $264 | — | 0.0000 | 0.0000 | 0.0000 |
| Black seed oil 1g | watching | supplement | 0.0000 | 0.0 | $527 | — | 0.0000 | 0.0000 | 0.0000 |
| NMN 500mg | watching | supplement | 0.0000 | 0.0 | $3,163 | — | 0.0000 | 0.0000 | 0.0000 |
| GHK-Cu peptide (topical) | watching | supplement | 0.0000 | 0.0 | $2,636 | — | 0.0000 | 0.0000 | 0.0000 |
| Vitamin C 500mg (extra) | watching | supplement | 0.0000 | 0.0 | $132 | — | 0.0000 | 0.0000 | 0.0000 |
| HBOT 60-session course | watching | service | -0.0003 | -0.1 | $8,491 | — | 0.0000 | -0.0003 | 0.0000 |
| SGLT2i (empagliflozin) | considering | rx | -0.0004 | -0.2 | $31,630 | — | -0.0004 | 0.0000 | 0.0000 |
| Metformin 500mg | considering | rx | -0.0005 | -0.2 | $492 | — | -0.0005 | 0.0000 | 0.0000 |
| EGCG 400mg (green tea) | watching | supplement | -0.0008 | -0.3 | $527 | — | 0.0000 | -0.0008 | 0.0000 |
| BPC-157 cycle | watching | supplement | -0.0008 | -0.3 | $2,365 | — | 0.0000 | -0.0008 | 0.0000 |
| Statin (rosuvastatin 5mg) | considering | rx | -0.0009 | -0.3 | $1,839 | — | -0.0009 | 0.0000 | 0.0000 |
| TB-500 cycle | watching | supplement | -0.0009 | -0.3 | $2,956 | — | 0.0000 | -0.0009 | 0.0000 |
| Vitamin D 2000 IU | taking | supplement | -0.0010 | -0.4 | $369 | — | -0.0010 | 0.0000 | 0.0000 |
| Acarbose 50mg | considering | rx | -0.0044 | -1.6 | $1,054 | — | 0.0000 | 0.0000 | -0.0044 |
| Berberine 500mg | watching | supplement | -0.0046 | -1.7 | $1,582 | — | -0.0002 | 0.0000 | -0.0044 |
| Low-dose aspirin 81mg | considering | rx | -0.0062 | -2.3 | $154 | — | -0.0008 | -0.0054 | 0.0000 |
| GLP-1 RA (semaglutide) | considering | rx | -0.0444 | -16.2 | $52,717 | — | 0.0000 | -0.0356 | -0.0088 |

## Notes By Item

### Tadalafil 2.5mg

- Estimate: 0.0422 QALY (15.4 days), sanity range [0.020, 0.090]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: direct_harm_uses_fallback_disability_weights
- Why: Tadalafil probably matters more through sexual-function / wellbeing utility than through proven life-extension at your baseline risk.
- Personalization: Kept meaningful on QOL because current use reveals real private value, but the mortality side is heavily shrunk because PDE5 survival data are mostly observational in older, higher-risk men.
- Sources: https://pubmed.ncbi.nlm.nih.gov/38777751/, https://pubmed.ncbi.nlm.nih.gov/34775577/

### APAP nightly

- Estimate: 0.0402 QALY (14.7 days), sanity range [0.000, 0.150]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights
- Why: With confirmed OSA, PAP is the most evidence-backed next sleep intervention by a wide margin.
- Personalization: Your March 25, 2026 home study showed mild OSA (REI 7.7/hr), and the updated airway probability is 0.654, so PAP now gets credit from an actual diagnosis rather than only wearable inference.
- Sources: https://pubmed.ncbi.nlm.nih.gov/31806413/, https://aasm.org/wp-content/uploads/2019/11/Treatment-OSA-with-PAP-Patient-Guide.pdf, https://pubmed.ncbi.nlm.nih.gov/30736887/

### Custom oral appliance

- Estimate: 0.0304 QALY (11.1 days), sanity range [0.000, 0.100]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights
- Why: Custom oral appliance should usually underperform PAP on efficacy but can still be a credible option in mild OSA, especially if you prefer non-PAP treatment.
- Personalization: Your home study is already in the nonsevere range (REI 7.7/hr), so a custom oral appliance is now a concrete non-PAP option rather than a speculative backup.
- Sources: https://aasm.org/aasm-and-aadsm-issue-new-joint-clinical-practice-guideline-for-oral-appliance-therapy/, https://pubmed.ncbi.nlm.nih.gov/26094920/, https://pubmed.ncbi.nlm.nih.gov/32665778/

### HIIT 2x/week

- Estimate: 0.0274 QALY (10.0 days), sanity range [0.000, 0.060]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Two HIIT sessions per week is still plausible as a small positive, but only if it replaces easier cardio rather than stacking on top of everything.
- Personalization: Two weekly interval sessions can add a bit more CRF upside, but the marginal return is still capped because you already train daily and your Whoop fitness proxies are strong.
- Sources: https://pubmed.ncbi.nlm.nih.gov/26243014/, https://pubmed.ncbi.nlm.nih.gov/38599681/, https://pubmed.ncbi.nlm.nih.gov/40976973/

### Magnesium 400mg

- Estimate: 0.0272 QALY (9.9 days), sanity range [0.010, 0.050]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights
- Why: At your baseline, magnesium looks more like a sleep-support and small BP intervention than a major longevity lever.
- Personalization: Upweighted because your 90-day combined sleep is only 6.44 h/night; small BP benefit remains because magnesium RCTs are stronger than most supplements.
- Sources: https://pubmed.ncbi.nlm.nih.gov/33865376/, https://pubmed.ncbi.nlm.nih.gov/41000008/, https://pubmed.ncbi.nlm.nih.gov/27402922/

### Trazodone 50mg

- Estimate: 0.0245 QALY (8.9 days), sanity range [-0.010, 0.060]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights, direct_harm_uses_fallback_disability_weights
- Why: Trazodone looks like a symptomatic sleep/QOL tool here, not a credible mortality intervention.
- Personalization: Upweighted because sleep is still clearly below target, but netted against hangover / dependency / long-run medication burden rather than assuming all sleep-med utility is durable.
- Sources: https://pubmed.ncbi.nlm.nih.gov/36216367/, https://pubmed.ncbi.nlm.nih.gov/22208861/, https://pubmed.ncbi.nlm.nih.gov/41209816/

### Tempo run 1x/week

- Estimate: 0.0207 QALY (7.6 days), sanity range [0.000, 0.045]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: A weekly tempo run is a credible middle-ground training intervention with modest expected upside.
- Personalization: I place tempo work between zone 2 and HIIT: probably more additive than easy running, but not as distinct a VO2max stimulus as true intervals.
- Sources: https://pubmed.ncbi.nlm.nih.gov/26243014/, https://pubmed.ncbi.nlm.nih.gov/38599681/

### HIIT 3x/week

- Estimate: 0.0177 QALY (6.5 days), sanity range [-0.005, 0.050]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Three HIIT sessions per week could be fine for some people, but for you I model it as roughly flat to slightly worse than 2x/week unless the extra stimulus clearly outperforms the recovery cost.
- Personalization: I allow a third interval session only as a near-flat extension of 2x/week, because your training load is already high and a 2025 frequency study found no clear extra benefit from 3x over 2x in recreational runners.
- Sources: https://pubmed.ncbi.nlm.nih.gov/26243014/, https://pubmed.ncbi.nlm.nih.gov/38599681/, https://pubmed.ncbi.nlm.nih.gov/40976973/

### HIIT 1x/week

- Estimate: 0.0170 QALY (6.2 days), sanity range [0.000, 0.040]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: One weekly HIIT session looks like a plausible way to improve VO2max/cardiorespiratory fitness a bit without assuming sedentary-person returns.
- Personalization: Your 180-day Whoop pattern shows avg strain 11.84 with 22.9% of days at >=14 strain, so I model one structured interval session as a modest CRF upgrade rather than a big new training load.
- Sources: https://pubmed.ncbi.nlm.nih.gov/26243014/, https://pubmed.ncbi.nlm.nih.gov/38599681/

### Nasacort nightly

- Estimate: 0.0148 QALY (5.4 days), sanity range [-0.010, 0.060]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights
- Why: Nasacort looks like a phenotype-specific sleep intervention here: worthwhile if nasal inflammation or congestion is meaningfully contributing, not a generic prevention supplement.
- Personalization: Upweighted because your recent airway-directed trial improved breathing, latency, snoring, and sleep quality, producing an airway-response signal of 0.0.
- Sources: https://pubmed.ncbi.nlm.nih.gov/9042068/, https://pubmed.ncbi.nlm.nih.gov/15124166/

### Melatonin 300mcg

- Estimate: 0.0140 QALY (5.1 days), sanity range [-0.010, 0.030]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights, direct_harm_uses_fallback_disability_weights
- Why: Small, probably real sleep-onset benefit; unlikely to be a big standalone QALY driver.
- Personalization: Upweighted because short sleep is a live issue, but kept modest because human meta-analytic effects are measured in minutes, not hours.
- Sources: https://pubmed.ncbi.nlm.nih.gov/15649737/, https://pubmed.ncbi.nlm.nih.gov/22208861/

### Head elevation nightly

- Estimate: 0.0133 QALY (4.9 days), sanity range [0.000, 0.040]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights
- Why: Head elevation is a low-risk positional airway aid with the best case in upper-airway-predominant sleep-disordered breathing.
- Personalization: Upweighted because your recent improvement pattern is compatible with an upper-airway contributor, but kept modest because your home data do not cleanly isolate elevation from the other airway changes.
- Sources: https://pubmed.ncbi.nlm.nih.gov/39347559/

### Finasteride 1.25mg

- Estimate: 0.0113 QALY (4.1 days), sanity range [-0.010, 0.060]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: direct_harm_uses_fallback_disability_weights
- Why: Hair-loss treatment has meaningful psychosocial value for some men, but very little credible mortality effect.
- Personalization: Modeled almost entirely as QOL: hair preservation seems clearly valued, but I netted that against sexual-side-effect risk rather than assuming pure upside.
- Sources: https://pubmed.ncbi.nlm.nih.gov/21806672/, https://pubmed.ncbi.nlm.nih.gov/37605428/, https://pubmed.ncbi.nlm.nih.gov/28396101/

### Zone 2 cardio 2x/week

- Estimate: 0.0109 QALY (4.0 days), sanity range [0.000, 0.025]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Structured zone-2 work is still plausible as a small positive, but less likely than HIIT to create a meaningful new stimulus in your current routine.
- Personalization: Because you already run and train daily, I only give a small positive for making some cardio more intentionally aerobic and structured.
- Sources: https://pubmed.ncbi.nlm.nih.gov/38599681/

### Glycine 2g bedtime

- Estimate: 0.0107 QALY (3.9 days), sanity range [-0.010, 0.030]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights
- Why: Glycine looks like a plausible sleep/QOL helper rather than a major mortality intervention.
- Personalization: Upweighted because sleep remains an active problem, but the evidence is still mainly symptom-level and measured in modest changes.
- Sources: https://pubmed.ncbi.nlm.nih.gov/22529837/

### Nasal strips nightly

- Estimate: 0.0101 QALY (3.7 days), sanity range [0.000, 0.030]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights
- Why: Nasal strips can help if upper-airway narrowing is part of the problem, but they are usually an adjunct rather than a decisive treatment.
- Personalization: Upweighted because your own notes say the first night with strips plus Nasacort gave zero snoring, but kept smaller than Nasacort because the evidence is mostly subjective-sleep benefit.
- Sources: https://pubmed.ncbi.nlm.nih.gov/30154874/

### Lemborexant 5mg

- Estimate: 0.0100 QALY (3.7 days), sanity range [-0.005, 0.055]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights, direct_harm_uses_fallback_disability_weights
- Why: Lemborexant looks like a credible evidence-based trazodone alternative in mild OSA, with stronger sleep-maintenance efficacy than doxepin and less respiratory discomfort than suvorexant.
- Personalization: Modeled as a strong maintenance-insomnia candidate with actual OSA respiratory-safety data, but probably a bit more next-day drag than daridorexant and likely not covered on your plan.
- Sources: https://pubmed.ncbi.nlm.nih.gov/32585700/, https://pubmed.ncbi.nlm.nih.gov/32187781/, https://pubmed.ncbi.nlm.nih.gov/37677076/, https://pubmed.ncbi.nlm.nih.gov/40848323/

### Traditional dry sauna 4x/week

- Estimate: 0.0098 QALY (3.6 days), sanity range [0.000, 0.030]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Traditional dry sauna is the most plausible of the classic biohacker add-ons, but the credible benefit for you still looks modest.
- Personalization: You already exercise daily and your cardiometabolic baseline is good, so I treat sauna as a modest relaxation/recovery and BP-surrogate intervention rather than as a real direct-longevity claim.
- Sources: https://pubmed.ncbi.nlm.nih.gov/25705824/, https://pmc.ncbi.nlm.nih.gov/articles/PMC9394774/

### Daridorexant 25mg

- Estimate: 0.0097 QALY (3.5 days), sanity range [-0.005, 0.050]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights, direct_harm_uses_fallback_disability_weights
- Why: Daridorexant looks like a more evidence-aligned insomnia alternative than trazodone in mild OSA, especially if you want less generic sedation.
- Personalization: Modeled as the cleanest trazodone replacement candidate because it targets maintenance insomnia and has direct mild-to-moderate OSA respiratory-safety evidence, but its cost is brutal.
- Sources: https://pubmed.ncbi.nlm.nih.gov/35065036/, https://pubmed.ncbi.nlm.nih.gov/33305817/, https://pubmed.ncbi.nlm.nih.gov/39543812/

### Cistanche 200mg

- Estimate: 0.0092 QALY (3.4 days), sanity range [0.000, 0.020]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Cistanche is a plausible functional-performance bet with weak hard-outcome evidence.
- Personalization: Small positive through possible exercise/recovery utility, not because I trust a direct longevity story.
- Sources: https://www.amazon.com/dp/B08VTFXWQF

### Ashwagandha 600mg

- Estimate: 0.0087 QALY (3.2 days), sanity range [-0.015, 0.040]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights, direct_harm_uses_fallback_disability_weights
- Why: Ashwagandha is best modeled as a stress/sleep/QOL intervention with non-zero rare downside.
- Personalization: This is one of the few candidates I’d keep meaningfully positive because your sleep/stress profile leaves room for symptomatic benefit.
- Sources: no robust, directly on-point human outcome source found in this pass

### Creatine 5g

- Estimate: 0.0086 QALY (3.2 days), sanity range [0.000, 0.030]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Creatine has decent functional evidence, but most of the compelling data are performance / body-composition and older-adult contexts rather than mortality.
- Personalization: Kept positive for muscle/performance resilience, but trimmed because you are 39 rather than sarcopenic and because creatinine/eGFR make me avoid giving it a free pass.
- Sources: https://pubmed.ncbi.nlm.nih.gov/39074168/, https://pubmed.ncbi.nlm.nih.gov/24576864/

### Apigenin 50mg

- Estimate: 0.0074 QALY (2.7 days), sanity range [-0.010, 0.020]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights
- Why: Apigenin is a reasonable sleep-stack experiment, but not a proven life-extension tool.
- Personalization: Kept positive only through plausible calming/sleep utility, not through a strong causal longevity claim.
- Sources: https://www.amazon.com/dp/B09DGTBBSF

### Lions Mane 1g

- Estimate: 0.0074 QALY (2.7 days), sanity range [0.000, 0.015]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Lion’s Mane is plausible as a small cognitive/QOL bet, not a large life-extension lever.
- Personalization: Small only: human evidence is mainly cognition/mood signal, not durable prevention.
- Sources: https://www.amazon.com/dp/B00OVF9DVM

### Prebiotics combo

- Estimate: 0.0070 QALY (2.6 days), sanity range [0.000, 0.020]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Prebiotics may help GI comfort or satiety, but human hard-endpoint evidence is weak.
- Personalization: Modeled as a gut-symptom / bowel-habit item rather than a mortality lever.
- Sources: https://pubmed.ncbi.nlm.nih.gov/24230488/, https://pubmed.ncbi.nlm.nih.gov/41233756/

### Suvorexant 10mg

- Estimate: 0.0069 QALY (2.5 days), sanity range [-0.008, 0.045]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights, direct_harm_uses_fallback_disability_weights
- Why: Suvorexant is still a plausible maintenance-insomnia option, but the respiratory-safety story in OSA is less clean, so it ranks below the other DORAs for you.
- Personalization: Modeled as meaningfully better than trazodone on mechanism, but with more OSA-specific respiratory caution and next-day somnolence risk than daridorexant or lemborexant.
- Sources: https://pubmed.ncbi.nlm.nih.gov/27397664/, https://pubmed.ncbi.nlm.nih.gov/26194728/, https://pubmed.ncbi.nlm.nih.gov/39543812/, https://www.drugs.com/pro/belsomra.html

### Mouth tape nightly

- Estimate: 0.0063 QALY (2.3 days), sanity range [-0.002, 0.030]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights, direct_harm_uses_fallback_disability_weights
- Why: Mouth tape is modeled as a plausible adjunct if habitual open-mouth breathing is part of the problem, not as a broad OSA treatment. The direct evidence is small and mostly in mild OSA or snoring.
- Personalization: Upweighted because you now have confirmed mild OSA plus a strong recent airway-response pattern, but kept below strips and head elevation because mouth tape only really makes sense if mouth breathing is part of the phenotype and your data still point heavily to nasal and upper-airway contributors; upper-airway probability is 0.654.
- Sources: https://pubmed.ncbi.nlm.nih.gov/25450408/, https://pubmed.ncbi.nlm.nih.gov/38780959/, https://pubmed.ncbi.nlm.nih.gov/39662104/, https://pubmed.ncbi.nlm.nih.gov/25766699/

### Doxepin 3mg

- Estimate: 0.0061 QALY (2.2 days), sanity range [-0.010, 0.040]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights, direct_harm_uses_fallback_disability_weights
- Why: Low-dose doxepin has better insomnia-guideline support than trazodone for sleep maintenance, but it remains a symptom treatment rather than an airway fix.
- Personalization: Modeled as a better-targeted sleep-maintenance bridge than trazodone, but still with some hangover and respiratory caution rather than assuming it is free upside.
- Sources: https://aasm.org/resources/pdf/pharmacologictreatmentofinsomnia.pdf, https://www.accessdata.fda.gov/drugsatfda_docs/label/2010/022036lbl.pdf

### NAC 1200mg

- Estimate: 0.0057 QALY (2.1 days), sanity range [0.000, 0.015]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights
- Why: NAC remains speculative for broad prevention. Its respiratory upside is much more credible in chronic bronchitis or mucus-heavy phenotypes than in nasal-obstruction sleep problems.
- Personalization: Trimmed because your sleep pattern and recent response point more to an upper-airway/nasal issue than a mucus-heavy phenotype. NAC keeps some value for fatigue or secretions, but much less than airway-targeted measures.
- Sources: https://pubmed.ncbi.nlm.nih.gov/38555190/, https://pubmed.ncbi.nlm.nih.gov/28122105/

### NR 300mg

- Estimate: 0.0036 QALY (1.3 days), sanity range [0.000, 0.015]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: NR is still mostly a mechanistic bet, with a small possible symptom pathway for fatigue / recovery.
- Personalization: I kept a small positive here only because there is at least one recent long-COVID RCT signal, but in healthier adults the literature is mostly NAD+ biomarker movement without obvious clinical payoff.
- Sources: https://pubmed.ncbi.nlm.nih.gov/41357333/, https://pubmed.ncbi.nlm.nih.gov/29184669/, https://pubmed.ncbi.nlm.nih.gov/32320006/

### NR 300mg (unbundled)

- Estimate: 0.0036 QALY (1.3 days), sanity range [0.000, 0.015]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Standalone NR should inherit the same tiny clinical estimate as bundled NR, with cost deciding the verdict.
- Personalization: Same biology as bundled NR; the question here is whether it is worth buying as a standalone product.
- Sources: https://pubmed.ncbi.nlm.nih.gov/41357333/, https://pubmed.ncbi.nlm.nih.gov/29184669/, https://pubmed.ncbi.nlm.nih.gov/32320006/, https://www.truniagen.com/products/tru-niagen-300mg

### Daily probiotics

- Estimate: 0.0035 QALY (1.3 days), sanity range [-0.002, 0.010]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Daily probiotics are reasonable to test for GI comfort, but the broad long-run health case is weak and the marginal value on top of your existing gut stack should be small.
- Personalization: Downweighted because you do not have a strong documented GI indication, and you already run other gut-support items, so most of the plausible value here is small symptomatic upside.
- Sources: https://www.sportsresearch.store/products/probiotic-60-billion, https://pubmed.ncbi.nlm.nih.gov/24230488/, https://pubmed.ncbi.nlm.nih.gov/41233756/

### Strength maintenance

- Estimate: 0.0031 QALY (1.1 days), sanity range [0.000, 0.010]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Strength is important in general, but your marginal gain from formalizing it further appears small.
- Personalization: Near flat because your described routine already contains daily strength work, so a separate strength-maintenance intervention adds little.
- Sources: https://pubmed.ncbi.nlm.nih.gov/38599681/

### Garlic 1200mg

- Estimate: 0.0031 QALY (1.1 days), sanity range [0.000, 0.030]
- Reference-case status: reference_case_ready
- Why: Garlic is a plausible small cardiometabolic adjunct, not a major longevity mover for you.
- Personalization: Downweighted because garlic's BP signal is clearest in hypertensive adults and you are not documented hypertensive.
- Sources: https://pubmed.ncbi.nlm.nih.gov/40735665/, https://pubmed.ncbi.nlm.nih.gov/26764326/

### Urolithin A 500mg

- Estimate: 0.0031 QALY (1.1 days), sanity range [0.000, 0.015]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Urolithin A is plausible but still early and expensive.
- Personalization: I kept a small functional upside for exercise recovery / mitochondria, but not enough to justify a major QALY number.
- Sources: no robust, directly on-point human outcome source found in this pass

### Infrared sauna 4x/week

- Estimate: 0.0031 QALY (1.1 days), sanity range [0.000, 0.015]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Infrared sauna may help relaxation or recovery a bit, but the evidence is materially weaker than for Finnish-style dry sauna.
- Personalization: I treat infrared sauna as a weaker recovery/relaxation analog to traditional dry sauna rather than as an equivalent longevity intervention.
- Sources: https://pubmed.ncbi.nlm.nih.gov/41049507/, https://pmc.ncbi.nlm.nih.gov/articles/PMC9394774/

### Humidifier nightly

- Estimate: 0.0029 QALY (1.1 days), sanity range [0.000, 0.010]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, sleep_qol_uses_fallback_disability_weights
- Why: A bedroom humidifier is modeled as a modest nasal-comfort adjunct, not a real OSA treatment. It is most attractive when the room is actually dry or you wake with dry irritated nasal passages.
- Personalization: Kept small because your current evidence points more to upper-airway obstruction and nasal inflammation than to dry-air irritation alone; nasal-inflammation probability is 0.401.
- Sources: https://www.aaaai.org/tools-for-the-public/conditions-library/allergies/humidifiers-and-indoor-allergies, https://www.epa.gov/mold/mold-course-chapter-2, https://pubmed.ncbi.nlm.nih.gov/3348500/

### Curcumin 250mg

- Estimate: 0.0028 QALY (1.0 days), sanity range [0.000, 0.012]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, direct_harm_uses_fallback_disability_weights
- Why: Curcumin is better supported as an anti-inflammatory biomarker intervention than a proven longevity intervention.
- Personalization: Kept small because dose is modest and the strongest human data are for biomarker shifts or disease-specific pain populations.
- Sources: https://pubmed.ncbi.nlm.nih.gov/38945354/, https://pubmed.ncbi.nlm.nih.gov/39478418/

### Cocoa flavanols ~500mg

- Estimate: 0.0026 QALY (1.0 days), sanity range [0.000, 0.030]
- Reference-case status: reference_case_ready
- Why: Some plausible cardiometabolic value, but your current risk profile leaves less headroom.
- Personalization: Downweighted because LDL and glycemia are already good and COSMOS enrolled much older adults.
- Sources: https://pubmed.ncbi.nlm.nih.gov/35294962/

### Quercetin 500mg

- Estimate: 0.0026 QALY (1.0 days), sanity range [0.000, 0.012]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Quercetin might matter in the right symptom cluster, but not as a broad longevity capsule.
- Personalization: Kept small because the best case is symptom relief in inflammatory/viral-persistence settings, not generic prevention.
- Sources: no robust, directly on-point human outcome source found in this pass

### Low-dose lithium 5mg

- Estimate: 0.0025 QALY (0.9 days), sanity range [-0.015, 0.015]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Interesting neuropsychiatric hedge, but still thin as a quantified longevity intervention.
- Personalization: Kept small because the low-dose human outcome case is still mostly ecological and indirect.
- Sources: no robust, directly on-point human outcome source found in this pass

### Collagen 22g

- Estimate: 0.0021 QALY (0.8 days), sanity range [0.000, 0.010]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Collagen may help joint or skin outcomes in the right phenotype, but your baseline does not scream high-yield collagen responder. A much smaller downstream fall/fracture pathway is included with age gating.
- Personalization: Strongly downweighted because the better human data are in osteoarthritis / meniscopathy, not healthy adults without documented joint disease. Any fall/fracture benefit is modeled as much smaller and grows mainly with age.
- Sources: https://pubmed.ncbi.nlm.nih.gov/39212129/, https://pubmed.ncbi.nlm.nih.gov/38218227/, https://pubmed.ncbi.nlm.nih.gov/37432180/

### Zinc carnosine 75mg

- Estimate: 0.0018 QALY (0.6 days), sanity range [0.000, 0.006]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Zinc carnosine is a phenotype-specific gut-symptom intervention, not a broad longevity tool.
- Personalization: Useful mainly if you have a real GI barrier/irritation problem; otherwise near zero.
- Sources: no robust, directly on-point human outcome source found in this pass

### Hyaluronic acid (oral)

- Estimate: 0.0016 QALY (0.6 days), sanity range [0.000, 0.010]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Oral hyaluronic acid may have symptom value, but it looks phenotype-specific. A much smaller downstream fall/fracture pathway is included with age gating.
- Personalization: Downweighted because oral HA benefits are mostly in chronic pain / joint-discomfort populations. Any fall/fracture benefit is modeled as much smaller and grows mainly with age.
- Sources: https://pubmed.ncbi.nlm.nih.gov/25415767/, https://pubmed.ncbi.nlm.nih.gov/41479667/

### Ginger 400mg

- Estimate: 0.0013 QALY (0.5 days), sanity range [0.000, 0.010]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Ginger looks mildly helpful, but not transformative. A much smaller downstream fall/fracture pathway is included with age gating.
- Personalization: Small positive only because human data support biomarker improvements and some joint-pain benefit, but your baseline does not show an obvious inflammatory pain phenotype. Any fall/fracture benefit is modeled as much smaller and grows mainly with age.
- Sources: https://pubmed.ncbi.nlm.nih.gov/41123858/, https://pubmed.ncbi.nlm.nih.gov/40732990/

### Lutein+Zeaxanthin

- Estimate: 0.0012 QALY (0.4 days), sanity range [0.000, 0.008]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Reasonable eye-health hedge, but the extrapolation to you is thin.
- Personalization: Downweighted because AREDS2 is secondary prevention in older adults with existing AMD risk, not primary prevention for a 39-year-old.
- Sources: https://pubmed.ncbi.nlm.nih.gov/39025435/, https://pubmed.ncbi.nlm.nih.gov/24638908/

### Omega-3 CLO ~500mg

- Estimate: 0.0010 QALY (0.4 days), sanity range [0.000, 0.015]
- Reference-case status: reference_case_ready
- Why: The marginal benefit of low-dose cod liver oil looks small at your baseline risk.
- Personalization: Strongly downweighted because this is a low dose and your LDL/HbA1c are already favorable.
- Sources: https://pubmed.ncbi.nlm.nih.gov/32722395/, https://pubmed.ncbi.nlm.nih.gov/24638908/

### High-EPA Omega-3 +2g

- Estimate: 0.0008 QALY (0.3 days), sanity range [-0.002, 0.020]
- Reference-case status: reference_case_ready
- Why: Some cardiometabolic plausibility remains, but the incremental value over your existing health profile is modest.
- Personalization: Marginally more plausible than low-dose omega-3 because triglycerides are not perfect, but still sharply trimmed at your baseline risk.
- Sources: https://www.amazon.com/dp/B07DX89ZHN

### Rapamycin 5mg/wk

- Estimate: 0.0000 QALY (0.0 days), sanity range [-0.010, 0.030]
- Reference-case status: reference_case_ready
- Why: Rapamycin remains interesting, but human longevity evidence is too incomplete for a large positive estimate.
- Personalization: I am treating this mainly as an uncertain translational hypothesis, not a currently supported personal-health intervention.
- Sources: https://pubmed.ncbi.nlm.nih.gov/35322235/

### 17α-estradiol (topical)

- Estimate: 0.0000 QALY (0.0 days), sanity range [-0.010, 0.020]
- Reference-case status: reference_case_ready
- Why: No strong basis for a meaningful human QALY claim here yet.
- Personalization: Near zero because this is still mostly mouse lifespan extrapolation.
- Sources: no robust, directly on-point human outcome source found in this pass

### Vitamin K2 MK-7+MK-4

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.008]
- Reference-case status: reference_case_ready
- Why: Vitamin K2 is a weak preventive bet at your age unless there is a clearer bone-risk story.
- Personalization: Kept near zero because the more favorable fracture/BMD data are mostly in older postmenopausal populations.
- Sources: https://pubmed.ncbi.nlm.nih.gov/35625785/, https://pubmed.ncbi.nlm.nih.gov/36033779/

### Astaxanthin 12mg

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.005]
- Reference-case status: reference_case_ready
- Why: Interesting antioxidant biomarker story, but weak evidence for durable clinical payoff in someone like you.
- Personalization: Kept near zero because the human literature is mostly biomarker and specialty-population work.
- Sources: https://pubmed.ncbi.nlm.nih.gov/41596351/, https://pubmed.ncbi.nlm.nih.gov/41710469/

### Lycopene 15mg

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.005]
- Reference-case status: reference_case_ready
- Why: Lycopene may be fine, but I do not see a strong supplement-specific QALY signal.
- Personalization: Near zero because the cardiovascular literature is mainly observational and food-pattern confounding is hard to strip away.
- Sources: https://pubmed.ncbi.nlm.nih.gov/28318092/

### Fisetin 100mg

- Estimate: 0.0000 QALY (0.0 days), sanity range [-0.002, 0.005]
- Reference-case status: reference_case_ready
- Why: Strong marketing and interesting biology, but not enough human evidence for a positive ground-up estimate.
- Personalization: Modeled as flat because fisetin is still largely a senolytic hypothesis in humans.
- Sources: no robust, directly on-point human outcome source found in this pass

### Fisetin 100mg (unbundled)

- Estimate: 0.0000 QALY (0.0 days), sanity range [-0.010, 0.020]
- Reference-case status: reference_case_ready
- Why: There is still no strong human basis for a meaningful fisetin QALY claim.
- Personalization: Same skeptical estimate as bundled fisetin; standalone purchase is mostly a cost question.
- Sources: https://doublewoodsupplements.com/products/fisetin

### Spermidine 10mg

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.005]
- Reference-case status: reference_case_ready
- Why: Spermidine is still more of a longevity hypothesis than a demonstrated human benefit.
- Personalization: Near zero because the better human RCT found no memory benefit despite strong preclinical enthusiasm.
- Sources: https://pubmed.ncbi.nlm.nih.gov/35616942/

### Luteolin 100mg

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.005]
- Reference-case status: reference_case_ready
- Why: Luteolin remains mostly a mechanistic / preclinical longevity ingredient.
- Personalization: Near zero because I could not justify a meaningful clinical effect from current human outcome data.
- Sources: no robust, directly on-point human outcome source found in this pass

### Luteolin 100mg (unbundled)

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.005]
- Reference-case status: reference_case_ready
- Why: Standalone luteolin should inherit the same mechanistic-only estimate as bundled luteolin.
- Personalization: Same near-zero estimate as bundled luteolin; useful mainly to compare whether buying it separately makes any sense.
- Sources: https://doublewoodsupplements.com/products/luteolin

### Ubiquinol 50mg

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.010]
- Reference-case status: reference_case_ready
- Why: CoQ10 can be useful in cardiac disease or statin myalgia, but that is not the main story here.
- Personalization: Near zero because the strongest CoQ10 evidence is in heart failure, which is not your phenotype.
- Sources: https://pubmed.ncbi.nlm.nih.gov/39462324/, https://pubmed.ncbi.nlm.nih.gov/35608922/

### Ubiquinol 50mg (unbundled)

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.010]
- Reference-case status: reference_case_ready
- Why: Standalone ubiquinol should inherit the same weak phenotype-specific estimate as bundled ubiquinol.
- Personalization: Same small CoQ10 estimate as the bundled version; the standalone question is mostly about whether it is worth buying separately.
- Sources: https://pubmed.ncbi.nlm.nih.gov/39462324/, https://pubmed.ncbi.nlm.nih.gov/35608922/, https://www.lifeextension.com/vitamins-supplements/item01425/super-ubiquinol-coq10-with-ppm-pyrroloquinoline-quinone

### Boron 3mg

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.005]
- Reference-case status: reference_case_ready
- Why: Boron may matter for micronutrient biology, but not enough to give it a real QALY number beyond noise.
- Personalization: Near zero because I could not justify a clinically meaningful human outcome effect here.
- Sources: no robust, directly on-point human outcome source found in this pass

### Lithium 1mg orotate

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.005]
- Reference-case status: reference_case_ready
- Why: Interesting hypothesis space, but not enough human intervention data for a large claim.
- Personalization: Kept near zero because microdose lithium/orotate evidence is too thin to support a stronger estimate.
- Sources: no robust, directly on-point human outcome source found in this pass

### Broccoli Seed Ext 200mg

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.008]
- Reference-case status: reference_case_ready
- Why: Promising biology; still thin as a personalized QALY lever.
- Personalization: Near zero because sulforaphane has mechanistic appeal but little direct hard-endpoint evidence in a healthy adult.
- Sources: no robust, directly on-point human outcome source found in this pass

### Taurine 500mg top-up

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.010]
- Reference-case status: reference_case_ready
- Why: The marginal increment from 1.5g to 2g should not look large.
- Personalization: Very small because this is only a top-up on top of Longevity Mix, not a full taurine intervention.
- Sources: https://pubmed.ncbi.nlm.nih.gov/34039357/, https://pubmed.ncbi.nlm.nih.gov/39796489/

### Ergothioneine 5mg

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.008]
- Reference-case status: reference_case_ready
- Why: Interesting biomarker story, weak supplement-level clinical story.
- Personalization: Near zero because most of the case is still observational and nutrient-status based.
- Sources: no robust, directly on-point human outcome source found in this pass

### Sulforaphane 20mg (extra)

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.010]
- Reference-case status: reference_case_ready
- Why: The extra dose is mostly mechanistic optimism.
- Personalization: Incremental-only because you already get some sulforaphane exposure from food and the bundled broccoli seed extract.
- Sources: no robust, directly on-point human outcome source found in this pass

### Pterostilbene 50mg

- Estimate: 0.0000 QALY (0.0 days), sanity range [-0.002, 0.008]
- Reference-case status: reference_case_ready
- Why: Little reason to assign a meaningful QALY effect.
- Personalization: Near zero because this is still a resveratrol-family hypothesis, not a robust human outcome intervention.
- Sources: no robust, directly on-point human outcome source found in this pass

### Alpha-lipoic acid 300mg

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.008]
- Reference-case status: reference_case_ready
- Why: Weak general-prevention case.
- Personalization: Near zero because the best-supported use case is diabetic neuropathy, not your phenotype.
- Sources: no robust, directly on-point human outcome source found in this pass

### PQQ 20mg

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.008]
- Reference-case status: reference_case_ready
- Why: Should be near zero unless future evidence improves materially.
- Personalization: Mostly a mitochondrial-biomarker bet with little direct human utility evidence.
- Sources: no robust, directly on-point human outcome source found in this pass

### TMG/Betaine 1g

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.005]
- Reference-case status: reference_case_ready
- Why: Hard to justify more than noise-level utility.
- Personalization: Tiny because this is mostly a methylation-support adjunct, not a clinically demonstrated intervention.
- Sources: no robust, directly on-point human outcome source found in this pass

### Black seed oil 1g

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.010]
- Reference-case status: reference_case_ready
- Why: Interesting anti-inflammatory profile, weak quantified personal-health case.
- Personalization: Kept near zero because evidence remains mostly biomarker and specialty-population work.
- Sources: no robust, directly on-point human outcome source found in this pass

### NMN 500mg

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.008]
- Reference-case status: reference_case_ready
- Why: Mechanistic appeal is stronger than demonstrated clinical value.
- Personalization: Near zero because NR/NMN remain mostly NAD-biomarker interventions in humans.
- Sources: no robust, directly on-point human outcome source found in this pass

### GHK-Cu peptide (topical)

- Estimate: 0.0000 QALY (0.0 days), sanity range [0.000, 0.010]
- Reference-case status: reference_case_ready
- Why: Topical GHK-Cu may help skin appearance, but I am not assigning generic healthspan QALYs without a mapped utility domain.
- Personalization: Modeled as flat because aesthetic/skin appearance utility is not currently represented in the public-health QALY reference case.
- Sources: no robust, directly on-point human outcome source found in this pass

### Vitamin C 500mg (extra)

- Estimate: 0.0000 QALY (0.0 days), sanity range [-0.002, 0.005]
- Reference-case status: reference_case_ready
- Why: No reason to expect much marginal benefit here.
- Personalization: Incremental vitamin C on top of adequate intake should be near flat.
- Sources: no robust, directly on-point human outcome source found in this pass

### HBOT 60-session course

- Estimate: -0.0003 QALY (-0.1 days), sanity range [-0.010, 0.010]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: direct_harm_uses_fallback_disability_weights
- Why: Interesting but weakly grounded for a healthy 39-year-old; the evidence does not justify a large QALY estimate.
- Personalization: I am treating HBOT as a high-cost surrogate-biomarker play with uncertain persistence, not as a demonstrated healthy-aging intervention.
- Sources: https://pubmed.ncbi.nlm.nih.gov/35649312/, https://www.fda.gov/medical-devices/letters-health-care-providers/follow-instructions-safe-use-hyperbaric-oxygen-therapy-devices-letter-health-care-providers

### SGLT2i (empagliflozin)

- Estimate: -0.0004 QALY (-0.2 days), sanity range [-0.010, 0.020]
- Reference-case status: reference_case_ready
- Why: SGLT2 inhibitors are clinically important in the right phenotype, but they should not look like a major longevity drug for you.
- Personalization: Transport is extremely weak here because the flagship benefits are in diabetes, heart failure, and CKD populations rather than a healthy lean 39-year-old.
- Sources: https://pubmed.ncbi.nlm.nih.gov/26378978/

### Metformin 500mg

- Estimate: -0.0005 QALY (-0.2 days), sanity range [-0.010, 0.020]
- Reference-case status: reference_case_ready
- Why: Metformin is plausible as a modest metabolic-risk intervention, but not a big generic longevity lever for your phenotype.
- Personalization: Downweighted heavily because your glycemia is already good and most compelling outcome data are in diabetic or prediabetic populations.
- Sources: https://pubmed.ncbi.nlm.nih.gov/28802803/

### EGCG 400mg (green tea)

- Estimate: -0.0008 QALY (-0.3 days), sanity range [-0.010, 0.010]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: direct_harm_uses_fallback_disability_weights
- Why: Green-tea epidemiology should not become a large EGCG-capsule claim.
- Personalization: Near zero or slightly negative because liver-risk transport is clearer than mortality benefit transport in a supplement user like you.
- Sources: no robust, directly on-point human outcome source found in this pass

### BPC-157 cycle

- Estimate: -0.0008 QALY (-0.3 days), sanity range [-0.010, 0.005]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: direct_harm_uses_fallback_disability_weights
- Why: For a healthy user, BPC-157 should be modeled as near-zero or slightly negative until real human efficacy and product-quality evidence improve.
- Personalization: Without a concrete injury or ulcer-healing phenotype, BPC-157 is mostly gray-market uncertainty and injection burden.
- Sources: https://index.mirasmart.com/AAOS2025/PDFfiles/AAOS2025-009087.PDF, https://www.fda.gov/drugs/human-drug-compounding/understanding-risks-compounded-drugs

### Statin (rosuvastatin 5mg)

- Estimate: -0.0009 QALY (-0.3 days), sanity range [-0.010, 0.050]
- Reference-case status: reference_case_ready
- Why: Statins are one of the more credible preventive drug classes, but the marginal benefit for a lean 39-year-old with already-good lipids is much smaller than headline meta-analytic averages.
- Personalization: Strong causal class, but you already have LDL 64 and no documented ASCVD, so most trial effects shrink hard on transport.
- Sources: https://pubmed.ncbi.nlm.nih.gov/22607822/

### TB-500 cycle

- Estimate: -0.0009 QALY (-0.3 days), sanity range [-0.012, 0.004]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: direct_harm_uses_fallback_disability_weights
- Why: TB-500 looks like a gray-market hypothesis stack component, not a credible general-health intervention.
- Personalization: This is even more speculative than BPC-157 in the absence of a specific recovery use case.
- Sources: https://www.fda.gov/drugs/human-drug-compounding/understanding-risks-compounded-drugs

### Vitamin D 2000 IU

- Estimate: -0.0010 QALY (-0.4 days), sanity range [-0.020, 0.005]
- Reference-case status: reference_case_ready
- Why: Vitamin D looks more like a deficiency correction tool than an additional-optimization tool at your current level.
- Personalization: Almost fully downweighted because your latest 25(OH)D is 51.5 ng/mL, already in a replete range.
- Sources: https://pubmed.ncbi.nlm.nih.gov/37004841/, https://pubmed.ncbi.nlm.nih.gov/28096125/

### Acarbose 50mg

- Estimate: -0.0044 QALY (-1.6 days), sanity range [-0.020, 0.010]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Acarbose is more likely to create hassle than durable value for your current phenotype.
- Personalization: Modeled as mildly negative because GI burden transports better than lifespan-mouse optimism.
- Sources: no robust, directly on-point human outcome source found in this pass

### Berberine 500mg

- Estimate: -0.0046 QALY (-1.7 days), sanity range [-0.020, 0.010]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights
- Why: Berberine is not an attractive personal intervention at your baseline.
- Personalization: Your glycemia is already good, so the GI downside matters more than the diabetes-trial upside.
- Sources: no robust, directly on-point human outcome source found in this pass

### Low-dose aspirin 81mg

- Estimate: -0.0062 QALY (-2.3 days), sanity range [-0.030, 0.010]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: direct_harm_uses_fallback_disability_weights
- Why: Low-dose aspirin is now mostly a narrow-risk tool, not a generic prevention default.
- Personalization: The bleeding downside transports better to you than the net-prevention upside, because you are young and low-risk rather than high-ASCVD.
- Sources: https://pubmed.ncbi.nlm.nih.gov/30221597/

### GLP-1 RA (semaglutide)

- Estimate: -0.0444 QALY (-16.2 days), sanity range [-0.120, 0.010]
- Reference-case status: fallback_utility_lineage
- Utility-lineage gaps: general_qol_uses_fallback_disability_weights, direct_harm_uses_fallback_disability_weights
- Why: Semaglutide is modeled as chronic obesity/metabolic therapy, not a generic longevity peptide: STEP weight loss and HRQoL effects feed a function/QOL overlay, SELECT informs only a transported hard-outcome proxy, and GI plus biliary/pancreatic harms still apply.
- Personalization: GLP-1 model now keys off BMI category, glycemia, hypertension, age, and lipid/metabolic signal. No obesity, diabetes, hypertension, or strong cardiometabolic signal is present, so benefits are zeroed except for a small off-label lean-mass/appetite downside.
- Sources: https://pubmed.ncbi.nlm.nih.gov/37952131/, https://pubmed.ncbi.nlm.nih.gov/33567185/, https://pubmed.ncbi.nlm.nih.gov/35441470/, https://www.ncbi.nlm.nih.gov/books/NBK601688/

