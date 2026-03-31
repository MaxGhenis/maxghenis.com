# Protocol Ground-Up Estimates

Fresh, personalized ground-up estimates using the live protocol inventory from `protocol-data.json` and personalization from `health.db`, rather than the existing protocol-page QALY outputs.

## Baseline

- Generated: 2026-03-28
- 90-day combined sleep: 6.5 h/night (Whoop 6.47 h, Eight Sleep 6.52 h)
- 90-day Whoop recovery: 58.3; Eight Sleep score: 80.0
- Modeled annual sleep-burden drag: 0.0123 QALY/year from direct sleep-related utility loss
- Sleep burden components: duration 0.0020, quality 0.0009, regularity 0.0016, daytime 0.0016, breathing 0.0063
- Latest labs (2026-03-04): LDL 64.0, HDL 73.0, TG 137.0, HbA1c 5.1, Vitamin D 51.5, eGFR 76.0, creatinine 1.24

## Ranking

| Item | Total QALY | Range | Check | Days | Mortality QALY | Direct Harm | QOL QALY |
| --- | ---: | ---: | --- | ---: | ---: | ---: | ---: |
| Tadalafil 2.5mg | 0.0816 | [0.020, 0.090] | inside | 29.8 | 0.0350 | -0.0014 | 0.0480 |
| APAP nightly | 0.0661 | [0.000, 0.150] | inside | 24.1 | 0.0385 | 0.0000 | 0.0275 |
| Magnesium 200mg | 0.0511 | [0.010, 0.050] | outside | 18.7 | 0.0251 | 0.0000 | 0.0260 |
| Custom oral appliance | 0.0496 | [0.000, 0.100] | inside | 18.1 | 0.0287 | 0.0000 | 0.0209 |
| Melatonin 300mcg | 0.0345 | [0.000, 0.030] | outside | 12.6 | 0.0235 | -0.0046 | 0.0155 |
| Garlic 1200mg | 0.0314 | [0.000, 0.030] | outside | 11.5 | 0.0254 | 0.0000 | 0.0060 |
| Cocoa flavanols ~500mg | 0.0274 | [0.000, 0.030] | inside | 10.0 | 0.0199 | 0.0000 | 0.0075 |
| Nasacort nightly | 0.0253 | [0.000, 0.060] | inside | 9.2 | 0.0146 | 0.0000 | 0.0107 |
| HIIT 2x/week | 0.0232 | [0.000, 0.060] | inside | 8.5 | 0.0000 | 0.0000 | 0.0232 |
| Head elevation nightly | 0.0224 | [0.000, 0.040] | inside | 8.2 | 0.0136 | 0.0000 | 0.0088 |
| Trazodone 50mg | 0.0188 | [-0.010, 0.060] | inside | 6.9 | 0.0291 | -0.0453 | 0.0350 |
| Glycine 2g bedtime | 0.0179 | [0.000, 0.030] | inside | 6.6 | 0.0080 | 0.0000 | 0.0100 |
| Daridorexant 25mg | 0.0178 | [-0.005, 0.050] | inside | 6.5 | 0.0159 | -0.0084 | 0.0102 |
| Lemborexant 5mg | 0.0177 | [-0.005, 0.055] | inside | 6.5 | 0.0172 | -0.0106 | 0.0111 |
| Tempo run 1x/week | 0.0175 | [0.000, 0.045] | inside | 6.4 | 0.0000 | 0.0000 | 0.0175 |
| Nasal strips nightly | 0.0169 | [0.000, 0.030] | inside | 6.2 | 0.0099 | 0.0000 | 0.0070 |
| Ashwagandha 600mg | 0.0148 | [-0.005, 0.040] | inside | 5.4 | 0.0066 | -0.0029 | 0.0111 |
| HIIT 1x/week | 0.0144 | [0.000, 0.040] | inside | 5.3 | 0.0000 | 0.0000 | 0.0144 |
| HIIT 3x/week | 0.0125 | [-0.005, 0.050] | inside | 4.6 | 0.0000 | 0.0000 | 0.0125 |
| Traditional dry sauna 4x/week | 0.0120 | [0.000, 0.030] | inside | 4.4 | 0.0000 | 0.0000 | 0.0120 |
| Cistanche 200mg | 0.0112 | [0.000, 0.020] | inside | 4.1 | 0.0000 | 0.0000 | 0.0112 |
| Creatine 5g | 0.0105 | [0.000, 0.030] | inside | 3.8 | 0.0000 | 0.0000 | 0.0105 |
| Statin (rosuvastatin 5mg) | 0.0100 | [-0.010, 0.050] | inside | 3.7 | 0.0120 | 0.0000 | -0.0020 |
| Zone 2 cardio 2x/week | 0.0093 | [0.000, 0.025] | inside | 3.4 | 0.0000 | 0.0000 | 0.0093 |
| Lions Mane 1g | 0.0090 | [0.000, 0.015] | inside | 3.3 | 0.0000 | 0.0000 | 0.0090 |
| Prebiotics combo | 0.0080 | [0.000, 0.020] | inside | 2.9 | 0.0000 | 0.0000 | 0.0080 |
| NAC 1200mg | 0.0077 | [0.000, 0.015] | inside | 2.8 | 0.0020 | 0.0000 | 0.0057 |
| Apigenin 50mg | 0.0071 | [0.000, 0.020] | inside | 2.6 | 0.0000 | 0.0000 | 0.0071 |
| Suvorexant 10mg | 0.0069 | [-0.008, 0.045] | inside | 2.5 | 0.0146 | -0.0170 | 0.0093 |
| Omega-3 CLO ~500mg | 0.0055 | [0.000, 0.015] | inside | 2.0 | 0.0010 | 0.0000 | 0.0045 |
| Doxepin 3mg | 0.0053 | [-0.005, 0.040] | inside | 1.9 | 0.0106 | -0.0133 | 0.0080 |
| Humidifier nightly | 0.0049 | [0.000, 0.010] | inside | 1.8 | 0.0026 | 0.0000 | 0.0022 |
| NR 300mg | 0.0040 | [0.000, 0.015] | inside | 1.5 | 0.0000 | 0.0000 | 0.0040 |
| NR 300mg (unbundled) | 0.0040 | [0.000, 0.015] | inside | 1.5 | 0.0000 | 0.0000 | 0.0040 |
| Strength maintenance | 0.0036 | [0.000, 0.010] | inside | 1.3 | 0.0000 | 0.0000 | 0.0036 |
| Urolithin A 500mg | 0.0036 | [0.000, 0.015] | inside | 1.3 | 0.0000 | 0.0000 | 0.0036 |
| Infrared sauna 4x/week | 0.0035 | [0.000, 0.015] | inside | 1.3 | 0.0000 | 0.0000 | 0.0035 |
| Low-dose lithium 5mg | 0.0030 | [-0.005, 0.015] | inside | 1.1 | 0.0000 | 0.0000 | 0.0030 |
| Quercetin 500mg | 0.0030 | [0.000, 0.012] | inside | 1.1 | 0.0000 | 0.0000 | 0.0030 |
| Collagen 22g | 0.0024 | [0.000, 0.010] | inside | 0.9 | 0.0000 | 0.0000 | 0.0024 |
| Curcumin 250mg | 0.0022 | [0.000, 0.012] | inside | 0.8 | 0.0000 | -0.0014 | 0.0036 |
| High-EPA Omega-3 +2g | 0.0022 | [0.000, 0.020] | inside | 0.8 | -0.0023 | 0.0000 | 0.0045 |
| Ubiquinol 50mg | 0.0020 | [0.000, 0.010] | inside | 0.7 | 0.0000 | 0.0000 | 0.0020 |
| Ubiquinol 50mg (unbundled) | 0.0020 | [0.000, 0.010] | inside | 0.7 | 0.0000 | 0.0000 | 0.0020 |
| Black seed oil 1g | 0.0020 | [0.000, 0.010] | inside | 0.7 | 0.0000 | 0.0000 | 0.0020 |
| GHK-Cu peptide (topical) | 0.0020 | [0.000, 0.010] | inside | 0.7 | 0.0000 | 0.0000 | 0.0020 |
| Zinc carnosine 75mg | 0.0020 | [0.000, 0.006] | inside | 0.7 | 0.0000 | 0.0000 | 0.0020 |
| Hyaluronic acid (oral) | 0.0018 | [0.000, 0.010] | inside | 0.7 | 0.0000 | 0.0000 | 0.0018 |
| Vitamin K2 MK-7+MK-4 | 0.0016 | [0.000, 0.008] | inside | 0.6 | 0.0000 | 0.0000 | 0.0016 |
| Lutein+Zeaxanthin | 0.0016 | [0.000, 0.008] | inside | 0.6 | 0.0000 | 0.0000 | 0.0016 |
| Ginger 400mg | 0.0015 | [0.000, 0.010] | inside | 0.6 | 0.0000 | 0.0000 | 0.0015 |
| Boron 3mg | 0.0015 | [0.000, 0.005] | inside | 0.5 | 0.0000 | 0.0000 | 0.0015 |
| Broccoli Seed Ext 200mg | 0.0013 | [0.000, 0.008] | inside | 0.5 | 0.0000 | 0.0000 | 0.0013 |
| Lithium 1mg orotate | 0.0010 | [0.000, 0.005] | inside | 0.4 | 0.0000 | 0.0000 | 0.0010 |
| Taurine 500mg top-up | 0.0010 | [0.000, 0.010] | inside | 0.4 | 0.0000 | 0.0000 | 0.0010 |
| Ergothioneine 5mg | 0.0010 | [0.000, 0.008] | inside | 0.4 | 0.0000 | 0.0000 | 0.0010 |
| Sulforaphane 20mg (extra) | 0.0010 | [0.000, 0.010] | inside | 0.4 | 0.0000 | 0.0000 | 0.0010 |
| Alpha-lipoic acid 300mg | 0.0010 | [0.000, 0.008] | inside | 0.4 | 0.0000 | 0.0000 | 0.0010 |
| PQQ 20mg | 0.0010 | [0.000, 0.008] | inside | 0.4 | 0.0000 | 0.0000 | 0.0010 |
| NMN 500mg | 0.0010 | [0.000, 0.008] | inside | 0.4 | 0.0000 | 0.0000 | 0.0010 |
| Lycopene 15mg | 0.0008 | [0.000, 0.005] | inside | 0.3 | 0.0000 | 0.0000 | 0.0008 |
| Astaxanthin 12mg | 0.0005 | [0.000, 0.005] | inside | 0.2 | 0.0000 | 0.0000 | 0.0005 |
| Spermidine 10mg | 0.0005 | [0.000, 0.005] | inside | 0.2 | 0.0000 | 0.0000 | 0.0005 |
| Luteolin 100mg | 0.0005 | [0.000, 0.005] | inside | 0.2 | 0.0000 | 0.0000 | 0.0005 |
| Luteolin 100mg (unbundled) | 0.0005 | [0.000, 0.005] | inside | 0.2 | 0.0000 | 0.0000 | 0.0005 |
| TMG/Betaine 1g | 0.0005 | [0.000, 0.005] | inside | 0.2 | 0.0000 | 0.0000 | 0.0005 |
| 17α-estradiol (topical) | 0.0000 | [-0.010, 0.020] | inside | 0.0 | 0.0000 | 0.0000 | 0.0000 |
| Fisetin 100mg | 0.0000 | [-0.002, 0.005] | inside | 0.0 | 0.0000 | 0.0000 | 0.0000 |
| Fisetin 100mg (unbundled) | 0.0000 | [-0.010, 0.020] | inside | 0.0 | 0.0000 | 0.0000 | 0.0000 |
| Pterostilbene 50mg | 0.0000 | [-0.002, 0.008] | inside | 0.0 | 0.0000 | 0.0000 | 0.0000 |
| Vitamin C 500mg (extra) | 0.0000 | [-0.002, 0.005] | inside | 0.0 | 0.0000 | 0.0000 | 0.0000 |
| Rapamycin 5mg/wk | -0.0010 | [-0.010, 0.030] | inside | -0.4 | 0.0000 | 0.0000 | -0.0010 |
| HBOT 60-session course | -0.0011 | [-0.010, 0.010] | inside | -0.4 | 0.0000 | -0.0021 | 0.0010 |
| EGCG 400mg (green tea) | -0.0029 | [-0.010, 0.010] | inside | -1.1 | 0.0000 | -0.0029 | 0.0000 |
| Acarbose 50mg | -0.0050 | [-0.020, 0.010] | inside | -1.8 | 0.0000 | 0.0000 | -0.0050 |
| BPC-157 cycle | -0.0151 | [-0.010, 0.005] | outside | -5.5 | 0.0000 | -0.0151 | 0.0000 |
| TB-500 cycle | -0.0170 | [-0.010, 0.004] | outside | -6.2 | 0.0000 | -0.0170 | 0.0000 |
| Berberine 500mg | -0.0182 | [-0.020, 0.010] | inside | -6.6 | -0.0132 | 0.0000 | -0.0050 |
| Metformin 500mg | -0.0183 | [-0.005, 0.020] | outside | -6.7 | -0.0183 | 0.0000 | 0.0000 |
| Finasteride 1.25mg | -0.0207 | [-0.010, 0.060] | outside | -7.6 | 0.0000 | -0.0567 | 0.0360 |
| SGLT2i (empagliflozin) | -0.0218 | [-0.010, 0.020] | outside | -8.0 | -0.0198 | 0.0000 | -0.0020 |
| Low-dose aspirin 81mg | -0.0248 | [-0.020, 0.010] | outside | -9.0 | -0.0155 | -0.0069 | -0.0024 |
| Vitamin D 2000 IU | -0.0280 | [-0.020, 0.005] | outside | -10.2 | -0.0282 | 0.0000 | 0.0002 |
| GLP-1 RA (semaglutide) | -0.1584 | [-0.030, 0.010] | outside | -57.9 | 0.0000 | -0.1544 | -0.0040 |

