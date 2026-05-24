---
title: 'How to turn money into predictions'
description: 'A menu of mechanisms for organizations that want to fund forecasts on policy, economic, and AI outcomes.'
pubDate: 'May 24 2026'
---

Organizations that fund policy research, economic analysis, or AI deployment increasingly want predictions about future outcomes — which tax provisions will pass, what inflation will run, how labor markets will absorb a new model class. Predictions exist as a public good when markets are deep and traders are well-informed. Most prediction markets fall short of that today. Funders can close the gap.

This post lays out the available mechanisms. I drafted an earlier version in November 2024 and circulated it with a small group of researchers and funders. The landscape has changed enough since then — prediction markets crossed $44 billion in notional volume in 2025, Kalshi got Federal Reserve research validation, and a serious proposal for sponsorship-funded markets on AI labor impacts hit the literature — that an updated public version is overdue.

## Two structural problems

Two problems make most prediction markets shallower than they should be.

**The liquidity problem.** Markets need both informed traders ("smart money") and less informed traders willing to absorb their bets ("dumb money"). [Andrew Gelman](https://statmodeling.stat.columbia.edu/2024/11/14/prediction-markets-and-the-need-for-dumb-money-as-well-as-smart-money/) puts it cleanly: "Markets become efficient when making them efficient is profitable." Without enough total volume, smart traders can't profitably correct a mispriced market, so prices stay wrong.

A Manifold market asking "Will there be any tax on unrealized capital gains in the USA before EOY2028?" sat at 22% probability for nearly two weeks after Trump's 2024 election victory, with 27 traders. The election outcome obviously cut the probability substantially, but no one was paid enough to move the price.

A parallel Manifold market on "Will a raise to the top capital gains tax rate be enacted in 2025?" behaved differently. Manifold staff made it sweepstakes-eligible at creation, so the market traded in real money. It held 20-21% until election results, then dropped to 6%. The mana version attracted 18 trades and 4,093 mana; the sweepstakes version had 9 traders and 334 sweepcash. Real money moved the price; play money did not.

**The zero-sum challenge.** Unlike equities, where investors collectively benefit from economic growth, prediction markets are zero-sum or negative-sum after fees. Every winner needs a loser. [Zvi Mowshowitz](https://thezvi.wordpress.com/2017/07/26/subsidizing-prediction-markets/) lists the consequences: no natural long-term investors, higher perceived risk, and limited professional capital deployment. Funders willing to take an expected loss on a market are the substitute for that missing long-horizon capital.

## Where prediction markets are in 2026

Three things changed since I first wrote this doc.

**Volume.** Total notional across major platforms exceeded $44 billion in 2025, with monthly peaks around $13 billion during the US election period. The market is concentrated in Kalshi (US-regulated event contracts under CFTC oversight) and Polymarket (crypto-native, operates globally with limited US access).

**Regulatory legitimacy.** Kalshi went from a startup with questionable contract approvals to the subject of a [Federal Reserve working paper](https://www.federalreserve.gov/econres/feds/files/2026010pap.pdf) (Diercks, Katz, and Wright, 2026) that finds Kalshi's prices on inflation, jobs, GDP, and FOMC decisions "outperform surveys and interest-rate futures" as macro forecasting tools. The paper explicitly recommends Kalshi as a real-time benchmark for researchers and policymakers. That is the most credible institutional validation prediction markets have ever received.

**A sponsorship thesis.** Andrey Fradkin, Brian Jabarian, and Andrew Koh published ["We need well-capitalized prediction markets"](https://empiricrafting.substack.com/p/we-need-well-capitalized-prediction) arguing that the right model is sponsorship — AI labs, Big Tech firms, and philanthropies seed liquidity in markets on labor outcomes, AI capability benchmarks, and other questions where they have decision-relevant interest. Sponsorship covers the expected loss in exchange for better information for everyone. I'll come back to this in the last section.

## Funding mechanism 1: Subsidize public markets

Each major platform supports liquidity provision through a different mechanism.

**Manifold Markets** runs primarily on play money called mana, with select markets enabled for sweepstakes trading in real cash. Organizations can buy mana (71-91 mana per dollar at current rates) and add it as liquidity on specific markets. The subsidy improves market function but the subsidizer expects to lose mana by design — the more the market price moves, the less you recover. Markets with active management, clear resolution criteria, and broad interest are more likely to qualify for sweepstakes, so seeding mana on a market that fits those criteria may help it graduate to real money. Manifold's code is [MIT-licensed](https://github.com/manifoldmarkets/manifold), which makes it the friendliest platform for organizations that want to run experiments programmatically.

**Polymarket** uses a Liquidity Mining and Rewards program. Market makers earn rewards for providing consistent quotes; traders earn fee rebates proportional to trading activity; community bounties incentivize market promotion. Organizations can participate through these mechanisms rather than as standalone subsidizers. The platform's not CFTC-approved for economic indicator contracts, but it operates at meaningful scale globally and has hundreds of macro markets active.

**Kalshi** offers a limit-order liquidity model. Organizations place standing limit orders at prices they're willing to trade at; orders execute when the market crosses those prices. Limit orders avoid trading fees, allow precise price targeting, and accumulate into market liquidity over time. Qualified market makers can join a formal program with additional benefits. The CFTC approval and Fed validation make this the right platform for institutional-grade questions where regulatory clarity matters.

## Funding mechanism 2: Sponsor a tournament

[Metaculus](https://www.metaculus.com) is a forecasting platform aggregating predictions across thousands of binary and numerical questions, scored on accuracy. Organizations sponsor dedicated tournaments — a slate of related questions with a prize pool that pays out to the best forecasters.

The Federation of American Scientists funded a $5,000 [Climate Tipping Points](https://www.metaculus.com/tournament/climate-tipping-points/) tournament covering 43 questions about climate policy and outcomes, including conditional questions. The tournament structure lets a funder set the agenda — what questions matter, what counts as resolution, what horizons to ask about — without taking on market-maker risk.

Tournaments work well for questions where you want a calibrated probability today, not a tradeable instrument over time. They also support reasoning prizes for the best-argued forecasts, not just the most accurate ones, which matters when you're trying to surface analytical talent rather than just numerical answers.

## Funding mechanism 3: Buy custom superforecasts

[Good Judgment](https://goodjudgment.com) sells custom forecasting from professional superforecasters — individuals identified by Philip Tetlock's Good Judgment Project as consistently outperforming domain experts and intelligence analysts. Services include question development, daily forecast updates, written analysis, and follow-up question support. Organizations can keep forecasts private or release them publicly.

This is the most concierge option. You write a question, a small team of trained forecasters works on it, you get back a probability with explanation. No liquidity to manage, no market to monitor. Cost is higher per question and the methodology is opaque relative to a public market.

## The sponsorship thesis, and why it matters

The Fradkin / Jabarian / Koh proposal is worth treating as its own category. They argue that the chicken-and-egg problem in prediction markets — no liquidity, no traders; no traders, no liquidity — can be solved by sponsorship capital from organizations that have real decision-relevant interest in the questions. Their canonical example is AI labor impacts: a major AI lab, a federal agency, or a philanthropy seeds liquidity on markets tied to Bureau of Labor Statistics data series — occupation-level employment, wages, labor-force participation at 1-, 2-, and 5-year horizons.

The contract design they advocate has four properties: verifiability (objective resolution against published government data), stability (consistent measurement over time), robustness to gaming (large underlying quantities that one trader can't move), and attention (sufficient interest to draw informed traders). BLS data hits all four. So do many other government statistics — BEA NIPA tables, Census ACS variables, IRS Statistics of Income.

The model generalizes. Any organization that benefits from better forecasting on a specific question can sponsor a market on it without expecting trading profit. The sponsorship pays for information that improves everyone's decisions — including the sponsor's. Conditional markets (outcome Y given policy state X) are particularly underprovided today and particularly valuable for policy analysis. Sponsorship is the cleanest mechanism to bring them into existence.

The sponsorship lane connects to a structural question: who pays for the public good of calibrated forecasts? In 2024 the answer was mostly "individual hobbyist traders subsidizing inefficient markets." In 2026 the answer is starting to be "institutions with skin in the question, sponsoring markets that produce information they want." That shift is what makes 2026 different from 2024.

## Where to start

Different mechanisms suit different goals:

- **Want to test the waters cheaply?** Buy mana on Manifold and seed a market that matters to you. Total commitment can be under $1,000. You will lose most of it. You will learn what trades and what doesn't.
- **Want a probability anchored to your priorities?** Sponsor a Metaculus tournament. $5,000–$50,000 buys a slate of questions with a real prize pool and visible forecasters.
- **Want a single high-stakes forecast with reasoning?** Engage Good Judgment. Highest cost per question, deepest analysis.
- **Want regulated, real-money markets on macro questions?** Place limit orders on Kalshi. Fee-free, precise pricing, supports the most institutionally credible platform.
- **Want to move the field?** Sponsor markets that solve a real liquidity hole — BLS-anchored contracts, AI capability benchmarks, conditional policy-outcome markets. The Fradkin / Jabarian / Koh model is the right starting point.

The hard part is no longer figuring out the mechanism. The mechanisms exist, the platforms work, the regulatory path is clearer than at any point in the past decade. The remaining question is whether organizations that benefit from better forecasts will fund them. So far, mostly, they haven't. That's the gap.
