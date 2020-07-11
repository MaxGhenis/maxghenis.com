---
jupytext:
  text_representation:
    extension: .md
    format_name: myst
    format_version: '0.8'
    jupytext_version: 1.5.0
kernelspec:
  display_name: Python 3
  language: python
  name: python3
---

How disabilities affect Black employment
==================================

How does prime-age employment (the employment rate of civilians aged 25 to 54)
vary with race and disability status? How does disability status vary by race?
How do race and disability status compare in predicting employment? In this post, I use the monthly Current Population Survey from January 2018 to May 2020 to find out.

I find that the disability employment gap is 45 percentage points, with and without controlling for factors like age.
The racial employment gap (non-Black minus Black) is about 4 points, but since Black people are more likely
to have a disability---specifically physical and mobility limitations that most severely reduce employment---this gap shrinks to 2.9 points when controlling for disabilities.
While most individual disabilities do not have a differential impact on Blacks, having *any* disability reduces Black employment 3 points more than non-Black employment.

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

## Employment trends

The employment gap between people with and without disabilities has been roughly 45 percentage points since 2018.

```{code-cell} ipython3
:tags: [hide-input]

### LOAD PACKAGES ###

import pandas as pd
import numpy as np
import microdf as mdf
import plotly.express as px
import statsmodels.api as sm
import stargazer.stargazer as sg


### SETTINGS ###

# Colors from https://material.io/design/color/the-color-system.html
BLUE = '#1976D2'
GRAY = '#BDBDBD'
RED = '#C62828'
PURPLE = '#6A1B9A'
LIGHT_BLUE = '#64B5F6'
PINK = '#EF9A9A'

COLOR_MAP = {
    'Black': BLUE,
    'Not Black': GRAY,
    'Has disability': RED,
    'No disability': GRAY,
    'Black, Has disability': PURPLE,
    'Black, No disability': LIGHT_BLUE,
    'Not Black, Has disability': PINK,
    'Not Black, No disability': GRAY
}


### LOAD DATA ###

# CPS data extracted from IPUMS.
cps = pd.read_csv('cps.csv.gz')

### PREPROCESS ###

# cps = cps_raw.copy(deep=True)
cps.columns = cps.columns.str.lower()
cps.rename({'wtfinl': 'w'}, axis=1, inplace=True)
cps['day'] = 12  # CPS asks about week including 12th of the month.
cps['date'] = pd.to_datetime(cps[['year', 'month', 'day']])
# May be unnecessary.
cps = cps[cps.date > pd.to_datetime('2017-12-31')]
# Create descriptive bools from codes.
cps['female'] = np.where(cps.sex == 2, 1, 0)
# Multiply by 100 for charts and easier regression interpretation.
cps['emp'] = 100 * cps.empstat.isin([10, 12])
cps['black'] = np.where(cps.race == 200, 'Black', 'Not Black')
# Recode disability into True/False/None.
DIFFS = ['diffhear', 'diffeye', 'diffrem', 'diffphys', 'diffmob', 'diffcare']
for i in DIFFS + ['diffany']:
    cps[i] = np.where(cps[i] == 0, np.nan, cps[i] == 2)
    
# Limit to prime-age civilians and relevant columns.
cps = cps[(cps.empstat != 1)  # Not in armed forces.
          & cps.age.between(25, 54)]
assert cps.diffany.isna().sum() == 0
cps['disability'] = np.where(cps.diffany == 1, 'Has disability',
                             'No disability')

# Add time fixed effects for regression.
cps['month_fe'] = ('t' + cps.year.astype(str) +
                   cps.month.astype(str).str.zfill(2))
cps = pd.concat([cps, pd.get_dummies(cps.month_fe, drop_first=True)], axis=1)
# Get list of month FEs for regressions later.
month_fes = cps.month_fe.unique()[1:].tolist()
# No longer need other time columns.
cps.drop(['year', 'month', 'day', 'month_fe'], axis=1, inplace=True)
# Dummy for Covid-19, which came into full effects in the April 2020 survey.
cps['covid'] = np.where(cps.date > '2020-04-01', 1, 0)
# Add other features for regression.
cps['age2'] = np.power(cps.age, 2)
cps['const'] = 1
# Count difficulties.
cps['num_diffs'] = cps[DIFFS].sum(axis=1)

# Group-specific time trends, in days.
def time_trend(condition):
    return np.where(condition,
                    (cps.date - pd.to_datetime('2000-01-01')).dt.days, 0)

cps['date_black'] = time_trend(cps.black == 'Black')
cps['date_disability'] = time_trend(cps.disability == 'Has disability')
cps['date_black_disability'] = time_trend(
    (cps.black == 'Black') & (cps.disability == 'Has disability'))

### ANALYSIS ###

# Create grouped dataframe.
grouped = cps.groupby(['date', 'black', 'disability', 'emp'])[['w']].sum()
grouped.reset_index(inplace=True)
# Add conditional columns for creating rates.
mdf.add_weighted_metrics(grouped, ['emp'], 'w')
grouped['disability_m'] = np.where(grouped.disability == 'Has disability',
                                   grouped.w_m, 0)

def add_emp_rate(df):
    df['emp'] = df.emp_m / df.w_m
    df['emp_round'] = df.emp.round(1)
    df.drop(['emp_m', 'w_m'], axis=1, inplace=True)
    df.reset_index(inplace=True)
    
def add_disability_rate(df):
    df['disability_rate'] = 100 * df.disability_m / df.w_m
    df['disability_rate_round'] = df.disability_rate.round(1)
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

### VISUALIZATION ###

def line_graph(df, x, y, color, title, yaxis_title):
    fig = px.line(df, x=x, y=y, color=color, color_discrete_map=COLOR_MAP)
    fig.update_layout(
        title=title,
        xaxis_title='',
        yaxis_title=yaxis_title,
        yaxis_ticksuffix='%',
        legend_title_text='',
        font=dict(family='Roboto'),
        hovermode='x',
        plot_bgcolor='white'
    )
    fig.update_traces(mode='markers+lines', hovertemplate=None)

    fig.show()


# Plot by disability status.
line_graph(disability_emp, x='date', y='emp_round', color='disability',
           title='Prime-age employment rate by disability status',
           yaxis_title='Employment rate of civilians aged 25 to 54')
```