## Notes By Item

### Tadalafil 2.5mg

- Estimate: 0.0816 QALY (29.8 days), sanity range [0.020, 0.090]
- Why: Tadalafil probably matters more through sexual-function / wellbeing utility than through proven life-extension at your baseline risk.
- Personalization: Kept meaningful on QOL because current use reveals real private value, but the mortality side is heavily shrunk because PDE5 survival data are mostly observational in older, higher-risk men.
- Sources: https://pubmed.ncbi.nlm.nih.gov/38777751/, https://pubmed.ncbi.nlm.nih.gov/34775577/

### APAP nightly

- Estimate: 0.0661 QALY (24.1 days), sanity range [0.000, 0.150]
- Why: With confirmed OSA, PAP is the most evidence-backed next sleep intervention by a wide margin.
- Personalization: Your March 25, 2026 home study showed mild OSA (REI 7.7/hr), and the updated airway probability is 0.695, so PAP now gets credit from an actual diagnosis rather than only wearable inference.
- Sources: https://pubmed.ncbi.nlm.nih.gov/31806413/, https://aasm.org/wp-content/uploads/2019/11/Treatment-OSA-with-PAP-Patient-Guide.pdf, https://pubmed.ncbi.nlm.nih.gov/30736887/

### Magnesium 200mg

