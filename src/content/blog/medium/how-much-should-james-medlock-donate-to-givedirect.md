---
title: "How much should james medlock donate to givedirectly?"
description: "### How much should James Medlock donate to GiveDirectly?"
pubDate: '2023-03-23'
---


### How much should James Medlock donate to GiveDirectly?


#### We built a mini-app with the `policyengine-us` Python package to crunch the implications of a Twitter bet.


![](https://cdn-images-1.medium.com/max/800/0*Pm5cpwxSz4uZTjD_)

[Jump to the tool](https://policyengine-james-medlock-donation-solver.streamlit.app/)

One week ago, Twitter user James Medlock tweeted:


> 

The next day, entrepreneur and investor Balaji Srinivasan agreed by quote-tweet:


> 

That is, Srinivasan, the former CTO of Coinbase, is betting that Bitcoin will exceed $1 million US dollars within 90 days.

This bet [appears to be moving forward](https://twitter.com/jdcmedlock/status/1638611778006560768). When discussing how he’d use the potential winnings, Medlock tweeted:


> 

[GiveDirectly](http://givedirectly.org) is a charity that gives unconditional cash transfers to low-income households. Medlock [plans to give an unrestricted grant](https://twitter.com/jdcmedlock/status/1637848723052167168), which GiveDirectly currently directs to Africa.

Should Medlock win his bet, how much should he donate to GiveDirectly to fulfill his pledge? The interaction between charitable donations and tax liability means that answering this question requires a model of the tax code — like PolicyEngine’s.

Using [our ](http://github.com/policyengine/policyengine-us)`policyengine-us`[ Python package](http://github.com/policyengine/policyengine-us) — the same package that powers our web app — and the [Streamlit](http://streamlit.app) dashboarding software, [we built a tool](https://policyengine-james-medlock-donation-solver.streamlit.app/) to calculate how much Medlock should give. The amount to give also depends on other circumstances of Medlock’s finances and household, and our tool includes levers to explore different scenarios.

We find that Medlock should give between $333,000 (if he has at least $4 million in other income) and $565,000 (if he has no other income).


### Who is James Medlock?

James Medlock ([@jdcmedlock](https://twitter.com/jdcmedlock?lang=en)) is a pseudonymous Twitter account known for his social and economic policy content. Relevant information for his taxes include:

- Lives in Oakland, California
- Married
- Doesn’t have children (though he previously cared for a cat, Midnight)
- Self-employed
- 33 years old (his profile picture is a portrait of economic anthropologist Karl Polanyi as an older man)


### Using our calculator

[Our calculator](https://policyengine-james-medlock-donation-solver.streamlit.app/) runs Medlock’s household through the policyengine-us Python package via the Streamlit dashboarding app. We consider the above characteristics, and then let users set employment and self-employment income for Medlock and his wife.

As an example, suppose Medlock earns $100,000 from self-employment, and his wife earns $100,000 from employment. We would enter this as so:


![](https://cdn-images-1.medium.com/max/800/0*GnNvsUqhT-LxtSpt)

[The main PolicyEngine app shows](https://policyengine.org/us/household?focus=householdOutput.netIncome&household=16581) that, between payroll tax, self-employment tax, federal income tax, and California income tax, they would pay $58,949 in taxes, leaving a net income of $141,051 (they would not be eligible for any benefits).¹

Now with $1 million in gambling winnings, their [tax bill will rise $436,115](https://policyengine.org/us/household?focus=householdOutput.netIncome&household=16582) from $58,949 to $495,064; federal income taxes rise from $26,967 to $361,051, California income taxes rise from $10,202 to $112,233, and payroll and self-employment taxes stay the same. Their net income rises by the remaining $563,886 to $704,937 if he doesn’t donate anything.

To take home $300,000, they might consider donating $700,000. But if they did so, their [taxes would rise $119,088](https://policyengine.org/us/household?focus=householdOutput.netIncome&household=16583), leaving them with only $300,000 — $119,088 = $180,912 net. How much less than $700,000 of a donation will offset the tax change?

Our app shows that, for Medlock’s net income to rise by $300,000, he should donate **$484,848**. [In this scenario](https://policyengine.org/us/household?focus=householdOutput.netIncome&household=16586), his taxes would rise $215,235. (This actually leaves him $299,917; we run an optimization process that gets within $100 or so to save time.)

We also show various donation scenarios as a table:


![](https://cdn-images-1.medium.com/max/800/0*PCSgFGaaV70lLv8P)

And as a Plotly chart:


![](https://cdn-images-1.medium.com/max/800/0*BG6ygtFTdgcXdm_a)

Calling the `policyengine-us` `Simulation` object with `axes` makes it easy and fast to simulate many scenarios like this. All in all, the app required 224 lines of Python code, including text and charts. See the full program at[ github.com/PolicyEngine/james-medlock-donation-solver](http://github.com/PolicyEngine/james-medlock-donation-solver/) and the app at [policyengine-james-medlock-donation-solver.streamlit.app](https://policyengine-james-medlock-donation-solver.streamlit.app/).


### Conclusion

While most of our users interact with our software through the web app, our Python packages provide flexible analysis, especially paired with dashboarding tools like Streamlit. We’ll be watching the Medlock-Srinivasan bet, and building more tools to answer one-off questions outside our main app, including those around charitable giving. Stay tuned!

¹ California has not yet released its 2023 tax bracket thresholds, so we use values from 2022.

By [Max Ghenis](https://medium.com/@maxghenis) on [March 23, 2023](https://medium.com/p/35dbd361abdb).

[Canonical link](https://medium.com/@maxghenis/how-much-should-james-medlock-donate-to-givedirectly-35dbd361abdb)

Exported from [Medium](https://medium.com) on January 10, 2026.