Black people are about 30 percent more likely to have a disability than non-Black people, with rates of about 7.5 percent compared to 5.7 percent, respectively. Small samples make this a noisy signal on a month-to-month basis: only 301 of the 36,000 prime-age civilian respondents in the April 2020 survey reported being Black and having a disability.

```{code-cell} ipython3
:tags: [hide-input]

line_graph(race_disability, x='date', y='disability_rate_round', color='black',
           title='Disability rate by race, civilians aged 25 to 54',
           yaxis_title=
           'Share of civilians aged 25 to 54 who report any difficulty')
```

The higher disability rate among Black people contributes to the racial employment gap, which has been roughly stable at about 4.5 percentage points.

```{code-cell} ipython3
:tags: [hide-input]

line_graph(df=race_emp, x='date', y='emp_round', color='black',
           title='Prime-age employment rate by race',
           yaxis_title='Employment rate of civilians aged 25 to 54')
```

Breaking out the trends by both race and disability status reveals that
the racial employment gap among people without disabilities has been steady around 3 percentage points since 2017, but
has roughly doubled since coronavirus.
The racial employment gap among people with disabilities has been noisy at around 10 points,
and does not appear to have changed significantly as a result of coronavirus.

```{code-cell} ipython3
:tags: [hide-input]

line_graph(race_disability_emp, x='date', y='emp_round', color='label',
           title='Prime-age employment rate by race and disability status',
           yaxis_title='Employment rate of civilians aged 25 to 54')
```

Honing in on the latest month of data (May 2020) emphasizes the 50-percent-larger racial employment gap
among people with disabilities.
Put another way: among people without disabilities, Black people are 8 percent less likely to be
employed than non-Black people, while they're 32 percent less likely to be employed among people *with* disabilities.