- Estimate: 0.0511 QALY (18.7 days), sanity range [0.010, 0.050]
- Why: At your baseline, magnesium looks more like a sleep-support and small BP intervention than a major longevity lever.
- Personalization: Upweighted because your 90-day combined sleep is only 6.5 h/night; small BP benefit remains because magnesium RCTs are stronger than most supplements.
- Sources: https://pubmed.ncbi.nlm.nih.gov/33865376/, https://pubmed.ncbi.nlm.nih.gov/41000008/, https://pubmed.ncbi.nlm.nih.gov/27402922/

### Custom oral appliance

- Estimate: 0.0496 QALY (18.1 days), sanity range [0.000, 0.100]
- Why: Custom oral appliance should usually underperform PAP on efficacy but can still be a credible option in mild OSA, especially if you prefer non-PAP treatment.
- Personalization: Your home study is already in the nonsevere range (REI 7.7/hr), so a custom oral appliance is now a concrete non-PAP option rather than a speculative backup.
- Sources: https://aasm.org/aasm-and-aadsm-issue-new-joint-clinical-practice-guideline-for-oral-appliance-therapy/, https://pubmed.ncbi.nlm.nih.gov/26094920/, https://pubmed.ncbi.nlm.nih.gov/32665778/

### Melatonin 300mcg

- Estimate: 0.0345 QALY (12.6 days), sanity range [0.000, 0.030]
- Why: Small, probably real sleep-onset benefit; unlikely to be a big standalone QALY driver.
- Personalization: Upweighted because short sleep is a live issue, but kept modest because human meta-analytic effects are measured in minutes, not hours.
- Sources: https://pubmed.ncbi.nlm.nih.gov/15649737/, https://pubmed.ncbi.nlm.nih.gov/22208861/

### Garlic 1200mg

- Estimate: 0.0314 QALY (11.5 days), sanity range [0.000, 0.030]
- Why: Garlic is a plausible small cardiometabolic adjunct, not a major longevity mover for you.
- Personalization: Downweighted because garlic's BP signal is clearest in hypertensive adults and you are not documented hypertensive.
- Sources: https://pubmed.ncbi.nlm.nih.gov/40735665/, https://pubmed.ncbi.nlm.nih.gov/26764326/

### Cocoa flavanols ~500mg

- Estimate: 0.0274 QALY (10.0 days), sanity range [0.000, 0.030]
- Why: Some plausible cardiometabolic value, but your current risk profile leaves less headroom.
- Personalization: Downweighted because LDL and glycemia are already good and COSMOS enrolled much older adults.
- Sources: https://pubmed.ncbi.nlm.nih.gov/35294962/

### Nasacort nightly

- Estimate: 0.0253 QALY (9.2 days), sanity range [0.000, 0.060]
- Why: Nasacort looks like a phenotype-specific sleep intervention here: worthwhile if nasal inflammation or congestion is meaningfully contributing, not a generic prevention supplement.
- Personalization: Upweighted because your recent airway-directed trial improved breathing, latency, snoring, and sleep quality, producing an airway-response signal of 0.271.
- Sources: https://pubmed.ncbi.nlm.nih.gov/9042068/, https://pubmed.ncbi.nlm.nih.gov/15124166/

### HIIT 2x/week

- Estimate: 0.0232 QALY (8.5 days), sanity range [0.000, 0.060]
- Why: Two HIIT sessions per week is still plausible as a small positive, but only if it replaces easier cardio rather than stacking on top of everything.
- Personalization: Two weekly interval sessions can add a bit more CRF upside, but the marginal return is still capped because you already train daily and your Whoop fitness proxies are strong.
- Sources: https://pubmed.ncbi.nlm.nih.gov/26243014/, https://pubmed.ncbi.nlm.nih.gov/38599681/, https://pubmed.ncbi.nlm.nih.gov/40976973/

### Head elevation nightly

- Estimate: 0.0224 QALY (8.2 days), sanity range [0.000, 0.040]
- Why: Head elevation is a low-risk positional airway aid with the best case in upper-airway-predominant sleep-disordered breathing.
- Personalization: Upweighted because your recent improvement pattern is compatible with an upper-airway contributor, but kept modest because your home data do not cleanly isolate elevation from the other airway changes.
- Sources: https://pubmed.ncbi.nlm.nih.gov/39347559/

### Trazodone 50mg

- Estimate: 0.0188 QALY (6.9 days), sanity range [-0.010, 0.060]
- Why: Trazodone looks like a symptomatic sleep/QOL tool here, not a credible mortality intervention.
- Personalization: Upweighted because sleep is still clearly below target, but netted against hangover / dependency / long-run medication burden rather than assuming all sleep-med utility is durable.
- Sources: https://pubmed.ncbi.nlm.nih.gov/36216367/, https://pubmed.ncbi.nlm.nih.gov/22208861/, https://pubmed.ncbi.nlm.nih.gov/41209816/

### Glycine 2g bedtime

