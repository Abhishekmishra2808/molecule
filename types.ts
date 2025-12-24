
export enum AgentStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  WAITING = 'WAITING'
}

export enum AgentType {
  MASTER = 'Master Agent',
  MARKET = 'Market Agent',
  PATENT = 'Patent Agent',
  TRIALS = 'Trials Agent',
  EXIM = 'EXIM Agent',
  WEB = 'Web Agent',
  INTERNAL = 'Internal Agent',
  REPORT = 'Report Agent',
  COUNCIL_HEAD = 'Council Head',
  COUNCIL_CRITIC = 'Council Critic',
  COUNCIL_JUDGE = 'Council Judge',
  PRICING = 'Pricing Agent',
  FINANCIAL = 'Financial Agent',
  POLICY = 'Policy Agent',
  REGULATORY_UPDATES = 'Regulatory Updates Agent',
  SCIENTIFIC = 'Scientific Agent',
  BIOLOGY = 'Biology Agent',
  LITERATURE = 'Literature Agent',
  EPIDEMIOLOGY = 'Epidemiology Agent',
  FEASIBILITY = 'Feasibility Agent'
}

export interface AgentLog {
  id: string;
  agent: AgentType;
  message: string;
  timestamp: string;
  status: AgentStatus;
}

export interface JobStatus {
  jobId: string;
  progress: number; // 0 to 100
  agents: Record<string, AgentStatus>;
  logs: AgentLog[];
  isComplete: boolean;
  quotaError?: boolean;
  agentThoughts?: Record<string, string>;
}

export interface MarketData {
  indication: string;
  country: string;
  year: number;
  sales_mn_usd: number;
  cagr: number;
  top_competitors: string[];
  source: string;
  fetched_at: string;
}

export interface PatentData {
  molecule: string;
  patent_id: string;
  assignee: string;
  filing_date: string;
  expiry: string;
  claims: string[];
  summary: string; // Plain english scope
  patent_type: string; // New: 'Composition', 'Method', 'Formulation'
  remaining_years: number;
  source: string;
}

export interface TrialData {
  id: string;
  title: string; 
  phase: string;
  status: string;
  sponsor: string;
  enrollment?: number; // New: Number of patients
  conditions?: string[]; // New: Conditions being treated
}

export interface EximData {
  year: number;
  import_volume: number;
  export_volume: number;
  top_importers: string[];
}

export interface WebFinding {
  title: string;
  url: string;
  snippet: string;
  confidence: number;
}

export interface SwotData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CompetitorData {
  name: string;
  market_share_index: number; // 0-100 x-axis
  innovation_index: number; // 0-100 y-axis
  type: 'Leader' | 'Challenger' | 'Niche' | 'Established';
}

export interface GoToMarketData {
  launch_viability_score: number;
  market_entry_barriers: string[];
  recommended_strategy: string;
}

export interface IndicationExpansionData {
  potential_indications: string[];
  expansion_feasibility: number;
  regulatory_pathway: string;
}

export interface StructuredResult {
  summary: string;
  market: MarketData;
  patents: PatentData[];
  trials: TrialData[];
  exim: EximData[];
  web_findings: WebFinding[];
  whitespace_score: number;
  biosimilar_score: number;
  swot: SwotData;
  competitors: CompetitorData[];
  pdf_url?: string;
  go_to_market?: GoToMarketData;
  indication_expansion?: IndicationExpansionData;
}

export interface InternalFileData {
  filename: string;
  content: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface QueryPayload {
  query: string;
  region?: string;
  molecule?: string;
  generate_pdf: boolean;
  apiKey?: string;
  fileData?: InternalFileData[];
}