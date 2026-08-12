# BYD valuation methodology

Last checked: 8 August 2026

## Purpose

The BYD workbench is a transparent scenario tool, not a target price, recommendation, consensus estimate, or live market-data terminal. It provides two cross-checks: P/E and an EV/EBITDA proxy.

## P/E method

1. Implied equity value = normalized net profit × target P/E.
2. RMB value per share = implied equity value ÷ 9.117 billion adjusted ordinary shares.
3. HKD value per share = RMB value per share × selected RMB/HKD rate.
4. Upside/downside = implied HKD value per share ÷ dated H-share reference − 1.

Normalized profit, target multiple and FX are editable analyst assumptions. The starting normalized profit is BYD's reported FY2025 attributable net profit of RMB32.6 billion.

## EV/EBITDA proxy method

1. 2025 EBITDA proxy = standardized operating income of RMB40.185 billion + standardized depreciation/amortization of RMB13.267 billion = RMB53.452 billion.
2. Implied enterprise value = normalized EBITDA proxy × target EV/EBITDA.
3. Implied equity value = implied enterprise value − selected net debt.
4. Per-share conversion follows the P/E method.
5. Reference EV/EBITDA = (H-share-implied market capitalization + selected net debt) ÷ normalized EBITDA proxy.

The EBITDA proxy is Atlas-derived from Financial Times/LSEG standardized fields. It is not company-reported adjusted EBITDA.

## Net-debt treatment

The default is the conventional FY2025 reported balance-sheet bridge:

| Component | RMB bn | Treatment |
| --- | ---: | --- |
| Short-term borrowings | 38.485 | Add |
| Long-term borrowings | 60.706 | Add |
| Non-current liabilities due within one year | 6.312 | Add |
| Lease liabilities | 8.620 | Add |
| Monetary funds | 75.425 | Subtract |
| **Conventional net debt including leases** | **38.698** | **Derived** |

Formula: `38.485 + 60.706 + 6.312 + 8.620 − 75.425 = RMB38.698bn`.

This bridge is sourced from BYD's audited 2025 annual report. It includes reported borrowing categories and leases but does not reclassify supplier payables or bills payable as debt. It also does not make unpublished adjustments to monetary funds for restrictions or classify finance-company balances and receivables financing. Those items should be examined in a separate adjusted-liquidity stress case rather than silently folded into conventional net debt.

Positive slider values represent net debt; negative values represent net cash. Enterprise value minus net debt gives equity value. The slider remains editable so an analyst can test stricter cash eligibility, lease exclusions, or additional financing adjustments without changing the reported base case.

## Share count and market reference

The model uses 9.117 billion adjusted ordinary shares from BYD's Q1 2026 filing following the 2025 bonus and capitalization issues. The reference H-share close is HK$87.85 on 22 July 2026 from Financial Times/LSEG. It is dated, not live.

The model applies one economic value per adjusted ordinary share. It does not model A/H trading premiums, liquidity, convertibility restrictions, transaction costs, taxes or timing differences.

## Source hierarchy

1. BYD company filings for reported earnings, share count and balance-sheet facts.
2. Financial Times/LSEG standardized statements for operating income, depreciation/amortization and the dated H-share close.
3. Atlas calculations for ratios and implied values.

## Known exclusions

- Consensus estimates and broker target prices.
- Segment EBITDA and sum-of-the-parts valuation.
- Pension deficits, minority interests and associates in enterprise value.
- A finance-company-adjusted or supplier-financing-adjusted debt bridge.
- Real-time share price and FX feeds.
- Dilution from future securities or employee awards.

All derived values should retain the source vintage and formula. Missing data must be shown as a research gap, not silently imputed.