- Estimate: 0.0179 QALY (6.6 days), sanity range [0.000, 0.030]
- Why: Glycine looks like a plausible sleep/QOL helper rather than a major mortality intervention.
- Personalization: Upweighted because sleep remains an active problem, but the evidence is still mainly symptom-level and measured in modest changes.
- Sources: https://pubmed.ncbi.nlm.nih.gov/22529837/

### Daridorexant 25mg

- Estimate: 0.0178 QALY (6.5 days), sanity range [-0.005, 0.050]
- Why: Daridorexant looks like a more evidence-aligned insomnia alternative than trazodone in mild OSA, especially if you want less generic sedation.
- Personalization: Modeled as the cleanest trazodone replacement candidate because it targets maintenance insomnia and has direct mild-to-moderate OSA respiratory-safety evidence, but its cost is brutal.
- Sources: https://pubmed.ncbi.nlm.nih.gov/35065036/, https://pubmed.ncbi.nlm.nih.gov/33305817/, https://pubmed.ncbi.nlm.nih.gov/39543812/

### Lemborexant 5mg

- Estimate: 0.0177 QALY (6.5 days), sanity range [-0.005, 0.055]
- Why: Lemborexant looks like a credible evidence-based trazodone alternative in mild OSA, with stronger sleep-maintenance efficacy than doxepin and less respiratory discomfort than suvorexant.
- Personalization: Modeled as a strong maintenance-insomnia candidate with actual OSA respiratory-safety data, but probably a bit more next-day drag than daridorexant and likely not covered on your plan.
- Sources: https://pubmed.ncbi.nlm.nih.gov/32585700/, https://pubmed.ncbi.nlm.nih.gov/32187781/, https://pubmed.ncbi.nlm.nih.gov/37677076/, https://pubmed.ncbi.nlm.nih.gov/40848323/

### Tempo run 1x/week

- Estimate: 0.0175 QALY (6.4 days), sanity range [0.000, 0.045]
- Why: A weekly tempo run is a credible middle-ground training intervention with modest expected upside.
- Personalization: I place tempo work between zone 2 and HIIT: probably more additive than easy running, but not as distinct a VO2max stimulus as true intervals.
- Sources: https://pubmed.ncbi.nlm.nih.gov/26243014/, https://pubmed.ncbi.nlm.nih.gov/38599681/

### Nasal strips nightly

- Estimate: 0.0169 QALY (6.2 days), sanity range [0.000, 0.030]
- Why: Nasal strips can help if upper-airway narrowing is part of the problem, but they are usually an adjunct rather than a decisive treatment.
- Personalization: Upweighted because your own notes say the first night with strips plus Nasacort gave zero snoring, but kept smaller than Nasacort because the evidence is mostly subjective-sleep benefit.
- Sources: https://pubmed.ncbi.nlm.nih.gov/30154874/

### Ashwagandha 600mg

- Estimate: 0.0148 QALY (5.4 days), sanity range [-0.005, 0.040]
- Why: Ashwagandha is best modeled as a stress/sleep/QOL intervention with non-zero rare downside.
- Personalization: This is one of the few candidates I’d keep meaningfully positive because your sleep/stress profile leaves room for symptomatic benefit.
- Sources: no robust, directly on-point human outcome source found in this pass

### HIIT 1x/week

- Estimate: 0.0144 QALY (5.3 days), sanity range [0.000, 0.040]
- Why: One weekly HIIT session looks like a plausible way to improve VO2max/cardiorespiratory fitness a bit without assuming sedentary-person returns.
- Personalization: Your 180-day Whoop pattern shows avg strain 12.12 with 26.5% of days at >=14 strain, so I model one structured interval session as a modest CRF upgrade rather than a big new training load.
- Sources: https://pubmed.ncbi.nlm.nih.gov/26243014/, https://pubmed.ncbi.nlm.nih.gov/38599681/

### HIIT 3x/week

- Estimate: 0.0125 QALY (4.6 days), sanity range [-0.005, 0.050]
- Why: Three HIIT sessions per week could be fine for some people, but for you I model it as roughly flat to slightly worse than 2x/week unless the extra stimulus clearly outperforms the recovery cost.
- Personalization: I allow a third interval session only as a near-flat extension of 2x/week, because your training load is already high and a 2025 frequency study found no clear extra benefit from 3x over 2x in recreational runners.
- Sources: https://pubmed.ncbi.nlm.nih.gov/26243014/, https://pubmed.ncbi.nlm.nih.gov/38599681/, https://pubmed.ncbi.nlm.nih.gov/40976973/

### Traditional dry sauna 4x/week

- Estimate: 0.0120 QALY (4.4 days), sanity range [0.000, 0.030]
- Why: Traditional dry sauna is the most plausible of the classic biohacker add-ons, but the credible benefit for you still looks modest.
- Personalization: You already exercise daily and your cardiometabolic baseline is good, so I treat sauna as a modest relaxation/recovery and BP-surrogate intervention rather than as a real direct-longevity claim.
- Sources: https://pubmed.ncbi.nlm.nih.gov/25705824/, https://pmc.ncbi.nlm.nih.gov/articles/PMC9394774/

### Cistanche 200mg

- Estimate: 0.0112 QALY (4.1 days), sanity range [0.000, 0.020]
- Why: Cistanche is a plausible functional-performance bet with weak hard-outcome evidence.
- Personalization: Small positive through possible exercise/recovery utility, not because I trust a direct longevity story.
- Sources: no robust, directly on-point human outcome source found in this pass

### Creatine 5g

- Estimate: 0.0105 QALY (3.8 days), sanity range [0.000, 0.030]
- Why: Creatine has decent functional evidence, but most of the compelling data are performance / body-composition and older-adult contexts rather than mortality.
- Personalization: Kept positive for muscle/performance resilience, but trimmed because you are 39 rather than sarcopenic and because creatinine/eGFR make me avoid giving it a free pass.
- Sources: https://pubmed.ncbi.nlm.nih.gov/39074168/, https://pubmed.ncbi.nlm.nih.gov/24576864/

### Statin (rosuvastatin 5mg)

- Estimate: 0.0100 QALY (3.7 days), sanity range [-0.010, 0.050]
- Why: Statins are one of the more credible preventive drug classes, but the marginal benefit for a lean 39-year-old with already-good lipids is much smaller than headline meta-analytic averages.
- Personalization: Strong causal class, but you already have LDL 64 and no documented ASCVD, so most trial effects shrink hard on transport.
- Sources: https://pubmed.ncbi.nlm.nih.gov/22607822/

### Zone 2 cardio 2x/week

- Estimate: 0.0093 QALY (3.4 days), sanity range [0.000, 0.025]
- Why: Structured zone-2 work is still plausible as a small positive, but less likely than HIIT to create a meaningful new stimulus in your current routine.
- Personalization: Because you already run and train daily, I only give a small positive for making some cardio more intentionally aerobic and structured.
- Sources: https://pubmed.ncbi.nlm.nih.gov/38599681/

