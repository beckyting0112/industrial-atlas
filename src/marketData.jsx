import {useEffect,useState} from "react";

export function useLiveQuote(symbol){
  const [state,setState]=useState(null);
  useEffect(()=>{
    if(!symbol){setState(null);return}
    let alive=true;
    setState(null);
    fetch(`/api/market/quote?symbol=${encodeURIComponent(symbol)}`).then(r=>r.json()).then(d=>{if(alive)setState(d)}).catch(()=>{if(alive)setState({live:false})});
    return ()=>{alive=false};
  },[symbol]);
  return state;
}

export function useLiveFx(from,to){
  const [state,setState]=useState(null);
  useEffect(()=>{
    let alive=true;
    fetch(`/api/market/fx?from=${from}&to=${to}`).then(r=>r.json()).then(d=>{if(alive)setState(d)}).catch(()=>{if(alive)setState({live:false})});
    return ()=>{alive=false};
  },[from,to]);
  return state;
}

export function MarketQuoteBadge({quote,symbol}){
  if(!quote)return <span className="market-badge pending">MARKET DATA · LOADING</span>;
  if(!quote.live)return <span className="market-badge stale">MARKET DATA · UNAVAILABLE · using dated snapshot</span>;
  const t=new Date(quote.asOf);
  return <span className="market-badge live">LIVE · {symbol} {quote.price.toFixed(2)} {quote.currency} · {t.toLocaleDateString(undefined,{month:"short",day:"numeric"})}</span>;
}
