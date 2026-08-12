const cache = new Map();

async function cached(key, ttlMs, fetcher) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.fetchedAt < ttlMs) return hit.value;
  const value = await fetcher();
  cache.set(key, { value, fetchedAt: Date.now() });
  return value;
}

async function fetchWithTimeout(url, ms = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal, headers: { "User-Agent": "industrial-atlas/0.1 research prototype" } });
  } finally {
    clearTimeout(timer);
  }
}

// Frankfurter: free, no key, ECB reference rates. https://www.frankfurter.app
export async function getFxRate(from, to) {
  const key = `fx:${from}:${to}`;
  return cached(key, 6 * 60 * 60 * 1000, async () => {
    const res = await fetchWithTimeout(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`);
    if (!res.ok) throw new Error(`frankfurter ${res.status}`);
    const body = await res.json();
    const rate = body?.rates?.[to];
    if (!rate) throw new Error("no rate in response");
    return { rate, asOf: body.date, from, to, source: "Frankfurter (ECB reference rates)" };
  });
}

// Yahoo Finance chart endpoint: free, no key, unofficial. Covers HKEX/SZSE/NYSE/KRX tickers.
// The endpoint occasionally serves a bad cert on some edge nodes, so retry once before giving up.
async function fetchQuoteOnce(symbol) {
  const res = await fetchWithTimeout(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
  if (!res.ok) throw new Error(`yahoo ${res.status}`);
  const body = await res.json();
  const meta = body?.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) throw new Error("no price in response");
  return {
    symbol,
    price: meta.regularMarketPrice,
    currency: meta.currency,
    asOf: new Date(meta.regularMarketTime * 1000).toISOString(),
    source: "Yahoo Finance (unofficial endpoint, best-effort)",
  };
}

export async function getQuote(symbol) {
  const key = `quote:${symbol}`;
  return cached(key, 15 * 60 * 1000, async () => {
    try {
      return await fetchQuoteOnce(symbol);
    } catch {
      return await fetchQuoteOnce(symbol);
    }
  });
}

export async function tryLive(promise) {
  try {
    const value = await promise;
    return { live: true, ...value };
  } catch (err) {
    return { live: false, error: err.message };
  }
}