### Lions Mane 1g

- Estimate: 0.0090 QALY (3.3 days), sanity range [0.000, 0.015]
- Why: Lion’s Mane is plausible as a small cognitive/QOL bet, not a large life-extension lever.
- Personalization: Small only: human evidence is mainly cognition/mood signal, not durable prevention.
- Sources: no robust, directly on-point human outcome source found in this pass

### Prebiotics combo

- Estimate: 0.0080 QALY (2.9 days), sanity range [0.000, 0.020]
- Why: Prebiotics may help GI comfort or satiety, but human hard-endpoint evidence is weak.
- Personalization: Modeled as a gut-symptom / bowel-habit item rather than a mortality lever.
- Sources: https://pubmed.ncbi.nlm.nih.gov/24230488/, https://pubmed.ncbi.nlm.nih.gov/41233756/

### NAC 1200mg

- Estimate: 0.0077 QALY (2.8 days), sanity range [0.000, 0.015]
- Why: NAC remains speculative for broad prevention. Its respiratory upside is much more credible in chronic bronchitis or mucus-heavy phenotypes than in nasal-obstruction sleep problems.
- Personalization: Trimmed because your sleep pattern and recent response point more to an upper-airway/nasal issue than a mucus-heavy phenotype. NAC keeps some value for fatigue or secretions, but much less than airway-targeted measures.
- Sources: https://pubmed.ncbi.nlm.nih.gov/38555190/, https://pubmed.ncbi.nlm.nih.gov/28122105/

### Apigenin 50mg

- Estimate: 0.0071 QALY (2.6 days), sanity range [0.000, 0.020]
- Why: Apigenin is a reasonable sleep-stack experiment, but not a proven life-extension tool.
- Personalization: Kept positive only through plausible calming/sleep utility, not through a strong causal longevity claim.
- Sources: no robust, directly on-point human outcome source found in this pass

### Suvorexant 10mg

- Estimate: 0.0069 QALY (2.5 days), sanity range [-0.008, 0.045]
- Why: Suvorexant is still a plausible maintenance-insomnia option, but the respiratory-safety story in OSA is less clean, so it ranks below the other DORAs for you.
- Personalization: Modeled as meaningfully better than trazodone on mechanism, but with more OSA-specific respiratory caution and next-day somnolence risk than daridorexant or lemborexant.
- Sources: https://pubmed.ncbi.nlm.nih.gov/27397664/, https://pubmed.ncbi.nlm.nih.gov/26194728/, https://pubmed.ncbi.nlm.nih.gov/39543812/, https://www.drugs.com/pro/belsomra.html

### Omega-3 CLO ~500mg

- Estimate: 0.0055 QALY (2.0 days), sanity range [0.000, 0.015]
- Why: The marginal benefit of low-dose cod liver oil looks small at your baseline risk.
- Personalization: Strongly downweighted because this is a low dose and your LDL/HbA1c are already favorable.
- Sources: https://pubmed.ncbi.nlm.nih.gov/32722395/, https://pubmed.ncbi.nlm.nih.gov/24638908/

### Doxepin 3mg

- Estimate: 0.0053 QALY (1.9 days), sanity range [-0.005, 0.040]
- Why: Low-dose doxepin has better insomnia-guideline support than trazodone for sleep maintenance, but it remains a symptom treatment rather than an airway fix.
- Personalization: Modeled as a better-targeted sleep-maintenance bridge than trazodone, but still with some hangover and respiratory caution rather than assuming it is free upside.
- Sources: https://aasm.org/resources/pdf/pharmacologictreatmentofinsomnia.pdf, https://www.accessdata.fda.gov/drugsatfda_docs/label/2010/022036lbl.pdf

### Humidifier nightly

- Estimate: 0.0049 QALY (1.8 days), sanity range [0.000, 0.010]
- Why: A bedroom humidifier is modeled as a modest nasal-comfort adjunct, not a real OSA treatment. It is most attractive when the room is actually dry or you wake with dry irritated nasal passages.
- Personalization: Kept small because your current evidence points more to upper-airway obstruction and nasal inflammation than to dry-air irritation alone; nasal-inflammation probability is 0.469.
- Sources: https://www.aaaai.org/tools-for-the-public/conditions-library/allergies/humidifiers-and-indoor-allergies, https://www.epa.gov/mold/mold-course-chapter-2, https://pubmed.ncbi.nlm.nih.gov/3348500/

### NR 300mg

- Estimate: 0.0040 QALY (1.5 days), sanity range [0.000, 0.015]
- Why: NR is still mostly a mechanistic bet, with a small possible symptom pathway for fatigue / recovery.
- Personalization: I kept a small positive here only because there is at least one recent long-COVID RCT signal, but in healthier adults the literature is mostly NAD+ biomarker movement without obvious clinical payoff.
- Sources: https://pubmed.ncbi.nlm.nih.gov/41357333/, https://pubmed.ncbi.nlm.nih.gov/29184669/, https://pubmed.ncbi.nlm.nih.gov/32320006/

### NR 300mg (unbundled)

- Estimate: 0.0040 QALY (1.5 days), sanity range [0.000, 0.015]
- Why: Standalone NR should inherit the same tiny clinical estimate as bundled NR, with cost deciding the verdict.
- Personalization: Same biology as bundled NR; the question here is whether it is worth buying as a standalone product.
- Sources: https://pubmed.ncbi.nlm.nih.gov/41357333/, https://pubmed.ncbi.nlm.nih.gov/29184669/, https://pubmed.ncbi.nlm.nih.gov/32320006/, https://www.truniagen.com/products/tru-niagen-300mg

### Strength maintenance

- Estimate: 0.0036 QALY (1.3 days), sanity range [0.000, 0.010]
- Why: Strength is important in general, but your marginal gain from formalizing it further appears small.
- Personalization: Near flat because your described routine already contains daily strength work, so a separate strength-maintenance intervention adds little.
- Sources: https://pubmed.ncbi.nlm.nih.gov/38599681/

### Urolithin A 500mg

- Estimate: 0.0036 QALY (1.3 days), sanity range [0.000, 0.015]
- Why: Urolithin A is plausible but still early and expensive.
- Personalization: I kept a small functional upside for exercise recovery / mitochondria, but not enough to justify a major QALY number.
- Sources: no robust, directly on-point human outcome source found in this pass

### Infrared sauna 4x/week

- Estimate: 0.0035 QALY (1.3 days), sanity range [0.000, 0.015]
- Why: Infrared sauna may help relaxation or recovery a bit, but the evidence is materially weaker than for Finnish-style dry sauna.
- Personalization: I treat infrared sauna as a weaker recovery/relaxation analog to traditional dry sauna rather than as an equivalent longevity intervention.
- Sources: https://pubmed.ncbi.nlm.nih.gov/41049507/, https://pmc.ncbi.nlm.nih.gov/articles/PMC9394774/

