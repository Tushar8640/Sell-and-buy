# সবজি বাজার দর (Sobji Bazar)

Collects retail and wholesale vegetable prices for Bangladesh from public sources and shows daily, monthly,
yearly and seasonal (month-of-year) price patterns, so you can see which months each crop sells high or low.

Each crop page has: a time range (30 days to 10 years, or custom months), retail/wholesale, source and
division filters; a year x month price table; a month drill-down (that month in every year, plus its daily
prices); a year-over-year chart; and the exact published prices behind every number.

## Quick start

```bash
npm install
npm run collect          # downloads data into data/prices.json (about 10 minutes the first time)
npm run dev              # http://localhost:3000
```

Requires Node.js 22.15+ (uses `--use-system-ca`, see below).

### Collector options

```bash
npm run collect -- --pages=5      # newest 5 TCB listing pages only (10 daily reports per page)
npm run collect -- --pages=142    # TCB's full archive (about 1,400 reports, back to May 2021)
npm run collect -- --skip-wfp     # skip a source (also --skip-tcb, --skip-dam)
npm run collect -- --delay=1500   # slower requests (ms between downloads, default 800)
```

Runs are incremental: TCB reports already parsed are skipped, and raw files are cached in `data/raw/`
(git-ignored). Set `DEBUG_UNMATCHED=1` to list TCB rows that did not map to a crop.

## Data sources

| Source | What | Frequency | Coverage |
|---|---|---|---|
| [TCB daily retail market prices](https://tcb.gov.bd/pages/daily-rmps) | XLSX per day, min/max retail price | Daily | Dhaka city |
| [DAM via Krishi Sheba portal](https://moa-services.com/market-directory/division-wise-average-market-price-report) | JSON API, retail + wholesale, by grade | Daily (national) and monthly (per division) | Markets in all 8 divisions, from June 2025 |
| [WFP Bangladesh food prices (HDX)](https://data.humdata.org/dataset/wfp-food-prices-for-bangladesh) | CSV, CC BY-IGO | Monthly | Markets in all divisions, vegetables from Feb 2024 |

Each TCB report also carries the price one year earlier; that value is stored with `derived: true` and
is replaced if the actual report for that day is collected later.

DAM notes:

- The daily report endpoint ignores its division filter, so DAM daily prices are national averages.
  Division-level prices come from the monthly market report (one request per division and commodity).
- DAM data has entry errors (for example a max of 36,519 Tk/kg). Rows whose max is over 3x their min
  are dropped, and so is any point more than 4x away from its series median.
- Wholesale prices are published per quintal (or per 100 pieces) and converted to per kg (per piece).
- DAM's older system (market.dam.gov.bd) has Dhaka city retail prices for about October 2017 to
  mid-2020, plus scattered dates (2014, 2021, early 2023). Each request takes about 30 seconds, so
  `--legacy` samples the 5th and 20th of each month (change with `--legacy-days=1,10,20`,
  `--legacy-from`, `--legacy-to`). Quarterly test samples found no data for 2015 to mid-2017 or for
  most of 2022 to mid-2025 in that system.

Not yet included:
- **Production volumes**: BBS publishes annual production in the Yearbook of Agricultural Statistics
  (PDF). There is no monthly production series; the seasonal price index is used as a proxy for supply.

`tcb.gov.bd` serves an incomplete TLS certificate chain. The collector runs Node with `--use-system-ca`
so the operating system's trust store can complete it. TLS verification stays on.

## How the numbers are calculated

- **Daily**: average of the observations on that date (TCB price = midpoint of its min/max). When a
  daily source (TCB) is available, monthly WFP points are left out of the daily series, because mixing
  a national monthly average into a Dhaka daily series creates false spikes. Latest price and
  7/30/365-day changes come from this daily series.
- **Monthly**: each source is averaged per month first, then the sources are averaged, so daily TCB
  rows do not outweigh monthly WFP rows.
- **Yearly**: average of that year's monthly values.
- **Seasonal index**: for each year with at least 4 months of data, month price / that year's average
  × 100, then averaged across years. 100 = normal; 120 = 20% above the year's average. Peak and low
  months are shown only when at least 6 months have an index.

Prices are retail. Farm-gate prices are usually lower. With 2–3 years of data, seasonal patterns are
indicative, not a forecast.

## Project layout

```
scripts/collect.ts          collector entry point (npm run collect)
scripts/sources/tcb.ts      TCB listing + XLSX parser
scripts/sources/wfp.ts      WFP/HDX CSV download
src/lib/catalogue.ts        crop list and source name mapping (add crops here)
src/lib/types.ts            record shape stored in data/prices.json
src/lib/repository.ts       the only code that reads the JSON file — swap this for a database
src/lib/analytics.ts        daily/monthly/yearly/seasonal aggregation (pure functions)
src/lib/prices.ts           cached read models used by pages and API
src/app/page.tsx            overview: all crops × months heatmap
src/app/crop/[id]/page.tsx  one crop: charts, filters, seasonal insight
src/app/api/crops/...       JSON API: /api/crops and /api/crops/:id?source=tcb|wfp|all&division=...
```

## Moving to a database

`PriceRecord` in `src/lib/types.ts` maps directly to one table
(`crop, date, source, division, market, price_type, price, price_min, price_max, derived`) with a unique
key on `(source, crop, market, price_type, date)`. Reimplement `getCropRecords` and `getMeta` in
`src/lib/repository.ts`, and have the collector write rows instead of the JSON file.
