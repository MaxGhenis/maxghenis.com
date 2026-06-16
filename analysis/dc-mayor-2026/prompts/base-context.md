# Base context for D.C. mayor forecast prompts

Election: 2026 District of Columbia mayoral election.

The D.C. mayoral term begins at noon on January 2, 2027 and ends at noon on January 2, 2031. Forecast outcomes for the end of calendar year 2030 unless the metric target says otherwise.

Candidates:

- Kenyan McDuffie: McDuffie frames his platform around public safety, affordability, economic development, child care, and government accountability. Source: https://kenyanmcduffie.com/platform
- Janeese Lewis George: George frames her platform around affordability, tenant protections, public services, safe streets, transit, bike lanes, and a larger housing production target. Source: https://janeesefordc.com/

Primary-source outcome metrics:

- dc_real_gdp: D.C. real GDP (millions of chained 2017 dollars); source: https://www.bea.gov/data/gdp/gdp-state
- bike_lane_miles: Bike lane miles (miles); source: https://opendata.dc.gov/datasets/DCGIS::bicycle-lanes/explore
- traffic_fatalities: Traffic fatalities (fatal persons per calendar year); source: https://opendata.dc.gov/datasets/DCGIS::crashes-in-dc/about
- housing_permits: Housing permits (new privately owned housing units authorized by building permits); source: https://www.census.gov/construction/bps/statemonthly.html

Baselines:

```json
{
  "dc_real_gdp": {
    "label": "D.C. real GDP",
    "unit": "millions of chained 2017 dollars",
    "source_url": "https://www.bea.gov/data/gdp/gdp-state",
    "download_url": "https://apps.bea.gov/regional/zip/SQGDP.zip",
    "latest": {
      "period": "2025:Q4",
      "value": 143581.6
    },
    "year_over_year_percent": -2.437,
    "history": [
      {
        "period": "2022:Q1",
        "value": 145054.0
      },
      {
        "period": "2022:Q2",
        "value": 142988.3
      },
      {
        "period": "2022:Q3",
        "value": 142409.9
      },
      {
        "period": "2022:Q4",
        "value": 141751.0
      },
      {
        "period": "2023:Q1",
        "value": 142009.7
      },
      {
        "period": "2023:Q2",
        "value": 143245.3
      },
      {
        "period": "2023:Q3",
        "value": 143312.7
      },
      {
        "period": "2023:Q4",
        "value": 144149.2
      },
      {
        "period": "2024:Q1",
        "value": 143979.7
      },
      {
        "period": "2024:Q2",
        "value": 144451.7
      },
      {
        "period": "2024:Q3",
        "value": 144752.1
      },
      {
        "period": "2024:Q4",
        "value": 147168.3
      },
      {
        "period": "2025:Q1",
        "value": 146251.6
      },
      {
        "period": "2025:Q2",
        "value": 146236.5
      },
      {
        "period": "2025:Q3",
        "value": 146716.3
      },
      {
        "period": "2025:Q4",
        "value": 143581.6
      }
    ]
  },
  "bike_lane_miles": {
    "label": "Bike lane miles",
    "unit": "miles",
    "source_url": "https://opendata.dc.gov/datasets/DCGIS::bicycle-lanes/explore",
    "endpoint_url": "https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Transportation_Bikes_Trails_WebMercator/MapServer/2",
    "segments": 2345,
    "route_miles": 108.51,
    "lane_miles": 169.37,
    "protected_route_miles": 21.91,
    "protected_lane_miles": 41.62
  },
  "traffic_fatalities": {
    "label": "Traffic fatalities",
    "unit": "fatal persons per calendar year",
    "source_url": "https://opendata.dc.gov/datasets/DCGIS::crashes-in-dc/about",
    "endpoint_url": "https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Public_Safety_WebMercator/MapServer/24",
    "history": [
      {
        "year": 2019,
        "fatalities": 27,
        "components": {
          "FATAL_BICYCLIST": 1,
          "FATAL_DRIVER": 12,
          "FATAL_PEDESTRIAN": 10,
          "FATALPASSENGER": 4,
          "FATALOTHER": 0
        }
      },
      {
        "year": 2020,
        "fatalities": 41,
        "components": {
          "FATAL_BICYCLIST": 0,
          "FATAL_DRIVER": 27,
          "FATAL_PEDESTRIAN": 10,
          "FATALPASSENGER": 4,
          "FATALOTHER": 0
        }
      },
      {
        "year": 2021,
        "fatalities": 39,
        "components": {
          "FATAL_BICYCLIST": 1,
          "FATAL_DRIVER": 19,
          "FATAL_PEDESTRIAN": 17,
          "FATALPASSENGER": 2,
          "FATALOTHER": 0
        }
      },
      {
        "year": 2022,
        "fatalities": 38,
        "components": {
          "FATAL_BICYCLIST": 2,
          "FATAL_DRIVER": 15,
          "FATAL_PEDESTRIAN": 18,
          "FATALPASSENGER": 2,
          "FATALOTHER": 1
        }
      },
      {
        "year": 2023,
        "fatalities": 49,
        "components": {
          "FATAL_BICYCLIST": 3,
          "FATAL_DRIVER": 20,
          "FATAL_PEDESTRIAN": 18,
          "FATALPASSENGER": 6,
          "FATALOTHER": 2
        }
      },
      {
        "year": 2024,
        "fatalities": 50,
        "components": {
          "FATAL_BICYCLIST": 2,
          "FATAL_DRIVER": 21,
          "FATAL_PEDESTRIAN": 16,
          "FATALPASSENGER": 9,
          "FATALOTHER": 2
        }
      },
      {
        "year": 2025,
        "fatalities": 22,
        "components": {
          "FATAL_BICYCLIST": 0,
          "FATAL_DRIVER": 6,
          "FATAL_PEDESTRIAN": 14,
          "FATALPASSENGER": 2,
          "FATALOTHER": 0
        }
      }
    ],
    "current_year_to_date": {
      "year": 2026,
      "fatalities": 14,
      "components": {
        "FATAL_BICYCLIST": 1,
        "FATAL_DRIVER": 6,
        "FATAL_PEDESTRIAN": 5,
        "FATALPASSENGER": 1,
        "FATALOTHER": 1
      }
    }
  },
  "housing_permits": {
    "label": "Housing permits",
    "requested_label": "Housing starts",
    "limitation": "The Census starts release does not publish D.C.-level housing starts. This harness uses D.C.-level permit authorizations as the primary-source proxy.",
    "unit": "new privately owned housing units authorized by building permits",
    "source_url": "https://www.census.gov/construction/bps/statemonthly.html",
    "annual": [
      {
        "year": 2019,
        "url": "https://www.census.gov/construction/bps/xls/stateannual_201999.xls",
        "total": 5945,
        "one_unit": 168,
        "two_units": 90,
        "three_or_four_units": 4,
        "five_plus_units": 5683,
        "five_plus_structures": 59
      },
      {
        "year": 2020,
        "url": "https://www.census.gov/construction/bps/xls/stateannual_202099.xls",
        "total": 7370,
        "one_unit": 139,
        "two_units": 94,
        "three_or_four_units": 4,
        "five_plus_units": 7133,
        "five_plus_structures": 52
      },
      {
        "year": 2021,
        "url": "https://www.census.gov/construction/bps/xls/stateannual_202199.xls",
        "total": 4740,
        "one_unit": 376,
        "two_units": 24,
        "three_or_four_units": 7,
        "five_plus_units": 4333,
        "five_plus_structures": 50
      },
      {
        "year": 2022,
        "url": "https://www.census.gov/construction/bps/xls/stateannual_202299.xls",
        "total": 7705,
        "one_unit": 409,
        "two_units": 64,
        "three_or_four_units": 4,
        "five_plus_units": 7228,
        "five_plus_structures": 66
      },
      {
        "year": 2023,
        "url": "https://www.census.gov/construction/bps/xls/stateannual_202399.xls",
        "total": 3020,
        "one_unit": 166,
        "two_units": 64,
        "three_or_four_units": 11,
        "five_plus_units": 2779,
        "five_plus_structures": 41
      },
      {
        "year": 2024,
        "url": "https://www.census.gov/construction/bps/xls/stateannual_202499.xls",
        "total": 1737,
        "one_unit": 146,
        "two_units": 82,
        "three_or_four_units": 3,
        "five_plus_units": 1506,
        "five_plus_structures": 40
      },
      {
        "year": 2025,
        "url": "https://www.census.gov/construction/bps/xls/stateannual_202599.xls",
        "total": 1591,
        "one_unit": 181,
        "two_units": 38,
        "three_or_four_units": 0,
        "five_plus_units": 1372,
        "five_plus_structures": 20
      }
    ],
    "latest_monthly_url": "https://www.census.gov/construction/bps/xls/statemonthly_202604.xls",
    "latest_period": "202604",
    "latest_month": {
      "total": 25,
      "one_unit": 25,
      "two_units": 0,
      "three_or_four_units": 0,
      "five_plus_units": 0,
      "five_plus_structures": 0
    }
  }
}
```

Causal design:

Use Janeese Lewis George's vote margin over Kenyan McDuffie as the running variable. Negative margins mean McDuffie wins. Positive margins mean George wins.

The close-election estimand is the discontinuity between George winning by 1 point and McDuffie winning by 1 point. Do not treat the 20-point spread contrast as a clean causal effect of the winner; it also includes mandate, coalition, turnout, and broader political-environment differences.