### Low-dose lithium 5mg

- Estimate: 0.0030 QALY (1.1 days), sanity range [-0.005, 0.015]
- Why: Interesting neuropsychiatric hedge, but still thin as a quantified longevity intervention.
- Personalization: Kept small because the low-dose human outcome case is still mostly ecological and indirect.
- Sources: no robust, directly on-point human outcome source found in this pass

### Quercetin 500mg

- Estimate: 0.0030 QALY (1.1 days), sanity range [0.000, 0.012]
- Why: Quercetin might matter in the right symptom cluster, but not as a broad longevity capsule.
- Personalization: Kept small because the best case is symptom relief in inflammatory/viral-persistence settings, not generic prevention.
- Sources: no robust, directly on-point human outcome source found in this pass

### Collagen 22g

- Estimate: 0.0024 QALY (0.9 days), sanity range [0.000, 0.010]
- Why: Collagen may help joint or skin outcomes in the right phenotype, but your baseline does not scream high-yield collagen responder. A much smaller downstream fall/fracture pathway is included with age gating.
- Personalization: Strongly downweighted because the better human data are in osteoarthritis / meniscopathy, not healthy adults without documented joint disease. Any fall/fracture benefit is modeled as much smaller and grows mainly with age.
- Sources: https://pubmed.ncbi.nlm.nih.gov/39212129/, https://pubmed.ncbi.nlm.nih.gov/38218227/, https://pubmed.ncbi.nlm.nih.gov/37432180/

### Curcumin 250mg

- Estimate: 0.0022 QALY (0.8 days), sanity range [0.000, 0.012]
- Why: Curcumin is better supported as an anti-inflammatory biomarker intervention than a proven longevity intervention.
- Personalization: Kept small because dose is modest and the strongest human data are for biomarker shifts or disease-specific pain populations.
- Sources: https://pubmed.ncbi.nlm.nih.gov/38945354/, https://pubmed.ncbi.nlm.nih.gov/39478418/

### High-EPA Omega-3 +2g

- Estimate: 0.0022 QALY (0.8 days), sanity range [0.000, 0.020]
- Why: Some cardiometabolic plausibility remains, but the incremental value over your existing health profile is modest.
- Personalization: Marginally more plausible than low-dose omega-3 because triglycerides are not perfect, but still sharply trimmed at your baseline risk.
- Sources: no robust, directly on-point human outcome source found in this pass

### Ubiquinol 50mg

- Estimate: 0.0020 QALY (0.7 days), sanity range [0.000, 0.010]
- Why: CoQ10 can be useful in cardiac disease or statin myalgia, but that is not the main story here.
- Personalization: Near zero because the strongest CoQ10 evidence is in heart failure, which is not your phenotype.
- Sources: https://pubmed.ncbi.nlm.nih.gov/39462324/, https://pubmed.ncbi.nlm.nih.gov/35608922/

### Ubiquinol 50mg (unbundled)

- Estimate: 0.0020 QALY (0.7 days), sanity range [0.000, 0.010]
- Why: Standalone ubiquinol should inherit the same weak phenotype-specific estimate as bundled ubiquinol.
- Personalization: Same small CoQ10 estimate as the bundled version; the standalone question is mostly about whether it is worth buying separately.
- Sources: https://pubmed.ncbi.nlm.nih.gov/39462324/, https://pubmed.ncbi.nlm.nih.gov/35608922/, https://www.lifeextension.com/vitamins-supplements/item01425/super-ubiquinol-coq10-with-ppm-pyrroloquinoline-quinone

### Black seed oil 1g

- Estimate: 0.0020 QALY (0.7 days), sanity range [0.000, 0.010]
- Why: Interesting anti-inflammatory profile, weak quantified personal-health case.
- Personalization: Kept near zero because evidence remains mostly biomarker and specialty-population work.
- Sources: no robust, directly on-point human outcome source found in this pass

### GHK-Cu peptide (topical)

- Estimate: 0.0020 QALY (0.7 days), sanity range [0.000, 0.010]
- Why: Topical GHK-Cu may help skin appearance, but not enough to justify a large healthspan estimate.
- Personalization: This is mostly aesthetic/skin utility, which is real but should stay modest in a QALY-only model.
- Sources: no robust, directly on-point human outcome source found in this pass

### Zinc carnosine 75mg

- Estimate: 0.0020 QALY (0.7 days), sanity range [0.000, 0.006]
- Why: Zinc carnosine is a phenotype-specific gut-symptom intervention, not a broad longevity tool.
- Personalization: Useful mainly if you have a real GI barrier/irritation problem; otherwise near zero.
- Sources: no robust, directly on-point human outcome source found in this pass

### Hyaluronic acid (oral)

- Estimate: 0.0018 QALY (0.7 days), sanity range [0.000, 0.010]
- Why: Oral hyaluronic acid may have symptom value, but it looks phenotype-specific. A much smaller downstream fall/fracture pathway is included with age gating.
- Personalization: Downweighted because oral HA benefits are mostly in chronic pain / joint-discomfort populations. Any fall/fracture benefit is modeled as much smaller and grows mainly with age.
- Sources: https://pubmed.ncbi.nlm.nih.gov/25415767/, https://pubmed.ncbi.nlm.nih.gov/41479667/

### Vitamin K2 MK-7+MK-4

- Estimate: 0.0016 QALY (0.6 days), sanity range [0.000, 0.008]
- Why: Vitamin K2 is a weak preventive bet at your age unless there is a clearer bone-risk story.
- Personalization: Kept near zero because the more favorable fracture/BMD data are mostly in older postmenopausal populations.
- Sources: https://pubmed.ncbi.nlm.nih.gov/35625785/, https://pubmed.ncbi.nlm.nih.gov/36033779/

### Lutein+Zeaxanthin

- Estimate: 0.0016 QALY (0.6 days), sanity range [0.000, 0.008]
- Why: Reasonable eye-health hedge, but the extrapolation to you is thin.
- Personalization: Downweighted because AREDS2 is secondary prevention in older adults with existing AMD risk, not primary prevention for a 39-year-old.
- Sources: https://pubmed.ncbi.nlm.nih.gov/39025435/, https://pubmed.ncbi.nlm.nih.gov/24638908/

### Ginger 400mg

- Estimate: 0.0015 QALY (0.6 days), sanity range [0.000, 0.010]
- Why: Ginger looks mildly helpful, but not transformative. A much smaller downstream fall/fracture pathway is included with age gating.
- Personalization: Small positive only because human data support biomarker improvements and some joint-pain benefit, but your baseline does not show an obvious inflammatory pain phenotype. Any fall/fracture benefit is modeled as much smaller and grows mainly with age.
- Sources: https://pubmed.ncbi.nlm.nih.gov/41123858/, https://pubmed.ncbi.nlm.nih.gov/40732990/

