CREATE TABLE IF NOT EXISTS countries (
  id TEXT PRIMARY KEY, iso3 TEXT NOT NULL UNIQUE, name TEXT NOT NULL UNIQUE,
  region TEXT, latitude REAL, longitude REAL, summary TEXT
);
CREATE TABLE IF NOT EXISTS commodities (
  id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, color TEXT NOT NULL,
  default_unit TEXT, description TEXT
);
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, country_id TEXT REFERENCES countries(id),
  industry TEXT, ownership TEXT
);
CREATE TABLE IF NOT EXISTS company_profiles (
  company_id TEXT PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  headquarters TEXT, latitude REAL, longitude REAL, procurement_summary TEXT,
  geographic_exposure TEXT, vertical_integration TEXT, representative_plant_ids TEXT,
  source_id TEXT REFERENCES sources(id)
);
CREATE TABLE IF NOT EXISTS company_financial_metrics (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), period TEXT NOT NULL,
  metric TEXT NOT NULL, value REAL, unit TEXT, yoy_pct REAL, data_status TEXT NOT NULL,
  methodology TEXT, source_id TEXT REFERENCES sources(id)
);
CREATE TABLE IF NOT EXISTS company_finance_exposures (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), category TEXT NOT NULL,
  factor TEXT NOT NULL, exposure_direction TEXT, transmission TEXT, pricing_mechanism TEXT,
  disclosure_status TEXT, analyst_question TEXT, source_id TEXT REFERENCES sources(id)
);
CREATE TABLE IF NOT EXISTS company_investment_factors (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), factor_type TEXT NOT NULL,
  title TEXT NOT NULL, description TEXT NOT NULL, monitor_metric TEXT, horizon TEXT,
  source_id TEXT REFERENCES sources(id)
);
CREATE TABLE IF NOT EXISTS company_stock_pitches (
  company_id TEXT PRIMARY KEY REFERENCES companies(id), as_of_date TEXT NOT NULL,
  stance TEXT NOT NULL, conviction TEXT NOT NULL, horizon TEXT NOT NULL,
  headline TEXT NOT NULL, thesis TEXT NOT NULL, variant_perception TEXT NOT NULL,
  recommendation TEXT NOT NULL, upgrade_trigger TEXT NOT NULL, downgrade_trigger TEXT NOT NULL,
  source_id TEXT REFERENCES sources(id)
);
CREATE TABLE IF NOT EXISTS company_pitch_scenarios (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), scenario TEXT NOT NULL,
  probability_pct REAL NOT NULL, normalized_earnings REAL NOT NULL, pe_multiple REAL NOT NULL,
  fx REAL NOT NULL, implied_hkd REAL NOT NULL, narrative TEXT NOT NULL, evidence_required TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS company_pitch_kpis (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), label TEXT NOT NULL,
  current_value TEXT NOT NULL, positive_trigger TEXT NOT NULL, negative_trigger TEXT NOT NULL,
  frequency TEXT NOT NULL, source_id TEXT REFERENCES sources(id)
);
CREATE TABLE IF NOT EXISTS company_equity_research (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), broker TEXT NOT NULL,
  report_date TEXT NOT NULL, title TEXT NOT NULL, access_type TEXT NOT NULL, rating TEXT,
  target_price REAL, target_currency TEXT, current_price REAL, analyst TEXT,
  thesis TEXT NOT NULL, catalysts TEXT, risks TEXT, valuation_method TEXT,
  forecast_summary TEXT, atlas_readthrough TEXT NOT NULL, source_id TEXT REFERENCES sources(id)
);
CREATE TABLE IF NOT EXISTS data_center_evidence (
  id TEXT PRIMARY KEY, geography TEXT NOT NULL, theme TEXT NOT NULL, metric TEXT NOT NULL,
  value REAL, text_value TEXT, unit TEXT, period TEXT NOT NULL, data_status TEXT NOT NULL,
  finding TEXT NOT NULL, implication TEXT NOT NULL, source_id TEXT REFERENCES sources(id)
);
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, asset_type TEXT NOT NULL,
  country_id TEXT NOT NULL REFERENCES countries(id), company_id TEXT REFERENCES companies(id),
  commodity_id TEXT REFERENCES commodities(id), latitude REAL NOT NULL, longitude REAL NOT NULL,
  status TEXT NOT NULL, capacity_value REAL, capacity_unit TEXT, start_year INTEGER, description TEXT
);
CREATE TABLE IF NOT EXISTS trade_flows (
  id TEXT PRIMARY KEY, origin_country_id TEXT NOT NULL REFERENCES countries(id),
  destination_country_id TEXT NOT NULL REFERENCES countries(id),
  commodity_id TEXT NOT NULL REFERENCES commodities(id), year INTEGER NOT NULL,
  volume REAL NOT NULL, unit TEXT NOT NULL, value_usd REAL, hs_code TEXT,
  source_id TEXT REFERENCES sources(id)
);
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, publisher TEXT NOT NULL, url TEXT,
  publication_date TEXT, data_date TEXT, source_type TEXT, reliability TEXT,
  last_checked TEXT, notes TEXT
);
CREATE TABLE IF NOT EXISTS observations (
  id TEXT PRIMARY KEY, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
  metric TEXT NOT NULL, value REAL, text_value TEXT, unit TEXT, period TEXT NOT NULL,
  source_id TEXT REFERENCES sources(id), methodology TEXT,
  UNIQUE(entity_type, entity_id, metric, period, source_id)
);
CREATE INDEX IF NOT EXISTS idx_assets_country ON assets(country_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_flows_year_commodity ON trade_flows(year, commodity_id);
CREATE INDEX IF NOT EXISTS idx_observations_entity ON observations(entity_type, entity_id, metric);
CREATE TABLE IF NOT EXISTS observation_metadata (
  observation_id TEXT PRIMARY KEY REFERENCES observations(id) ON DELETE CASCADE,
  data_status TEXT NOT NULL CHECK(data_status IN ('reported','estimated','provisional','derived')),
  vintage TEXT, notes TEXT
);
CREATE TABLE IF NOT EXISTS regional_trade_flows (
  id TEXT PRIMARY KEY, origin_region TEXT NOT NULL, destination_region TEXT NOT NULL,
  commodity_id TEXT NOT NULL REFERENCES commodities(id), year INTEGER NOT NULL,
  volume REAL NOT NULL, unit TEXT NOT NULL, flow_type TEXT NOT NULL DEFAULT 'reported_exports',
  source_id TEXT REFERENCES sources(id), notes TEXT
);

-- Master-list extension: specialist records retain asset-specific fields while
-- sharing identity, geography, ownership and provenance through assets.
CREATE TABLE IF NOT EXISTS mine_details (
  asset_id TEXT PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,
  grade_value REAL, grade_unit TEXT, reserves_value REAL, reserves_unit TEXT,
  production_cost_value REAL, production_cost_currency TEXT,
  export_share_pct REAL, export_port_asset_id TEXT REFERENCES assets(id),
  rail_connection TEXT, main_destination_country_id TEXT REFERENCES countries(id)
);
CREATE TABLE IF NOT EXISTS steel_plant_details (
  asset_id TEXT PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,
  crude_steel_capacity_mtpa REAL, actual_production_mt REAL, bf_bof_capacity_mtpa REAL,
  eaf_capacity_mtpa REAL, dri_capacity_mtpa REAL, coke_capacity_mtpa REAL,
  sinter_capacity_mtpa REAL, product_mix TEXT, carbon_intensity_tco2_per_t REAL,
  nearest_port_asset_id TEXT REFERENCES assets(id), rail_connection TEXT
);
CREATE TABLE IF NOT EXISTS steel_plant_profiles (
  asset_id TEXT PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,
  production_route TEXT, iron_ore_source TEXT, coal_or_scrap_source TEXT,
  downstream_sectors TEXT, transition_project TEXT, source_id TEXT REFERENCES sources(id)
);
CREATE TABLE IF NOT EXISTS ev_plant_details (
  asset_id TEXT PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,
  production_capacity_units INTEGER, actual_production_units INTEGER,
  vehicle_models TEXT, powertrain_types TEXT, export_share_pct REAL,
  battery_supplier_company_id TEXT REFERENCES companies(id), battery_chemistry TEXT,
  localization_rate_pct REAL
);
CREATE TABLE IF NOT EXISTS battery_plant_details (
  asset_id TEXT PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,
  capacity_gwh REAL, actual_production_gwh REAL, chemistry TEXT, cell_format TEXT,
  cathode_supplier_company_id TEXT REFERENCES companies(id),
  anode_supplier_company_id TEXT REFERENCES companies(id)
);
CREATE TABLE IF NOT EXISTS port_details (
  asset_id TEXT PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,
  total_throughput_mt REAL, iron_ore_throughput_mt REAL, coal_throughput_mt REAL,
  container_throughput_teu REAL, annual_capacity_mt REAL, draft_m REAL,
  rail_connection TEXT, roro_capability INTEGER
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, definition TEXT,
  processing_stage TEXT, production_process TEXT, specification TEXT,
  applications TEXT, default_unit TEXT
);
CREATE TABLE IF NOT EXISTS transformations (
  id TEXT PRIMARY KEY, input_product_id TEXT NOT NULL REFERENCES products(id),
  output_product_id TEXT NOT NULL REFERENCES products(id), process_name TEXT NOT NULL,
  conversion_factor REAL, conversion_unit TEXT, energy_requirement TEXT, notes TEXT
);
CREATE TABLE IF NOT EXISTS entity_relationships (
  id TEXT PRIMARY KEY, subject_type TEXT NOT NULL, subject_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL, object_type TEXT NOT NULL, object_id TEXT NOT NULL,
  start_date TEXT, end_date TEXT, share_pct REAL, source_id TEXT REFERENCES sources(id), notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_relationship_subject ON entity_relationships(subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_relationship_object ON entity_relationships(object_type, object_id);

CREATE TABLE IF NOT EXISTS shipping_routes (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, origin_asset_id TEXT REFERENCES assets(id),
  destination_asset_id TEXT REFERENCES assets(id), commodity_id TEXT REFERENCES commodities(id),
  distance_nm REAL, transit_days REAL, freight_cost_value REAL, freight_cost_unit TEXT,
  vessel_class TEXT, annual_volume REAL, volume_unit TEXT, alternative_route_id TEXT REFERENCES shipping_routes(id)
);
CREATE TABLE IF NOT EXISTS shipping_route_metrics (
  id TEXT PRIMARY KEY, route_id TEXT NOT NULL REFERENCES shipping_routes(id) ON DELETE CASCADE,
  metric TEXT NOT NULL, year INTEGER NOT NULL, value REAL NOT NULL, unit TEXT NOT NULL,
  data_status TEXT NOT NULL CHECK(data_status IN ('reported','estimated','provisional','derived')),
  source_id TEXT REFERENCES sources(id), methodology TEXT,
  UNIQUE(route_id, metric, year, source_id)
);
CREATE INDEX IF NOT EXISTS idx_route_metrics_route ON shipping_route_metrics(route_id, year, metric);
CREATE TABLE IF NOT EXISTS shipping_route_profiles (
  route_id TEXT PRIMARY KEY REFERENCES shipping_routes(id) ON DELETE CASCADE,
  cargo_label TEXT NOT NULL, route_status TEXT NOT NULL,
  volume_status TEXT NOT NULL, methodology TEXT,
  source_id TEXT REFERENCES sources(id), color TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS shipping_route_waypoints (
  route_id TEXT REFERENCES shipping_routes(id) ON DELETE CASCADE,
  sequence_no INTEGER NOT NULL, latitude REAL NOT NULL, longitude REAL NOT NULL,
  label TEXT, PRIMARY KEY(route_id,sequence_no)
);
CREATE TABLE IF NOT EXISTS shipping_route_volume_estimates (
  route_id TEXT PRIMARY KEY REFERENCES shipping_routes(id) ON DELETE CASCADE,
  central_mtpa REAL, low_mtpa REAL, high_mtpa REAL,
  estimate_status TEXT NOT NULL, basis TEXT NOT NULL,
  source_id TEXT REFERENCES sources(id)
);
CREATE TABLE IF NOT EXISTS ship_types (
  id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, cargo_system TEXT NOT NULL,
  typical_capacity TEXT, primary_steel_input TEXT, major_builders TEXT,
  linked_trade TEXT, technology_complexity TEXT, definition TEXT NOT NULL,
  source_id TEXT REFERENCES sources(id), display_order INTEGER
);
CREATE TABLE IF NOT EXISTS shipbuilding_specializations (
  id TEXT PRIMARY KEY, country_id TEXT NOT NULL REFERENCES countries(id),
  ship_type_id TEXT NOT NULL REFERENCES ship_types(id), position_label TEXT NOT NULL,
  position_score INTEGER NOT NULL, evidence TEXT NOT NULL, period TEXT NOT NULL,
  data_status TEXT NOT NULL CHECK(data_status IN ('reported','estimated','provisional','derived','qualitative')),
  source_id TEXT REFERENCES sources(id), UNIQUE(country_id,ship_type_id,period,source_id)
);
CREATE TABLE IF NOT EXISTS steel_shipbuilding_links (
  id TEXT PRIMARY KEY,
  steel_company_id TEXT NOT NULL REFERENCES companies(id),
  shipbuilder_company_id TEXT REFERENCES companies(id),
  country_id TEXT REFERENCES countries(id),
  relationship_type TEXT NOT NULL,
  steel_product TEXT NOT NULL,
  application TEXT NOT NULL,
  evidence TEXT NOT NULL,
  period TEXT,
  data_status TEXT NOT NULL CHECK(data_status IN ('documented','supplier_capability','illustrative')),
  source_id TEXT REFERENCES sources(id)
);
CREATE TABLE IF NOT EXISTS steel_product_trade_mix (
  id TEXT PRIMARY KEY, country_id TEXT NOT NULL REFERENCES countries(id),
  direction TEXT NOT NULL CHECK(direction IN ('export','import')),
  product_name TEXT NOT NULL, year INTEGER NOT NULL, share_pct REAL NOT NULL,
  volume_mt REAL, data_status TEXT NOT NULL CHECK(data_status IN ('reported','estimated','provisional','derived')),
  source_id TEXT REFERENCES sources(id), methodology TEXT,
  UNIQUE(country_id, direction, product_name, year, source_id)
);
CREATE INDEX IF NOT EXISTS idx_steel_product_trade_mix_country ON steel_product_trade_mix(country_id, direction, year);
CREATE TABLE IF NOT EXISTS steel_product_trade_flows (
  id TEXT PRIMARY KEY, origin_country_id TEXT NOT NULL REFERENCES countries(id),
  destination_country_id TEXT NOT NULL REFERENCES countries(id), hs_code TEXT NOT NULL,
  product_name TEXT NOT NULL, year INTEGER NOT NULL, volume_mt REAL NOT NULL,
  value_usd_m REAL, data_status TEXT NOT NULL CHECK(data_status IN ('reported','estimated','provisional','derived')),
  source_id TEXT REFERENCES sources(id), methodology TEXT,
  UNIQUE(origin_country_id, destination_country_id, hs_code, year, source_id)
);
CREATE INDEX IF NOT EXISTS idx_steel_product_flows_product ON steel_product_trade_flows(hs_code, year);
CREATE TABLE IF NOT EXISTS chokepoints (
  id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, latitude REAL NOT NULL, longitude REAL NOT NULL,
  chokepoint_type TEXT, annual_volume REAL, volume_unit TEXT,
  diversion_distance_nm REAL, diversion_transit_days REAL, description TEXT
);
CREATE TABLE IF NOT EXISTS route_chokepoints (
  route_id TEXT REFERENCES shipping_routes(id) ON DELETE CASCADE,
  chokepoint_id TEXT REFERENCES chokepoints(id) ON DELETE CASCADE,
  sequence_no INTEGER NOT NULL, PRIMARY KEY(route_id, chokepoint_id)
);
CREATE TABLE IF NOT EXISTS route_disruption_scenarios (
  id TEXT PRIMARY KEY, chokepoint_id TEXT NOT NULL REFERENCES chokepoints(id) ON DELETE CASCADE,
  route_id TEXT NOT NULL REFERENCES shipping_routes(id) ON DELETE CASCADE,
  scenario_name TEXT NOT NULL, alternative_name TEXT NOT NULL,
  alternative_distance_nm REAL NOT NULL, added_distance_nm REAL NOT NULL,
  added_sailing_days REAL NOT NULL, assumed_speed_knots REAL NOT NULL,
  alternative_waypoints_json TEXT NOT NULL, impact_note TEXT NOT NULL,
  data_status TEXT NOT NULL CHECK(data_status IN ('reported','estimated','provisional','derived')),
  source_id TEXT REFERENCES sources(id), UNIQUE(chokepoint_id,route_id)
);

CREATE TABLE IF NOT EXISTS policies (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, country_id TEXT REFERENCES countries(id),
  region TEXT, policy_type TEXT NOT NULL, product_id TEXT REFERENCES products(id),
  commodity_id TEXT REFERENCES commodities(id), industry TEXT, announced_date TEXT,
  effective_date TEXT, expiry_date TEXT, tariff_pct REAL, quota_value REAL,
  quota_unit TEXT, subsidy_value REAL, subsidy_currency TEXT,
  domestic_content_rule TEXT, target TEXT, source_id TEXT REFERENCES sources(id), summary TEXT
);
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, event_type TEXT NOT NULL, event_date TEXT,
  status TEXT, commodity_id TEXT REFERENCES commodities(id), capacity_value REAL,
  capacity_unit TEXT, mechanism TEXT, winners TEXT, losers TEXT,
  price_impact TEXT, freight_impact TEXT, strategic_implication TEXT,
  research_url TEXT, source_id TEXT REFERENCES sources(id)
);
CREATE TABLE IF NOT EXISTS news_events (
  id TEXT PRIMARY KEY, cluster_key TEXT NOT NULL, headline TEXT NOT NULL,
  publisher TEXT NOT NULL, source_url TEXT NOT NULL UNIQUE,
  published_at TEXT NOT NULL, collected_at TEXT NOT NULL, last_verified_at TEXT,
  review_status TEXT NOT NULL DEFAULT 'candidate' CHECK(review_status IN ('candidate','reviewed','published','rejected')),
  evidence_status TEXT NOT NULL DEFAULT 'reported' CHECK(evidence_status IN ('reported','corroborated','observed')),
  event_type TEXT NOT NULL, severity TEXT NOT NULL CHECK(severity IN ('low','medium','high','critical')),
  materiality_score INTEGER NOT NULL, commodity_tags TEXT, country_tags TEXT, route_tags TEXT,
  source_tier INTEGER NOT NULL DEFAULT 3, source_rationale TEXT,
  latitude REAL, longitude REAL, location_label TEXT,
  reported_summary TEXT NOT NULL, summary_provenance TEXT NOT NULL DEFAULT 'summary pending review', observed_impact TEXT NOT NULL, analyst_inference TEXT NOT NULL,
  monitor_next TEXT, map_expires_at TEXT, active INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_news_events_brief ON news_events(active,review_status,published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_events_expiry ON news_events(map_expires_at);
CREATE TABLE IF NOT EXISTS concepts (
  id TEXT PRIMARY KEY, term TEXT NOT NULL UNIQUE, definition TEXT NOT NULL,
  why_it_matters TEXT, inputs TEXT, outputs TEXT, where_used TEXT,
  common_misconception TEXT, source_id TEXT REFERENCES sources(id)
);
CREATE TABLE IF NOT EXISTS concept_links (
  concept_id TEXT REFERENCES concepts(id) ON DELETE CASCADE,
  related_concept_id TEXT REFERENCES concepts(id) ON DELETE CASCADE,
  PRIMARY KEY(concept_id, related_concept_id)
);

CREATE TABLE IF NOT EXISTS metric_definitions (
  id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, formula TEXT NOT NULL,
  description TEXT NOT NULL, output_unit TEXT, required_inputs TEXT,
  calculation_status TEXT NOT NULL DEFAULT 'planned'
);
CREATE TABLE IF NOT EXISTS research_questions (
  id TEXT PRIMARY KEY, question TEXT NOT NULL UNIQUE, theme TEXT,
  rationale TEXT, status TEXT NOT NULL DEFAULT 'planned', display_order INTEGER
);
CREATE TABLE IF NOT EXISTS research_question_metrics (
  research_question_id TEXT REFERENCES research_questions(id) ON DELETE CASCADE,
  metric_definition_id TEXT REFERENCES metric_definitions(id) ON DELETE CASCADE,
  PRIMARY KEY(research_question_id, metric_definition_id)
);
CREATE TABLE IF NOT EXISTS research_answers (
  research_question_id TEXT PRIMARY KEY REFERENCES research_questions(id) ON DELETE CASCADE,
  verdict TEXT NOT NULL, answer_summary TEXT NOT NULL, mechanism TEXT,
  caveats TEXT, updated_at TEXT, source_ids TEXT
);
CREATE TABLE IF NOT EXISTS research_answer_metrics (
  id TEXT PRIMARY KEY,
  research_question_id TEXT NOT NULL REFERENCES research_questions(id) ON DELETE CASCADE,
  label TEXT NOT NULL, value REAL, text_value TEXT, unit TEXT, period TEXT,
  data_status TEXT, source_id TEXT REFERENCES sources(id), methodology TEXT,
  display_order INTEGER
);