```{code-cell} ipython3
:tags: [hide-input]

race_disability_emp_latest = race_disability_emp[
    race_disability_emp.date == race_disability_emp.date.max()].copy(
    deep=True)
race_disability_emp_latest.sort_values('black', ascending=True, inplace=True)

fig = px.bar(race_disability_emp_latest, x='disability', y='emp_round',
             color='black', barmode='group',
             color_discrete_map=COLOR_MAP)
fig.update_layout(
    title='Prime-age employment rate by race and disability status,' +
    ' May 2020',
    xaxis_title='',
    yaxis_title='Employment rate of civilians aged 25 to 54',
    yaxis_ticksuffix='%',
    legend_title_text='',
    plot_bgcolor='white',
    font=dict(family='Roboto'),
    xaxis={'categoryorder':'total descending'}
)
fig.update_traces(hovertemplate=None)
fig.show()
```

## Statistical analysis

Regression analysis reveals the following:
* The 45-percentage-point disability employment is robust to controls like age, sex, and time.
* The 4.5-point racial employment gap shrinks to 4 points after controlling for age, sex, and time, and shrinks further to 2.9 points when controlling for disability status (including disability types).
* Controlling for disability types, Black people have a 3-point larger effect of disability than non-Blacks.

```{code-cell} ipython3
:tags: [hide-cell]

DIFFS_PLUS_NUM = DIFFS + ['num_diffs']

DD_COLS = ['black_int', 'disability_int', 'black_disability']
CONTROLS = ['age', 'age2', 'female']

# Switch text columns to bools (and later ints).
cps['black_int'] = np.where(cps.black == 'Black', 1, 0)
cps['disability_int'] = np.where(cps.disability == 'Has disability', 1, 0)
# Create interactions.
cps['black_disability'] = cps.black_int * cps.disability_int
cps['black_covid'] = cps.black_int * cps.covid
cps['disability_covid'] = cps.disability_int * cps.covid
cps['black_disability_covid'] = cps.black_disability * cps.covid
# Make all signals ints for regression.
# cps *= 1
for i in DIFFS:
    cps[i + '_black'] = cps[i] * cps.black_int


def emp_model(xcols, data=cps):
    return sm.WLS(data.emp,
                  data[xcols + ['const']],
                  data.w).fit(cov_type='HC1')


# Run model without triple-diff first.
m_disability = emp_model(['disability_int'])
m_disability_controls = emp_model(['disability_int'] + month_fes + CONTROLS)
m_black = emp_model(['black_int'])
m_black_controls = emp_model(['black_int'] + month_fes + CONTROLS)
m_black_disability = emp_model(['black_int', 'disability_int'] + month_fes +
                               CONTROLS + DIFFS_PLUS_NUM)
m_dd = emp_model(DD_COLS + month_fes + CONTROLS)
m_dd_diffs = emp_model(DD_COLS + month_fes + CONTROLS + DIFFS_PLUS_NUM)

COVARIATE_NAMES = {
    'black_int': 'Black',
    'disability_int': 'Has disability',
    'black_disability': 'Black * Has disability',
    # Name difficulties following IPUMS labels, except diffrem.
    'diffhear': 'Hearing difficulty',
    'diffeye': 'Vision difficulty',
    'diffrem': 'Cognitive difficulty',
    'diffphys': 'Physical difficulty', 
    'diffmob': 'Mobility limitation',
    'diffcare': 'Personal care difficulty',
    'diffhear_black': 'Hearing difficulty * Black',
    'diffeye_black': 'Vision difficulty * Black',
    'diffrem_black': 'Cognitive difficulty * Black',
    'diffphys_black': 'Physical difficulty * Black', 
    'diffmob_black': 'Mobility limitation * Black',
    'diffcare_black': 'Personal care difficulty * Black',
    'num_diffs': 'Number of difficulties reported'
}

def starg(models, covariate_order=None):
    """ Creates formatted Stargazer object.
    """
    star = sg.Stargazer(models)
    if covariate_order is not None:
        star.covariate_order(covariate_order)
    star.rename_covariates(COVARIATE_NAMES)
    star.show_adj_r2 = False
    star.show_residual_std_err = False
    star.show_f_statistic = False
    return star


star = starg([m_disability, m_disability_controls,
              m_black, m_black_controls, m_black_disability,
              m_dd, m_dd_diffs],
              ['disability_int', 'black_int', 'black_disability'])
star.add_line('Controls', ['No', 'Yes', 'No', 'Yes', 'Yes', 'Yes', 'Yes'])
star.add_line('Individual difficulties',
              ['No', 'No', 'No', 'No', 'Yes', 'No', 'Yes'])
star.add_custom_notes(['Controls include year-month fixed effects, '
                       'sex, age and age-squared'])
star.title('Disability, race, and prime-age employment, Jan 2018 to May 2020')
```

