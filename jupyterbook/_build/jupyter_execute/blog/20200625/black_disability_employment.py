Employment trends by race and disability
==================================

How does *prime-age employment* (the employment rate of civilians aged 25 to 54)
vary with race and disability status? How does disability status vary by race?
How do race and disability status compare in predicting employment?

In this post, I use the Current Population Survey to find out.
Overall, I find that the disability employment gap is large---41 percentage points on average in May 2020.
The racial employment gap (non-Black minus Black) is 7 points, but since Black people are about 30 percent more likely
to have a disability, this gap shrinks to 6.3 points when controlling for disability status.
Among people with disabilities, black people have employment rates 11 points lower than
non-black people (a 32 percent difference).
I also find that the coronavirus recession widened the racial employment gap, primarily
among the population without disabilities.

## Background

The prime-age employment rate (often abbreviated as *PAEPOP*, for Prime Age Employment POPulation ratio)
is used as a consistent measure of employment trends by economists who
want to avoid relying on whether survey respondents say they're still looking for work.
The calculation is simply the share of civilians aged 25 to 54 that reported working in the survey week.

[Federal Reserve Economic Data](http://fred.stlouisfed.org/) publishes some related trends,
e.g. [PAEPOP by disability and gender](https://fred.stlouisfed.org/series/LNU02376960)
and [black employment rate among the aged 16+ population](https://fred.stlouisfed.org/series/LNS12300006),
but we need to limit by ages to avoid effects of college education and early retirement,
both of which may reflect lower employment without worse labor market outcomes.
For the right statistics, we need to go to the CPS microdata instead (I used [IPUMS](http://ipums.org) to extract it).

For simplicity, I focus on two binary features identified in the CPS:
being Black only (compared to all other races), and
reporting [any physical or cognitive difficulty](https://cps.ipums.org/cps-action/variables/DIFFANY#description_section) (which I describe here as having a disability).

## Results

From 2017 until the coronavirus hit, the employment gap between Black people and non-Black people had been roughly steady at around 4 percentage points.
But the pandemic hurt Black people disproportionately: in April, the gap grew to 6 points, 
and even as both groups recovered in May, it grew further to 7 points.

### LOAD PACKAGES ###

import pandas as pd
import numpy as np
import microdf as mdf
import plotly.express as px
import statsmodels.api as sm
import stargazer.stargazer as sg

### LOAD DATA ###

# CPS data extracted from IPUMS.
cps_raw = pd.read_csv('cps.csv.gz')

### PREPROCESS ###

cps = cps_raw.copy(deep=True)
cps.columns = cps.columns.str.lower()
cps.rename({'wtfinl': 'w'}, axis=1, inplace=True)
cps['day'] = 12  # CPS asks about week including 12th of the month.
cps['date'] = pd.to_datetime(cps[['year', 'month', 'day']])
# Create descriptive bools from codes.
cps['female'] = cps.sex == 2
cps['emp'] = cps.empstat.isin([10, 12])
cps['black'] = np.where(cps.race == 200, 'Black', 'Not Black')
# Recode disability into True/False/None.
for i in ['diffhear', 'diffeye', 'diffrem', 'diffphys', 'diffmob', 'diffcare',
          'diffany']:
    cps[i] = np.where(cps[i] == 0, np.nan, cps[i] == 2)
    
# Limit to prime-age civilians and relevant columns.
COLS = ['emp', 'date', 'w', 'black', 'diffany']
cps = cps[(cps.empstat != 1)  # Not in armed forces.
          & cps.age.between(25, 54)][COLS]
assert cps.diffany.isna().sum() == 0
cps['disability'] = np.where(cps.diffany == 1, 'Has disability',
                             'No disability')

### ANALYSIS ###

# Create grouped dataframe.
grouped = cps.groupby(['date', 'black', 'disability', 'emp'])[['w']].sum()
grouped.reset_index(inplace=True)
# Add conditional columns for creating rates.
mdf.add_weighted_metrics(grouped, ['emp'], 'w')
grouped['disability_m'] = np.where(grouped.disability == 'Has disability',
                                   grouped.w_m, 0)

def add_emp_rate(df):
    df['emp_rate'] = 100 * df.emp_m / df.w_m
    df.drop(['emp_m', 'w_m'], axis=1, inplace=True)
    df.reset_index(inplace=True)
    
def add_disability_rate(df):
    df['disability_rate'] = 100 * df.disability_m / df.w_m
    df.drop(['disability_m', 'w_m'], axis=1, inplace=True)
    df.reset_index(inplace=True)
    
race_emp = grouped.groupby(['date', 'black'])[['emp_m', 'w_m']].sum()
add_emp_rate(race_emp)

disability_emp = grouped.groupby(['date', 'disability'])[
    ['emp_m', 'w_m']].sum()
add_emp_rate(disability_emp)

race_disability = grouped.groupby(['date', 'black'])[
    ['disability_m', 'w_m']].sum()
add_disability_rate(race_disability)

race_disability_emp = grouped.groupby(['date', 'black', 'disability'])[
    ['emp_m', 'w_m']].sum()
add_emp_rate(race_disability_emp)
race_disability_emp['label'] = (race_disability_emp.black + ', ' +
                                race_disability_emp.disability)

def line_graph(df, x, y, color, title, yaxis_title):
    fig = px.line(df, x=x, y=y, color=color)
    fig.update_layout(
        title=title,
        xaxis_title='',
        yaxis_title=yaxis_title,
        yaxis_ticksuffix='%',
        legend_title_text='',
        font=dict(family='Roboto'),
        hovermode='x'
    )
    # TODO: Use hoverformat to reduce decimal points.
    fig.update_traces(mode='markers+lines', hovertemplate=None)

    fig.show()

line_graph(df=race_emp, x='date', y='emp_rate', color='black',
           title='Prime-age employment rate by race',
           yaxis_title='Employment rate of civilians aged 25 to 54')

Black people are also about 30 percent more likely to have a disability than non-Black people:
while small samples make the signal noisy on a month-to-month basis, the rates are about 7.5 percent and 5.7 percent, respectively.

line_graph(race_disability, x='date', y='disability_rate', color='black',
           title='Disability rate by race, civilians aged 25 to 54',
           yaxis_title=
           'Share of civilians aged 25 to 54 who report any difficulty')

The disability employment gap is very large, but it has shrunk over time.
From January 2017 to January 2020, it fell from 50 percentage points
(30 percent among people with disabilities and 80 percent among people without disabilities)
to 46 points (37 percent and 83 percent).
Coronavirus has actually shrunk the gap further: since January, employment of people with disabilities
has fallen 5 points, compared to 9 points among people without disabilities.

line_graph(disability_emp, x='date', y='emp_rate', color='disability',
           title='Prime-age employment rate by disability status',
           yaxis_title='Employment rate of civilians aged 25 to 54')

Breaking out the trends by both race and disability status reveals that
the racial employment gap among people without disabilities has been steady around 3 percentage points since 2017, but
has roughly doubled since coronavirus.
The racial employment gap among people with disabilities has been noisy at around 10 points,
and does not appear to have changed significantly as a result of coronavirus.

line_graph(race_disability_emp, x='date', y='emp_rate', color='label',
           title='Prime-age employment rate by race and disability status',
           yaxis_title='Employment rate of civilians aged 25 to 54')

Honing in on the latest month of data (May 2020) emphasizes the 50-percent-larger racial employment gap
among people with disabilities.
Put another way: among people without disabilities, Black people are 8 percent less likely to be
employed than non-Black people, while they're 32 percent less likely to be employed among people *with* disabilities.

race_disability_emp_latest = race_disability_emp[
    race_disability_emp.date == race_disability_emp.date.max()]

fig = px.bar(race_disability_emp_latest, x='label', y='emp_rate')
fig.update_layout(
    title='Prime-age employment rate by race and disability status,' +
    ' April 2020',
    xaxis_title='',
    yaxis_title='Employment rate of civilians aged 25 to 54',
    yaxis_ticksuffix='%',
    legend_title_text='',
    font=dict(family='Roboto'),
    xaxis={'categoryorder':'total descending'}
)
fig.update_traces(hovertemplate=None)
fig.show()

How to tease out the effects of being Black vs. having a disability, when they interact and each 
intersectional subgroup differs in size?
Regression, of course!

A linear probability regression shows that, in May 2020, being Black had an average employment effect of -6.3 percentage points,
while having a disability had an average effect of -41.0 percentage points (about 6.5x the Black effect).

cps_latest = cps[cps.date == cps.date.max()].drop('date', axis=1)

cps_latest['is_black'] = cps_latest.black == 'Black'
cps_latest['has_disability'] = cps_latest.disability == 'Has disability'
cps_latest.drop(['black', 'disability'], axis=1, inplace=True)

cps_latest = sm.add_constant(cps_latest) * 1

m = sm.WLS(cps_latest.emp, cps_latest[['is_black', 'has_disability', 'const']],
           cps_latest.w).fit(cov_type='HC1')

star = sg.Stargazer([m])
star.covariate_order(['is_black', 'has_disability'])
star.rename_covariates({'is_black': 'Black',
                        'has_disability': 'Has disability'})
star

While people with disabilities represent a small part of the overall racial employment gap,
they constitute a particularly acute element of it.
As we rethink our approach to work in the age of coronavirus,
we will have opportunities to close part of the enormous disability employment gap,
which will in turn close part of the racial employment gap.