### Boron 3mg

- Estimate: 0.0015 QALY (0.5 days), sanity range [0.000, 0.005]
- Why: Boron may matter for micronutrient biology, but not enough to give it a real QALY number beyond noise.
- Personalization: Near zero because I could not justify a clinically meaningful human outcome effect here.
- Sources: no robust, directly on-point human outcome source found in this pass

### Broccoli Seed Ext 200mg

- Estimate: 0.0013 QALY (0.5 days), sanity range [0.000, 0.008]
- Why: Promising biology; still thin as a personalized QALY lever.
- Personalization: Near zero because sulforaphane has mechanistic appeal but little direct hard-endpoint evidence in a healthy adult.
- Sources: no robust, directly on-point human outcome source found in this pass

### Lithium 1mg orotate

- Estimate: 0.0010 QALY (0.4 days), sanity range [0.000, 0.005]
- Why: Interesting hypothesis space, but not enough human intervention data for a large claim.
- Personalization: Kept near zero because microdose lithium/orotate evidence is too thin to support a stronger estimate.
- Sources: no robust, directly on-point human outcome source found in this pass

### Taurine 500mg top-up

- Estimate: 0.0010 QALY (0.4 days), sanity range [0.000, 0.010]
- Why: The marginal increment from 1.5g to 2g should not look large.
- Personalization: Very small because this is only a top-up on top of Longevity Mix, not a full taurine intervention.
- Sources: https://pubmed.ncbi.nlm.nih.gov/34039357/, https://pubmed.ncbi.nlm.nih.gov/39796489/

### Ergothioneine 5mg

- Estimate: 0.0010 QALY (0.4 days), sanity range [0.000, 0.008]
- Why: Interesting biomarker story, weak supplement-level clinical story.
- Personalization: Near zero because most of the case is still observational and nutrient-status based.
- Sources: no robust, directly on-point human outcome source found in this pass

### Sulforaphane 20mg (extra)

- Estimate: 0.0010 QALY (0.4 days), sanity range [0.000, 0.010]
- Why: The extra dose is mostly mechanistic optimism.
- Personalization: Incremental-only because you already get some sulforaphane exposure from food and the bundled broccoli seed extract.
- Sources: no robust, directly on-point human outcome source found in this pass

### Alpha-lipoic acid 300mg

- Estimate: 0.0010 QALY (0.4 days), sanity range [0.000, 0.008]
- Why: Weak general-prevention case.
- Personalization: Near zero because the best-supported use case is diabetic neuropathy, not your phenotype.
- Sources: no robust, directly on-point human outcome source found in this pass

### PQQ 20mg

- Estimate: 0.0010 QALY (0.4 days), sanity range [0.000, 0.008]
- Why: Should be near zero unless future evidence improves materially.
- Personalization: Mostly a mitochondrial-biomarker bet with little direct human utility evidence.
- Sources: no robust, directly on-point human outcome source found in this pass

### NMN 500mg

- Estimate: 0.0010 QALY (0.4 days), sanity range [0.000, 0.008]
- Why: Mechanistic appeal is stronger than demonstrated clinical value.
- Personalization: Near zero because NR/NMN remain mostly NAD-biomarker interventions in humans.
- Sources: no robust, directly on-point human outcome source found in this pass

### Lycopene 15mg

- Estimate: 0.0008 QALY (0.3 days), sanity range [0.000, 0.005]
- Why: Lycopene may be fine, but I do not see a strong supplement-specific QALY signal.
- Personalization: Near zero because the cardiovascular literature is mainly observational and food-pattern confounding is hard to strip away.
- Sources: https://pubmed.ncbi.nlm.nih.gov/28318092/

### Astaxanthin 12mg

- Estimate: 0.0005 QALY (0.2 days), sanity range [0.000, 0.005]
- Why: Interesting antioxidant biomarker story, but weak evidence for durable clinical payoff in someone like you.
- Personalization: Kept near zero because the human literature is mostly biomarker and specialty-population work.
- Sources: https://pubmed.ncbi.nlm.nih.gov/41596351/, https://pubmed.ncbi.nlm.nih.gov/41710469/

### Spermidine 10mg

- Estimate: 0.0005 QALY (0.2 days), sanity range [0.000, 0.005]
- Why: Spermidine is still more of a longevity hypothesis than a demonstrated human benefit.
- Personalization: Near zero because the better human RCT found no memory benefit despite strong preclinical enthusiasm.
- Sources: https://pubmed.ncbi.nlm.nih.gov/35616942/

### Luteolin 100mg

- Estimate: 0.0005 QALY (0.2 days), sanity range [0.000, 0.005]
- Why: Luteolin remains mostly a mechanistic / preclinical longevity ingredient.
- Personalization: Near zero because I could not justify a meaningful clinical effect from current human outcome data.
- Sources: no robust, directly on-point human outcome source found in this pass

### Luteolin 100mg (unbundled)

- Estimate: 0.0005 QALY (0.2 days), sanity range [0.000, 0.005]
- Why: Standalone luteolin should inherit the same mechanistic-only estimate as bundled luteolin.
- Personalization: Same near-zero estimate as bundled luteolin; useful mainly to compare whether buying it separately makes any sense.
- Sources: https://doublewoodsupplements.com/products/luteolin

### TMG/Betaine 1g

- Estimate: 0.0005 QALY (0.2 days), sanity range [0.000, 0.005]
- Why: Hard to justify more than noise-level utility.
- Personalization: Tiny because this is mostly a methylation-support adjunct, not a clinically demonstrated intervention.
- Sources: no robust, directly on-point human outcome source found in this pass

### 17α-estradiol (topical)

- Estimate: 0.0000 QALY (0.0 days), sanity range [-0.010, 0.020]
- Why: No strong basis for a meaningful human QALY claim here yet.
- Personalization: Near zero because this is still mostly mouse lifespan extrapolation.
- Sources: no robust, directly on-point human outcome source found in this pass

### Fisetin 100mg

- Estimate: 0.0000 QALY (0.0 days), sanity range [-0.002, 0.005]
- Why: Strong marketing and interesting biology, but not enough human evidence for a positive ground-up estimate.
- Personalization: Modeled as flat because fisetin is still largely a senolytic hypothesis in humans.
- Sources: no robust, directly on-point human outcome source found in this pass

### Fisetin 100mg (unbundled)

- Estimate: 0.0000 QALY (0.0 days), sanity range [-0.010, 0.020]
- Why: There is still no strong human basis for a meaningful fisetin QALY claim.
- Personalization: Same skeptical estimate as bundled fisetin; standalone purchase is mostly a cost question.
- Sources: https://doublewoodsupplements.com/products/fisetin