```{code-cell} ipython3
:tags: [hide-input]

star
```

```{code-cell} ipython3
:tags: [hide-cell]

mdf.add_weighted_metrics(cps, 'num_diffs', 'w')
# Needs to be weighted.
num_diffs = cps[cps.disability_int == 1].groupby('black')[
    ['num_diffs_m', 'w_m']].sum()
num_diffs['num_diffs'] = num_diffs.num_diffs_m / num_diffs.w_m
num_diffs.num_diffs.round(2)
```

The three most common disabilities reported in the CPS are physical, cognitive, and mobility.
Black people are especially likely to report [physical](https://cps.ipums.org/cps-action/variables/DIFFPHYS#description_section) ("serious difficulty walking or climbing stairs") and [mobility](https://cps.ipums.org/cps-action/variables/DIFFMOB#description_section) (persistent inability "to perform basic activities outside the home alone") difficulties.

```{code-cell} ipython3
:tags: [hide-input]

def share_w_disability(disability, black):
    num = cps[(cps.black == black) & (cps[disability] == 1)].w.sum()
    denom = cps[(cps.black == black) &
                (cps.disability == 'Has disability')].w.sum()
    return num / denom

diffs_black = mdf.cartesian_product({'disability': DIFFS,
                                     'black': ['Black', 'Not Black']})
diffs_black['share'] = diffs_black.apply(
    lambda row: share_w_disability(row.disability, row.black), axis=1)
diffs_black.share *= 100
diffs_black['share_round'] = diffs_black.share.round(1)
diffs_black.replace(DIFFS,
                    ['Hearing', 'Vision', 'Cognitive', 'Physical',
                     'Mobility', 'Self-care'],
                    inplace=True)
# Sort by black for within-group ordering.
diffs_black.sort_values('black', ascending=False, inplace=True)
# Order chart by prevalence among Black people.
# TODO: Separate regressions for each difficulty, plotting black coefficient.
diff_order = diffs_black[diffs_black.black == 'Black'].sort_values(
    'share').disability

fig = px.bar(diffs_black, y='disability', x='share_round', color='black',
             barmode='group', orientation='h',
             color_discrete_map=COLOR_MAP)
fig.update_layout(
    title='Prevalence of each difficulty by race',
    yaxis_title='Difficulty',
    xaxis_title='Share among people who report any difficulty',
    xaxis_ticksuffix='%',
    legend_title_text='',
    font=dict(family='Roboto'),
    yaxis={'categoryorder': 'array',
           'categoryarray': diff_order},
    plot_bgcolor='white',
    legend={'traceorder': 'reversed'}
)
fig.update_traces(hovertemplate=None)
fig.show()
```

Focusing on the disabilities themselves shows that physical and mobility difficulties
have the strongest effects on employment, reducing it by 34 and 30 points, respectively.
While Black people report these disabilities at higher rates, even among people who report any disability,
the effect of these disabilities is not significantly stronger or weaker than it is on non-Blacks.

```{code-cell} ipython3
:tags: [hide-input]

m_diffs = emp_model(['black_int'] + month_fes + CONTROLS + DIFFS)
black_diffs = [i + '_black' for i in DIFFS]
m_diffs_black = emp_model(['black_int'] + month_fes + CONTROLS + DIFFS + 
                          black_diffs)

star = starg([m_diffs, m_diffs_black],
             ['black_int'] +
             list(mdf.flatten([[i] + [i + '_black'] for i in DIFFS])))
star.title('Employment by race and specific disability')
star.add_custom_notes(['All models controls for year-month fixed effects, '
                       'sex, age and age-squared'])
star
```

While people with disabilities represent a small part of the overall racial employment gap,
they constitute a particularly acute element of it.
As we rethink our approach to work in the age of coronavirus,
we will have opportunities to close part of the enormous disability employment gap,
which will in turn close part of the racial employment gap.
