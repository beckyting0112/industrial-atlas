import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { geoInterpolate, geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";

const WIDTH = 1100;
const HEIGHT = 610;
const countries = feature(world, world.objects.countries);
const projection = geoNaturalEarth1().fitExtent([[24, 20], [WIDTH - 24, HEIGHT - 20]], countries);
const path = geoPath(projection);

function flowPath(flow) {
  if(flow.waypoints?.length>1) return path({type:"LineString",coordinates:flow.waypoints.map(point=>[Number(point.longitude),Number(point.latitude)])});
  const interpolate = geoInterpolate(
    [Number(flow.origin_lng), Number(flow.origin_lat)],
    [Number(flow.destination_lng), Number(flow.destination_lat)]
  );
  return path({
    type: "LineString",
    coordinates: Array.from({ length: 31 }, (_, index) => interpolate(index / 30)),
  });
}

const normal = value => String(value||"").toLowerCase().replace(/[^a-z]/g,"");
const aliases = {unitedstatesofamerica:"unitedstates",russianfederation:"russia",republicofkorea:"southkorea"};
export const metricNames = {
  crude_steel_production:"Crude steel", global_iron_ore_production_share:"Global ore supply",
  iron_ore_import_dependency:"Ore import dependence", iron_ore_export_dependence:"Ore export dependence",
  iron_ore_production:"Iron ore production", iron_ore_imports:"Iron ore imports",
  iron_ore_exports:"Iron ore exports", china_trade_exposure:"China trade exposure",
  global_crude_steel_production_share:"Global steel share",
  oxygen_steel_share:"BOF production share", electric_steel_share:"EAF production share",
  apparent_steel_use:"Apparent steel use", ore_based_steel_proxy:"Pig iron / crude steel",
  steelmaking_capacity:"Operating steel capacity", steel_capacity_utilization_proxy:"Capacity utilization",
  bof_capacity_share:"BOF capacity share", eaf_capacity_share:"EAF capacity share",
  steel_exports:"Steel exports", steel_imports:"Steel imports", net_steel_exports:"Net steel exports",
  steel_export_intensity:"Steel export intensity", steel_import_dependence:"Steel import dependence",
  steel_capacity_concentration:"Published steel concentration (CRn)",
  global_shipbuilding_orderbook_share:"Global shipbuilding orderbook share",
  shipbuilding_orderbook_cgt:"Shipbuilding orderbook",
  global_shipyard_capacity_share:"Global shipyard capacity share",
  active_shipyards:"Active shipyards",
  global_shipbuilding_completion_share_gt:"Global ship completions share",
  alternative_fuel_orderbook_share:"Alternative-fuel orderbook share",
  alternative_fuel_delivery_specialization:"Alternative-fuel delivery specialization",
  global_nickel_mine_production_share:"Global nickel mine share",
  nickel_mine_production:"Nickel mine production",
  ev_sales:"EV sales",
  ev_sales_share:"EV sales penetration",
  global_ev_production_share:"Global EV production share",
  ev_exports:"EV exports",
  global_battery_cell_production_share:"Global battery cell production share",
  global_battery_cell_capacity_share:"Global battery manufacturing capacity share",
  global_cathode_active_material_production_share:"Global cathode material production share",
  global_anode_active_material_production_share:"Global anode material production share",
  representative_battery_assets:"Representative battery cases mapped",
};
export const metricWhy = {
  global_iron_ore_production_share:"Shows which countries can materially influence global ore supply.",
  iron_ore_production:"Measures the physical scale of a country's upstream mining system.",
  iron_ore_import_dependency:"Shows how exposed domestic industry is to foreign ore and shipping disruption.",
  iron_ore_export_dependence:"Shows how strongly a producer relies on overseas demand.",
  china_trade_exposure:"Reveals how much an exporter depends on the world's largest ore buyer.",
  crude_steel_production:"Shows the current operating scale of the national steel industry.",
  global_crude_steel_production_share:"Shows a country's weight in global steel supply and pricing.",
  steelmaking_capacity:"Measures installed industrial scale, including capacity that may not be fully used.",
  steel_capacity_utilization_proxy:"Indicates how tightly or loosely the production system is operating.",
  bof_capacity_share:"Signals dependence on iron ore, coke and integrated blast-furnace infrastructure.",
  eaf_capacity_share:"Signals the importance of scrap, DRI, electricity and flexible mini-mill production.",
  apparent_steel_use:"Approximates the scale of steel consumed by the domestic economy.",
  net_steel_exports:"Distinguishes structurally export-oriented systems from net importers.",
  steel_export_intensity:"Shows how much steel output depends on access to foreign markets.",
  steel_import_dependence:"Shows how much domestic demand is supplied from abroad.",
  ore_based_steel_proxy:"Indicates how strongly steel output is tied to primary iron rather than recycled metallics.",
  steel_capacity_concentration:"Shows how consolidated the national industry is and how much control leading firms hold.",
  global_shipbuilding_orderbook_share:"Shows where future commercial-vessel workload and production capability are concentrated.",
  shipbuilding_orderbook_cgt:"Measures future shipyard workload while adjusting for differences in vessel construction complexity.",
  global_shipyard_capacity_share:"Compares the physical scale of a country's active yard system with the global industry.",
  active_shipyards:"Shows the breadth of the operating yard network, though yard size and sophistication differ.",
  global_shipbuilding_completion_share_gt:"Shows realized production scale by gross tonnage rather than future ordered workload.",
  alternative_fuel_orderbook_share:"Shows who is capturing future demand for vessels capable of using lower-carbon fuels.",
  alternative_fuel_delivery_specialization:"Shows how strongly a country's delivered vessel mix is oriented toward alternative-fuel technology.",
  global_nickel_mine_production_share:"Shows how concentrated upstream nickel extraction is and which countries can influence supply.",
  nickel_mine_production:"Measures contained nickel output before refining and chemical conversion.",
  ev_sales:"Measures the operating scale of the domestic electric-car market.",
  ev_sales_share:"Shows how far electric cars have penetrated new vehicle demand.",
  global_ev_production_share:"Shows where EV manufacturing capability and supplier networks are concentrated.",
  ev_exports:"Shows how strongly domestic EV manufacturing depends on overseas markets.",
  global_battery_cell_production_share:"Shows control of the cell-manufacturing stage, where materials become a strategic manufactured component.",
  global_battery_cell_capacity_share:"Shows where installed cell-manufacturing capability is located; capacity is not the same as actual output.",
  global_cathode_active_material_production_share:"Shows concentration in cathode materials, including both nickel-bearing and LFP chemistries.",
  global_anode_active_material_production_share:"Shows concentration in the processed graphite and anode stage of the battery chain.",
  representative_battery_assets:"Shows atlas case-study coverage across countries, not the total number of national plants or market share.",
};
const metricLabel = metric => metric.metric==="steel_capacity_concentration"&&metric.text_value
  ? `Steel capacity concentration (${metric.text_value})`
  : metricNames[metric.metric]||metric.metric;
const formatMetric = metric => `${Number(metric.value).toLocaleString(undefined,{maximumFractionDigits:1})}${metric.unit==="%"?"%":` ${metric.unit}`}`;

export default function AtlasMap({ assets, flows, chokepoints=[], selectedChokepoint, onChokepointSelect=()=>{}, supplyLinks=[], companyHubs=[], countryProfiles=[], selected, onSelect, metric="global_iron_ore_production_share", industry="iron-ore", focus }) {
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [hovered, setHovered] = useState(null);
  const [hoveredRoute, setHoveredRoute] = useState(null);
  const drag = useRef(null);
  const profileByName=useMemo(()=>Object.fromEntries(countryProfiles.map(profile=>[normal(profile.name),profile])),[countryProfiles]);
  const metricValues=countryProfiles.map(p=>Number(p.metrics.find(m=>m.metric===metric)?.value)).filter(Number.isFinite);
  const metricMax=Math.max(...metricValues,1);
  const flowMaxByCargo=Object.fromEntries([...new Set(flows.map(f=>f.cargo_label||"default"))].map(cargo=>[cargo,Math.max(...flows.filter(f=>(f.cargo_label||"default")===cargo).map(f=>Number(f.central_mtpa||f.high_mtpa||0)),1)]));
  const hoverPriority=industry==="steel"?["steel_capacity_concentration","crude_steel_production","global_crude_steel_production_share","steelmaking_capacity","steel_capacity_utilization_proxy","net_steel_exports"]:industry==="shipbuilding"?["global_shipbuilding_orderbook_share","shipbuilding_orderbook_cgt","global_shipbuilding_completion_share_gt","alternative_fuel_orderbook_share","alternative_fuel_delivery_specialization","global_shipyard_capacity_share","active_shipyards"]:industry==="nickel"?["global_nickel_mine_production_share","nickel_mine_production"]:industry==="battery"?["global_battery_cell_capacity_share","global_battery_cell_production_share","global_cathode_active_material_production_share","global_anode_active_material_production_share","representative_battery_assets"]:industry==="ev"?["ev_sales","ev_sales_share","global_ev_production_share","ev_exports"]:["global_iron_ore_production_share","iron_ore_production","iron_ore_import_dependency","iron_ore_export_dependence","china_trade_exposure"];
  useEffect(()=>{
    if(focus===undefined)return;
    if(!focus){setView({scale:1,x:0,y:0});return;}
    const point=projection([focus.longitude,focus.latitude]);
    if(!point)return;
    const scale=focus.scale||2.4;
    setView({scale,x:WIDTH/2-point[0]*scale,y:HEIGHT/2-point[1]*scale});
  },[focus]);
  const countryPaths = countries.features.map((country, index) => {
    const key=aliases[normal(country.properties?.name)]||normal(country.properties?.name);
    const profile=profileByName[key];
    const mappedMetric=profile?.metrics.find(m=>m.metric===metric);
    const intensity=mappedMetric?Number(mappedMetric.value)/metricMax:null;
    return <path key={country.id || index} d={path(country)} className={`atlas-country ${profile?"has-profile":""}`}
      style={intensity!=null?{fill:`rgba(232,116,59,${.2+.7*Math.sqrt(intensity)})`}:undefined}
      onPointerMove={event=>{event.stopPropagation(); setHovered({profile,name:country.properties?.name,x:event.clientX,y:event.clientY});}}
      onPointerLeave={()=>setHovered(null)} onClick={()=>profile&&onSelect({...profile,entity_type:"country"})}/>;
  });

  const zoom = delta => setView(current => ({ ...current, scale: Math.min(5, Math.max(1, current.scale + delta)) }));
  const pointerDown = event => {
    drag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: view.x, y: view.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerMove = event => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    setView(current => ({ ...current, x: drag.current.x + event.clientX - drag.current.startX, y: drag.current.y + event.clientY - drag.current.startY }));
  };
  const pointerUp = event => {
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
  };

  return <div className="svg-atlas-shell">
    <svg
      className="svg-atlas"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="region"
      aria-label="Interactive world asset map"
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
      onWheel={event => { event.preventDefault(); zoom(event.deltaY < 0 ? .25 : -.25); }}
    >
      <defs>
        <radialGradient id="ocean-glow"><stop offset="0" stopColor="#10243a"/><stop offset="1" stopColor="#07111f"/></radialGradient>
        <filter id="asset-glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#ocean-glow)" />
      <g className="atlas-graticule" opacity=".35">
        {[-60,-30,0,30,60].map(lat => { const a=projection([-180,lat]), b=projection([180,lat]); return a&&b?<line key={lat} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}/>:null; })}
      </g>
      <g className="atlas-world" transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
        <g>{countryPaths}</g>
        <g className="atlas-flows">
          {flows.map(flow => {const max=flowMaxByCargo[flow.cargo_label||"default"]||1;const estimate=Number(flow.central_mtpa||flow.high_mtpa||0);const width=(flow.is_shipping_route?1.3+3.8*Math.sqrt(estimate/max):1.1+3.9*Math.sqrt(Number(flow.volume||0)/max))/Math.sqrt(view.scale);const d=flowPath(flow);return <g key={flow.id} className="route-group"><path d={d} className={flow.is_shipping_route?`shipping-route ${flow.volume_status?.replaceAll(" ","-")}`:""} stroke={flow.color || "#4fb6a8"} strokeWidth={width}/><path d={d} className="route-hit" strokeWidth={Math.max(12/view.scale,width+8/view.scale)} onPointerMove={event=>{event.stopPropagation();setHovered(null);setHoveredRoute({flow,x:Math.min(event.clientX+14,window.innerWidth-350),y:Math.min(event.clientY+14,window.innerHeight-245)})}} onPointerLeave={()=>setHoveredRoute(null)}><title>{flow.origin} → {flow.destination}</title></path></g>})}
        </g>
        <g className="atlas-supply-links">
          {supplyLinks.map(link=><path key={link.id} d={flowPath(link)} className={link.relationship_type} strokeWidth={(link.relationship_type==="served_by_port"?2.2:1.4)/Math.sqrt(view.scale)}><title>{link.origin} → {link.destination} · {link.relationship_type.replaceAll("_"," ")}</title></path>)}
        </g>
        <g className="atlas-chokepoints">{chokepoints.map(cp=>{const point=projection([Number(cp.longitude),Number(cp.latitude)]);if(!point)return null;return <g className={selectedChokepoint?.id===cp.id?"selected":""} key={cp.id} transform={`translate(${point[0]} ${point[1]})`} onPointerDown={event=>event.stopPropagation()} onClick={()=>onChokepointSelect(cp)}><circle r={(selectedChokepoint?.id===cp.id?5:3.2)/Math.sqrt(view.scale)}/><text x={6/Math.sqrt(view.scale)} y={-5/Math.sqrt(view.scale)} transform={`scale(${1/Math.sqrt(view.scale)})`}><tspan>{cp.name}</tspan>{cp.annual_volume!=null&&<tspan x={6} dy="1.15em">{cp.annual_volume} {cp.volume_unit}</tspan>}</text><title>{cp.name} · click to test disruption · {cp.description}</title></g>})}</g>
        <g className="atlas-assets">
          {assets.map(asset => {
            const point = projection([Number(asset.longitude), Number(asset.latitude)]);
            if (!point) return null;
            const active = selected?.id === asset.id;
            const plantRadius=asset.asset_type==="steel_plant"?Math.min(10,5.5+Math.sqrt(Number(asset.crude_steel_capacity_mtpa||asset.capacity_value||0))*.7):5.5;
            return <g key={asset.id} transform={`translate(${point[0]} ${point[1]})`} className="asset-marker" onPointerDown={event => event.stopPropagation()} onClick={() => onSelect(asset)}>
              {active && <circle r={11 / Math.sqrt(view.scale)} fill="none" stroke="#fff" strokeWidth={1.4 / view.scale}/>} 
              <circle r={(active ? plantRadius+1.5 : plantRadius) / Math.sqrt(view.scale)} fill={asset.color || "#4fb6a8"} stroke="#f2f7fb" strokeWidth={1 / view.scale} filter="url(#asset-glow)"/>
              <title>{asset.name} · {asset.country}</title>
            </g>;
          })}
        </g>
        <g className="atlas-company-hubs">
          {companyHubs.map(company=>{const point=projection([Number(company.longitude),Number(company.latitude)]);if(!point)return null;const active=selected?.entity_type==="company"&&selected.id===company.id;return <g key={company.id} transform={`translate(${point[0]} ${point[1]})`} onPointerDown={event=>event.stopPropagation()} onClick={()=>onSelect(company)}><rect x={-7/Math.sqrt(view.scale)} y={-7/Math.sqrt(view.scale)} width={14/Math.sqrt(view.scale)} height={14/Math.sqrt(view.scale)} rx={2} className={active?"active":""}/><title>{company.name} · company hub</title></g>})}
        </g>
      </g>
    </svg>
    {hovered&&<div className="country-hover" style={{left:hovered.x+14,top:hovered.y+14}}>
      <span>{hovered.profile?"COUNTRY INDUSTRIAL SIGNATURE":"PROFILE NOT YET POPULATED"}</span><h3>{hovered.name}</h3>
      {hovered.profile?<>{[hovered.profile.metrics.find(m=>m.metric===metric),...hoverPriority.filter(id=>id!==metric).map(id=>hovered.profile.metrics.find(m=>m.metric===id))].filter(Boolean).slice(0,5).map(m=><div key={m.id}><small>{metricLabel(m)}</small><b>{formatMetric(m)}</b><em>{m.period}</em></div>)}
      {metricWhy[metric]&&<p className="metric-importance"><strong>Why it matters:</strong> {metricWhy[metric]}</p>}
      {hovered.profile.top_exports[0]&&<p>Top mapped destination: <strong>{hovered.profile.top_exports[0].destination}</strong> · {hovered.profile.top_exports[0].share_pct.toFixed(0)}%</p>}
      </>:<p>This is a visible data gap, not a zero.</p>}
    </div>}
    {hoveredRoute&&<div className="route-hover" style={{left:hoveredRoute.x,top:hoveredRoute.y}}><span>MARITIME ROUTE · {hoveredRoute.flow.route_status}</span><h3>{hoveredRoute.flow.origin} → {hoveredRoute.flow.destination}</h3><strong style={{color:hoveredRoute.flow.color}}>{hoveredRoute.flow.cargo_label}</strong><div><small>ANNUAL TONNAGE ESTIMATE</small><b>{hoveredRoute.flow.central_mtpa!=null?`≈ ${Number(hoveredRoute.flow.central_mtpa).toFixed(1)} Mt/year`:hoveredRoute.flow.high_mtpa!=null?`≤ ${Number(hoveredRoute.flow.high_mtpa).toFixed(1)} Mt/year`:`Not defensibly allocated`}</b><em>{hoveredRoute.flow.estimate_status}</em></div><dl><dt>Vessel</dt><dd>{hoveredRoute.flow.vessel_class}</dd><dt>Route</dt><dd>{Number(hoveredRoute.flow.distance_nm).toLocaleString()} nm · ≈ {Number(hoveredRoute.flow.transit_days).toFixed(1)} days</dd><dt>Path</dt><dd>{hoveredRoute.flow.waypoints?.map(w=>w.label).filter((x,i,a)=>x&&i>0&&i<a.length-1).join(" · ")||"Direct geodesic"}</dd></dl><p>{hoveredRoute.flow.estimate_basis}</p></div>}
    {flows.some(f=>f.is_shipping_route)?<div className="route-legend"><span>ALL ROUTES · WIDTH NORMALIZED WITHIN CARGO</span>{[...new Map(flows.filter(f=>!f.is_diversion).map(f=>[f.cargo_label,f.color])).entries()].map(([name,color])=><small key={name}><i style={{background:color}}/>{name}</small>)}{flows.some(f=>f.is_diversion)&&<small><i style={{background:"#f1c36e"}}/>Modeled diversion</small>}<em>Dashed = proxy, upper bound or unallocated volume</em></div>:supplyLinks.some(l=>l.relationship_type==="documented_shipbuilding_link")?<div className="company-network-legend"><span>SELECTED COMPANY NETWORK</span><small><i/>Documented steel–shipbuilding relationship</small><em>Line connects the corporate hub to a representative group yard; it is not a measured shipment.</em></div>:<div className="map-legend"><span>{metricNames[metric]||"No country indicator"}</span><div><i/><i/><i/><i/></div><small>Lower</small><small>Higher · latest country value</small></div>}
    <div className="svg-map-controls">
      <button aria-label="Zoom in" onClick={() => zoom(.4)}><Plus size={16}/></button>
      <button aria-label="Zoom out" onClick={() => zoom(-.4)}><Minus size={16}/></button>
      <button aria-label="Reset map" onClick={() => setView({scale:1,x:0,y:0})}><RotateCcw size={14}/></button>
    </div>
  </div>;
}