### Pterostilbene 50mg

- Estimate: 0.0000 QALY (0.0 days), sanity range [-0.002, 0.008]
- Why: Little reason to assign a meaningful QALY effect.
- Personalization: Near zero because this is still a resveratrol-family hypothesis, not a robust human outcome intervention.
- Sources: no robust, directly on-point human outcome source found in this pass

### Vitamin C 500mg (extra)

- Estimate: 0.0000 QALY (0.0 days), sanity range [-0.002, 0.005]
- Why: No reason to expect much marginal benefit here.
- Personalization: Incremental vitamin C on top of adequate intake should be near flat.
- Sources: no robust, directly on-point human outcome source found in this pass

### Rapamycin 5mg/wk

- Estimate: -0.0010 QALY (-0.4 days), sanity range [-0.010, 0.030]
- Why: Rapamycin remains interesting, but human longevity evidence is too incomplete for a large positive estimate.
- Personalization: I am treating this mainly as an uncertain translational hypothesis, not a currently supported personal-health intervention.
- Sources: https://pubmed.ncbi.nlm.nih.gov/35322235/

### HBOT 60-session course

- Estimate: -0.0011 QALY (-0.4 days), sanity range [-0.010, 0.010]
- Why: Interesting but weakly grounded for a healthy 39-year-old; the evidence does not justify a large QALY estimate.
- Personalization: I am treating HBOT as a high-cost surrogate-biomarker play with uncertain persistence, not as a demonstrated healthy-aging intervention.
- Sources: https://pubmed.ncbi.nlm.nih.gov/35649312/, https://www.fda.gov/medical-devices/letters-health-care-providers/follow-instructions-safe-use-hyperbaric-oxygen-therapy-devices-letter-health-care-providers

### EGCG 400mg (green tea)

- Estimate: -0.0029 QALY (-1.1 days), sanity range [-0.010, 0.010]
- Why: Green-tea epidemiology should not become a large EGCG-capsule claim.
- Personalization: Near zero or slightly negative because liver-risk transport is clearer than mortality benefit transport in a supplement user like you.
- Sources: no robust, directly on-point human outcome source found in this pass

### Acarbose 50mg

- Estimate: -0.0050 QALY (-1.8 days), sanity range [-0.020, 0.010]
- Why: Acarbose is more likely to create hassle than durable value for your current phenotype.
- Personalization: Modeled as mildly negative because GI burden transports better than lifespan-mouse optimism.
- Sources: no robust, directly on-point human outcome source found in this pass

### BPC-157 cycle

- Estimate: -0.0151 QALY (-5.5 days), sanity range [-0.010, 0.005]
- Why: For a healthy user, BPC-157 should be modeled as near-zero or slightly negative until real human efficacy and product-quality evidence improve.
- Personalization: Without a concrete injury or ulcer-healing phenotype, BPC-157 is mostly gray-market uncertainty and injection burden.
- Sources: https://index.mirasmart.com/AAOS2025/PDFfiles/AAOS2025-009087.PDF, https://www.fda.gov/drugs/human-drug-compounding/understanding-risks-compounded-drugs

### TB-500 cycle

- Estimate: -0.0170 QALY (-6.2 days), sanity range [-0.010, 0.004]
- Why: TB-500 looks like a gray-market hypothesis stack component, not a credible general-health intervention.
- Personalization: This is even more speculative than BPC-157 in the absence of a specific recovery use case.
- Sources: https://www.fda.gov/drugs/human-drug-compounding/understanding-risks-compounded-drugs

### Berberine 500mg

- Estimate: -0.0182 QALY (-6.6 days), sanity range [-0.020, 0.010]
- Why: Berberine is not an attractive personal intervention at your baseline.
- Personalization: Your glycemia is already good, so the GI downside matters more than the diabetes-trial upside.
- Sources: no robust, directly on-point human outcome source found in this pass

### Metformin 500mg

- Estimate: -0.0183 QALY (-6.7 days), sanity range [-0.005, 0.020]
- Why: Metformin is plausible as a modest metabolic-risk intervention, but not a big generic longevity lever for your phenotype.
- Personalization: Downweighted heavily because your glycemia is already good and most compelling outcome data are in diabetic or prediabetic populations.
- Sources: https://pubmed.ncbi.nlm.nih.gov/28802803/

### Finasteride 1.25mg

- Estimate: -0.0207 QALY (-7.6 days), sanity range [-0.010, 0.060]
- Why: Hair-loss treatment has meaningful psychosocial value for some men, but very little credible mortality effect.
- Personalization: Modeled almost entirely as QOL: hair preservation seems clearly valued, but I netted that against sexual-side-effect risk rather than assuming pure upside.
- Sources: https://pubmed.ncbi.nlm.nih.gov/21806672/, https://pubmed.ncbi.nlm.nih.gov/37605428/, https://pubmed.ncbi.nlm.nih.gov/28396101/

### SGLT2i (empagliflozin)

- Estimate: -0.0218 QALY (-8.0 days), sanity range [-0.010, 0.020]
- Why: SGLT2 inhibitors are clinically important in the right phenotype, but they should not look like a major longevity drug for you.
- Personalization: Transport is extremely weak here because the flagship benefits are in diabetes, heart failure, and CKD populations rather than a healthy lean 39-year-old.
- Sources: https://pubmed.ncbi.nlm.nih.gov/26378978/

### Low-dose aspirin 81mg

- Estimate: -0.0248 QALY (-9.0 days), sanity range [-0.020, 0.010]
- Why: Low-dose aspirin is now mostly a narrow-risk tool, not a generic prevention default.
- Personalization: The bleeding downside transports better to you than the net-prevention upside, because you are young and low-risk rather than high-ASCVD.
- Sources: https://pubmed.ncbi.nlm.nih.gov/30221597/

### Vitamin D 2000 IU

- Estimate: -0.0280 QALY (-10.2 days), sanity range [-0.020, 0.005]
- Why: Vitamin D looks more like a deficiency correction tool than an additional-optimization tool at your current level.
- Personalization: Almost fully downweighted because your latest 25(OH)D is 51.5 ng/mL, already in a replete range.
- Sources: https://pubmed.ncbi.nlm.nih.gov/37004841/, https://pubmed.ncbi.nlm.nih.gov/28096125/

### GLP-1 RA (semaglutide)

- Estimate: -0.1584 QALY (-57.9 days), sanity range [-0.030, 0.010]
- Why: For you this is closer to a weakly justified, harm-prone off-label bet than a real healthspan intervention.
- Personalization: Your BMI and likely body-fat profile do not resemble the obesity/CVD populations where semaglutide shows the clearest benefit.
- Sources: https://pubmed.ncbi.nlm.nih.gov/38740993/

