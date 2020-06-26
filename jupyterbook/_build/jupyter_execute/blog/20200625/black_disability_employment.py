Employment trends by race and disability
==================================

How does *prime-age employment* (the employment rate of civilians aged 25 to 54)
vary with race and disability status? How does disability status vary by race?
How do race and disability status compare in predicting employment,
and how has this changed over time?

In this post, I use the Current Population Survey to find out.
Overall, I find that the disability employment gap is large--41 points on average in April 2020.
The black employment gap is 7 points, but since black people are about 30 percent more likely
to have a disability, this gap shrinks to 6.3 points when controlling for disability status.
Among people with disabilities, black people have employment rates 11 points lower than
non-black people (a 32 percent difference).
I also find that the coronavirus recession widened the black employment gap, primarily
among the population without disabilities.

## Background

The prime-age employment rate (often abbreviated as PAEPOP, for Prime Age Employment POPulation ratio)
is used as a consistent measure of employment trends by economists who
want to avoid relying on whether survey respondents say they're still looking for work.
The calculation is simple: what share of civilians aged 25 to 54 reported working in the past week.

Some related trends are published on FRED, e.g. [PAEPOP by disability and gender](https://fred.stlouisfed.org/series/LNU02376960)
and [black employment rate among the aged 16+ population](https://fred.stlouisfed.org/series/LNS12300006),
but we need to limit by ages to avoid effects of college education and early retirement,
both of which may reflect lower employment without worse labor market outcomes.

## Results

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
# Subtract a month since we care about reported month not survey month.
cps.date -= pd.DateOffset(months=1)
# Create descriptive bools from codes.
cps['female'] = cps.sex == 2
cps['emp'] = cps.empstat.isin([10, 12])
cps['black'] = cps.race == 200
# Recode disability into True/False/None.
for i in ['diffhear', 'diffeye', 'diffrem', 'diffphys', 'diffmob', 'diffcare',
          'diffany']:
    cps[i] = np.where(cps[i] == 0, np.nan, cps[i] == 2)
    
# Limit to prime-age civilians and relevant columns.
COLS = ['emp', 'date', 'w', 'black', 'diffany']
cps = cps[(cps.empstat != 1)  # Not in armed forces.
          & cps.age.between(25, 54)][COLS]
assert cps.diffany.isna().sum() == 0
cps.diffany = cps.diffany.astype(bool)

### ANALYSIS ###

# Create grouped dataframe.
grouped = cps.groupby(['date', 'black', 'diffany', 'emp'])[['w']].sum()
grouped.reset_index(inplace=True)
# Add conditional columns for creating rates.
mdf.add_weighted_metrics(grouped, ['diffany', 'emp'], 'w')

def add_emp_rate(df):
    df['emp_rate'] = 100 * df.emp_m / df.w_m
    df.drop(['emp_m', 'w_m'], axis=1, inplace=True)
    df.reset_index(inplace=True)
    
def add_disability_rate(df):
    df['disability_rate'] = 100 * df.diffany_m / df.w_m
    df.drop(['diffany_m', 'w_m'], axis=1, inplace=True)
    df.reset_index(inplace=True)
    
race_emp = grouped.groupby(['date', 'black'])[['emp_m', 'w_m']].sum()
add_emp_rate(race_emp)
race_emp['race'] = np.where(race_emp.black, 'Black', 'Not Black')

diffany_emp = grouped.groupby(['date', 'diffany'])[['emp_m', 'w_m']].sum()
add_emp_rate(diffany_emp)
diffany_emp['disability'] = np.where(diffany_emp.diffany, 'Has disability',
                                     'No disability')

race_diffany = grouped.groupby(['date', 'black'])[['diffany_m', 'w_m']].sum()
add_disability_rate(race_diffany)
race_diffany['race'] = np.where(race_diffany.black, 'Black', 'Not Black')

race_diffany_emp = grouped.groupby(['date', 'black', 'diffany'])[
    ['emp_m', 'w_m']].sum()
add_emp_rate(race_diffany_emp)
race_diffany_emp['race'] = np.where(race_diffany_emp.black, 'Black', 'Not Black')
race_diffany_emp['disability'] = np.where(race_diffany_emp.diffany,
                                          'Has disability', 'No disability')
race_diffany_emp['label'] = (race_diffany_emp.race + ', ' +
                             race_diffany_emp.disability)

fig = px.line(race_emp, x='date', y='emp_rate', color='race')
fig.update_layout(
    title='Prime-age employment rate by race',
    xaxis_title='',
    yaxis_title='Employment rate of civilians aged 25 to 54',
    yaxis_ticksuffix='%',
    legend_title_text='',
    font=dict(family='Roboto')
)

fig.show()

fig = px.line(race_diffany, x='date', y='disability_rate', color='race')
fig.update_layout(
    title='Disability rate by race, civilians aged 25 to 54',
    xaxis_title='',
    yaxis_title='Share of civilians aged 25 to 54 who report any difficulty',
    yaxis_ticksuffix='%',
    legend_title_text='',
    font=dict(family='Roboto')
)

fig.show()

fig = px.line(diffany_emp, x='date', y='emp_rate', color='disability')
fig.update_layout(
    title='Prime-age employment rate by disability status',
    xaxis_title='',
    yaxis_title='Employment rate of civilians aged 25 to 54',
    yaxis_ticksuffix='%',
    legend_title_text='',
    font=dict(family='Roboto')
)

fig.show()

fig = px.line(race_diffany_emp, x='date', y='emp_rate', color='label')
fig.update_layout(
    title='Prime-age employment rate by race and disability status',
    xaxis_title='',
    yaxis_title='Employment rate of civilians aged 25 to 54',
    yaxis_ticksuffix='%',
    legend_title_text='',
    font=dict(family='Roboto')
)

fig.show()

Honing in on the latest month of data, 

race_diffany_emp_latest = race_diffany_emp[race_diffany_emp.date == 
                                           race_diffany_emp.date.max()]

fig = px.bar(race_diffany_emp_latest, x='label', y='emp_rate')
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
fig.show()

## Regression

cps_latest = cps[cps.date == cps.date.max()].drop('date', axis=1)
cps_latest = sm.add_constant(cps_latest) * 1

m = sm.WLS(cps_latest.emp, cps_latest[['black', 'diffany', 'const']],
           cps_latest.w).fit(cov_type='HC1')

star = sg.Stargazer([m])
star.covariate_order(['black', 'diffany'])
star.rename_covariates({'black': 'Black', 'diffany': 'Has disability'})
star