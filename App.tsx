
import React, { useState, useEffect, useRef } from 'react';
import { ApiService } from './services/api';
import { JobStatus, StructuredResult, AgentStatus, AgentType } from './types';
import { MarketChart, TrialsChart, EximChart, PatentTimelineChart } from './components/Charts';
import { LandingPage } from './components/LandingPage';
import { ResultCards, StrategyView } from './components/ResultCards';
import { 
  LayoutDashboard, Play, Upload, FileType, Download, Copy, 
  BrainCircuit, TrendingUp, Activity, Globe, FileText, FlaskConical, Container,
  CheckCircle2, Clock, Loader2, XCircle, Info, ExternalLink, ShieldCheck, Sparkles,
  ChevronLeft, Moon, Sun, Monitor, Building2, Users, FileBadge, Lightbulb
} from 'lucide-react';

export default function App() {
  // --- State ---
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [query, setQuery] = useState('What are the emerging opportunities in cardiovascular drug development in Asia?');
  const [region, setRegion] = useState('Asia');
  const [molecule, setMolecule] = useState('');
  const [generatePdf, setGeneratePdf] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [finalResult, setFinalResult] = useState<StructuredResult | null>(null);
  const [activeTab, setActiveTab] = useState('Market');
  const [activeLogTab, setActiveLogTab] = useState<'Agents' | 'System'>('Agents');

  // --- Logic ---

  // Dark Mode Toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Polling
  useEffect(() => {
    let pollInterval: any;
    if (currentJobId && (!jobStatus || !jobStatus.isComplete)) {
      pollInterval = setInterval(async () => {
        try {
          const status = await ApiService.getStatus(currentJobId);
          setJobStatus(status);
          if (status.isComplete) {
            clearInterval(pollInterval);
            fetchResult(currentJobId);
          }
        } catch (err) {
          console.error("Polling error", err);
          clearInterval(pollInterval);
        }
      }, 1000);
    }
    return () => clearInterval(pollInterval);
  }, [currentJobId, jobStatus?.isComplete]);

  const fetchResult = async (jobId: string) => {
    try {
      const result = await ApiService.getResult(jobId);
      setFinalResult(result);
    } catch (err) {
      console.error("Failed to fetch result", err);
    }
  };

  const handleRunOrchestration = async () => {
    setFinalResult(null);
    setJobStatus(null);
    try {
      const { job_id } = await ApiService.startQuery({
        query,
        region,
        molecule: molecule || undefined,
        generate_pdf: generatePdf
      });
      setCurrentJobId(job_id);
    } catch (err) {
      console.error("Failed to start query", err);
    }
  };

  const isProcessing = !!currentJobId && jobStatus && !jobStatus.isComplete;
  const isComplete = jobStatus?.isComplete && finalResult;

  // --- UI Components ---

  const StatusPill = ({ status }: { status: AgentStatus }) => {
    switch (status) {
      case AgentStatus.COMPLETED:
        return <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium border border-emerald-200 dark:border-emerald-800">Completed</span>;
      case AgentStatus.RUNNING:
        return <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-blue-200 dark:border-blue-800"><Loader2 className="w-3 h-3 animate-spin"/> Running</span>;
      case AgentStatus.FAILED:
        return <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-medium border border-red-200 dark:border-red-800">Failed</span>;
      case AgentStatus.WAITING:
        return <span className="text-[10px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium border border-slate-200 dark:border-slate-700">Pending</span>;
      default:
        return <span className="text-[10px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">Idle</span>;
    }
  };

  const AgentIcon = ({ type }: { type: string }) => {
    switch (type) {
      case AgentType.MASTER: return <BrainCircuit className="w-3.5 h-3.5" />;
      case AgentType.MARKET: return <TrendingUp className="w-3.5 h-3.5" />;
      case AgentType.PATENT: return <FileText className="w-3.5 h-3.5" />;
      case AgentType.TRIALS: return <FlaskConical className="w-3.5 h-3.5" />;
      case AgentType.EXIM: return <Container className="w-3.5 h-3.5" />;
      case AgentType.WEB: return <Globe className="w-3.5 h-3.5" />;
      case AgentType.REPORT: return <Activity className="w-3.5 h-3.5" />;
      default: return <BrainCircuit className="w-3.5 h-3.5" />;
    }
  };

  if (view === 'landing') {
    return (
      <LandingPage 
        onStart={() => setView('app')} 
        isDarkMode={darkMode} 
        toggleTheme={() => setDarkMode(!darkMode)} 
      />
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* --- Top Bar --- */}
      <header className={`border-b sticky top-0 z-20 transition-colors duration-300 ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
          {/* Brand */}
          <div className="flex items-center gap-4">
             <button onClick={() => setView('landing')} className={`p-1 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}>
               <ChevronLeft className="w-5 h-5" />
             </button>
            <div className="flex items-center gap-2">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600 dark:text-indigo-400">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
               <span className={`text-lg font-bold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                 molecule<span className="text-indigo-600 dark:text-indigo-400">X</span>
               </span>
            </div>
            <div className={`hidden md:flex h-5 w-px ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
            <span className={`hidden md:inline text-[10px] font-medium px-2 py-0.5 rounded ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                v2.5
            </span>
          </div>

          {/* Center pill (current query) */}
          <div className="hidden lg:flex max-w-2xl flex-1 justify-center px-4">
            <div className={`truncate rounded-full px-4 py-1.5 text-xs border max-w-full flex items-center gap-2 transition-colors ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span className="truncate max-w-[400px]">"{query}"</span>
            </div>
          </div>

          {/* Status + job */}
          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${darkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </span>
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-slate-800 text-indigo-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              title="Toggle Dark Mode"
            >
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
              JD
            </div>
          </div>
        </div>
      </header>

      {/* --- Main Grid --- */}
      <main className="mx-auto flex flex-col lg:flex-row max-w-[1600px] gap-6 px-4 py-6 lg:px-6">
        
        {/* --- Left: Setup --- */}
        <section className="w-full lg:w-80 flex-shrink-0 space-y-4">
          <div className={`rounded-2xl p-5 shadow-sm border sticky top-24 transition-colors duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>
            <h2 className={`text-sm font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              <LayoutDashboard className="w-4 h-4 text-indigo-500" />
              Research Setup
            </h2>

            {/* Step 1 */}
            <div className="mb-5 space-y-1.5">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                1 · Research Objective
              </p>
              <textarea
                className={`mt-1 h-32 w-full resize-none rounded-lg border px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all leading-relaxed ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 focus:bg-slate-800 focus:border-indigo-500 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:border-indigo-500 placeholder-slate-400'}`}
                placeholder="Ask a research question…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isProcessing}
              />
              <p className={`text-[10px] flex items-center gap-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <Info className="w-3 h-3" /> Mention geography & indication.
              </p>
            </div>

            {/* Step 2 */}
            <div className="mb-5 space-y-2">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                2 · Scope
              </p>
              <div className="flex gap-2">
                <select 
                  className={`w-1/2 rounded-lg border px-2 py-2 text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-600 focus:border-indigo-500'}`}
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  disabled={isProcessing}
                >
                  <option>India</option>
                  <option>Asia</option>
                  <option>Global</option>
                  <option>USA</option>
                  <option>Europe</option>
                </select>
                <input 
                  type="text"
                  placeholder="Molecule (Opt)"
                  className={`w-1/2 rounded-lg border px-2 py-2 text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 focus:border-indigo-500 placeholder-slate-500' : 'bg-white border-slate-200 text-slate-600 focus:border-indigo-500'}`}
                  value={molecule}
                  onChange={(e) => setMolecule(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Market', 'Clinical', 'IP', 'EXIM'].map(tag => (
                  <span
                    key={tag}
                    className={`rounded text-[10px] font-medium px-2 py-1 select-none ${darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Step 3 */}
            <div className="mb-6 space-y-2">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                3 · Context
              </p>
              <div className={`flex flex-col items-center justify-center rounded-lg border border-dashed px-3 py-4 text-center transition-colors cursor-pointer group ${darkMode ? 'border-slate-700 bg-slate-800/30 hover:bg-slate-800' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'}`}>
                <div className={`p-2 rounded-full shadow-sm mb-2 group-hover:scale-105 transition-transform ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                  <Upload className="w-4 h-4 text-indigo-500" />
                </div>
                <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Upload PDF / CSV
                </span>
                <span className={`mt-0.5 text-[9px] ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  Drag &amp; drop to add internal data
                </span>
              </div>
            </div>

            {/* Options + Run button */}
            <div className={`flex items-center gap-2 text-[11px] mb-4 select-none ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              <input 
                id="pdf" 
                type="checkbox" 
                className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                checked={generatePdf}
                onChange={(e) => setGeneratePdf(e.target.checked)}
                disabled={isProcessing}
              />
              <label htmlFor="pdf">Generate PDF report</label>
            </div>

            <button 
              onClick={handleRunOrchestration}
              disabled={isProcessing || !query.trim()}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-200/50 transition-all active:scale-[0.98] ${isProcessing || !query.trim() ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Orchestrating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Run Orchestration
                </>
              )}
            </button>
          </div>
        </section>

        {/* --- Right: Results + Agents --- */}
        <section className="flex-1 min-w-0 space-y-5">
          
          {/* Executive Summary & Top Cards using ResultCards */}
          <ResultCards result={finalResult} loading={isProcessing} />

          {/* Lower Grid: Insights + Agents */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            
            {/* Insights Tabs (span 2) */}
            <div className={`xl:col-span-2 rounded-2xl p-5 shadow-sm border min-h-[400px] transition-colors duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>
              {/* Tabs */}
              <div className={`mb-5 flex gap-1 border-b pb-1 text-xs overflow-x-auto ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                {['Market', 'Clinical', 'IP', 'EXIM', 'Strategy'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    disabled={!finalResult}
                    className={`rounded-t-lg px-4 py-2 font-medium transition-colors ${
                      activeTab === tab
                        ? `border-b-2 ${darkMode ? 'bg-slate-800 text-indigo-400 border-indigo-400' : 'bg-slate-50 text-indigo-600 border-indigo-600'}`
                        : `${darkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'} disabled:opacity-50 disabled:cursor-not-allowed`
                    }`}
                  >
                    {tab === 'Strategy' ? (
                        <span className="flex items-center gap-1"><Lightbulb className="w-3 h-3"/> {tab}</span>
                    ) : tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {!finalResult ? (
                 <div className={`flex items-center justify-center h-64 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`}>
                    <div className="text-center">
                       <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                       <span className="text-xs">Data visualization pending...</span>
                    </div>
                 </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full">
                  
                  {activeTab === 'Strategy' && (
                      <StrategyView 
                          swot={finalResult.swot} 
                          competitors={finalResult.competitors} 
                          isDarkMode={darkMode} 
                      />
                  )}

                  {activeTab === 'Market' && finalResult.market && (
                    <div className="space-y-4">
                      <div className={`rounded-xl border p-4 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                        <MarketChart data={finalResult.market} isDarkMode={darkMode} />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className={`rounded-xl p-4 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                          <p className={`text-[10px] uppercase font-semibold mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>Market Size</p>
                          <p className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>${finalResult.market.sales_mn_usd?.toLocaleString() ?? '-'}</p>
                          <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Mn USD ({finalResult.market.year})</span>
                        </div>
                        <div className={`rounded-xl p-4 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                          <p className={`text-[10px] uppercase font-semibold mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>CAGR</p>
                          <p className="text-2xl font-bold text-emerald-600">{((finalResult.market.cagr || 0)*100).toFixed(1)}%</p>
                          <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Growth Rate</span>
                        </div>
                        <div className={`rounded-xl p-4 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                          <p className={`text-[10px] uppercase font-semibold mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>Region</p>
                          <p className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{finalResult.market.country}</p>
                          <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{finalResult.market.indication}</span>
                        </div>
                      </div>
                      <div className={`rounded-xl p-4 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                        <p className={`text-xs uppercase font-semibold mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Key Competitors</p>
                        <div className="flex flex-wrap gap-2">
                          {finalResult.market.top_competitors?.map((c, i) => (
                            <span key={i} className={`border px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'Clinical' && finalResult.trials && (
                    <div className="grid gap-4 md:grid-cols-2">
                       <div className={`rounded-xl border p-4 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                          <TrialsChart data={finalResult.trials} isDarkMode={darkMode} />
                       </div>
                       <div className={`rounded-xl border overflow-hidden flex flex-col h-[380px] ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                          <div className={`p-3 border-b shrink-0 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                             <h4 className={`text-xs font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Recent Trials ({finalResult.trials.length})</h4>
                          </div>
                          <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {finalResult.trials.length === 0 ? (
                                <div className="p-4 text-center text-xs text-slate-500">No trials found.</div>
                            ) : (
                                finalResult.trials.slice(0,10).map((t,i) => (
                                  <a 
                                    key={i} 
                                    href={`https://clinicaltrials.gov/study/${t.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`block p-3 border-b text-xs group transition-colors ${darkMode ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-50 hover:bg-slate-50/50'}`}
                                  >
                                    <div className={`font-semibold mb-1 truncate flex items-center gap-1 ${darkMode ? 'text-slate-200 group-hover:text-indigo-400' : 'text-slate-800 group-hover:text-indigo-600'}`} title={t.title}>
                                      {t.title || t.id} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                       <span className={`text-[10px] font-mono px-1.5 rounded ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{t.id}</span>
                                       {t.sponsor && <span className={`text-[10px] truncate max-w-[120px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.sponsor}</span>}
                                    </div>
                                    {t.conditions && t.conditions.length > 0 && (
                                       <div className="flex flex-wrap gap-1 mb-2">
                                         {t.conditions.slice(0, 2).map((c, idx) => (
                                           <span key={idx} className={`px-1.5 py-0.5 rounded text-[9px] ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{c}</span>
                                         ))}
                                       </div>
                                    )}
                                    <div className="flex justify-between items-center mt-1">
                                      <span className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.phase}</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${t.status.includes('Recruit') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>{t.status}</span>
                                    </div>
                                  </a>
                                ))
                            )}
                          </div>
                       </div>
                    </div>
                  )}

                  {activeTab === 'IP' && finalResult.patents && (
                    <div className="space-y-4">
                       <div className={`rounded-xl border p-4 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                          <PatentTimelineChart data={finalResult.patents} isDarkMode={darkMode} />
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          {finalResult.patents.slice(0,4).map((p,i) => (
                             <a 
                               key={i} 
                               href={`https://patents.google.com/patent/${p.patent_id.replace(/\s/g, '')}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className={`block p-4 rounded-lg border hover:shadow-md transition-all group relative ${darkMode ? 'bg-slate-900 border-slate-700 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                             >
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                                </div>
                                <div className="flex justify-between items-start mb-2">
                                   <span className={`text-sm font-bold ${darkMode ? 'text-slate-200 group-hover:text-indigo-400' : 'text-slate-800 group-hover:text-indigo-600'}`}>{p.patent_id}</span>
                                   <span className={`text-[10px] font-medium px-2 py-1 rounded ${p.remaining_years < 3 ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                      {p.remaining_years.toFixed(1)}y left
                                   </span>
                                </div>
                                
                                {p.patent_type && (
                                   <div className="mb-2">
                                     <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${p.patent_type.toLowerCase().includes('composition') ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                       {p.patent_type}
                                     </span>
                                   </div>
                                )}
                                
                                <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{p.molecule}</p>
                                
                                {p.summary && (
                                  <p className={`text-[11px] leading-relaxed line-clamp-2 mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {p.summary}
                                  </p>
                                )}
                                
                                <div className={`text-[10px] mt-auto truncate flex items-center gap-1 pt-2 border-t ${darkMode ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-100'}`}>
                                   <Building2 className="w-3 h-3" />
                                   {p.assignee}
                                </div>
                             </a>
                          ))}
                       </div>
                    </div>
                  )}

                  {activeTab === 'EXIM' && finalResult.exim && (
                     <div className="space-y-4">
                        <div className={`rounded-xl border p-4 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                           <EximChart data={finalResult.exim} isDarkMode={darkMode} />
                        </div>
                        {finalResult.exim.length > 0 && (
                          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                             <h4 className={`text-xs font-semibold uppercase mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Top Importing Countries</h4>
                             <div className="flex gap-2 flex-wrap">
                                {finalResult.exim[finalResult.exim.length - 1].top_importers?.map((c,i) => (
                                   <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                      <Globe className="w-4 h-4 text-slate-400" />
                                      <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{c}</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                        )}
                     </div>
                  )}
                </div>
              )}
            </div>

            {/* Agents + Log */}
            <div className="space-y-4 flex flex-col h-full">
              {/* Agents / Log Tabs */}
              <div className={`rounded-2xl shadow-sm border overflow-hidden flex-1 flex flex-col transition-colors duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>
                <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'border-slate-800 bg-slate-950/30' : 'border-slate-100 bg-slate-50/50'}`}>
                  <div className="flex gap-1">
                     <button 
                       onClick={() => setActiveLogTab('Agents')}
                       className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeLogTab === 'Agents' ? `${darkMode ? 'bg-slate-800 text-slate-200 shadow-sm' : 'bg-white text-slate-800 shadow-sm'}` : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                     >
                       Agents
                     </button>
                     <button 
                       onClick={() => setActiveLogTab('System')}
                       className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeLogTab === 'System' ? `${darkMode ? 'bg-slate-800 text-slate-200 shadow-sm' : 'bg-white text-slate-800 shadow-sm'}` : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                     >
                       System Log
                     </button>
                  </div>
                  {currentJobId && (
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {currentJobId.slice(-4)}
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {activeLogTab === 'Agents' ? (
                     <div className="space-y-2">
                        {[AgentType.MASTER, AgentType.MARKET, AgentType.PATENT, AgentType.TRIALS, AgentType.WEB, AgentType.EXIM, AgentType.REPORT].map((agent) => {
                           const status = jobStatus?.agents[agent] || AgentStatus.IDLE;
                           return (
                             <div key={agent} className={`flex items-center justify-between p-2 rounded-lg border ${darkMode ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50/50'}`}>
                                <div className="flex items-center gap-2.5">
                                   <div className={`p-1.5 rounded-md ${status === AgentStatus.RUNNING ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : `${darkMode ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-500 shadow-sm'}`}`}>
                                      <AgentIcon type={agent} />
                                   </div>
                                   <span className={`text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{agent.replace(' Agent','')}</span>
                                </div>
                                <StatusPill status={status} />
                             </div>
                           );
                        })}
                     </div>
                  ) : (
                    <div className="space-y-2 font-mono text-[10px]">
                       {!jobStatus?.logs.length ? (
                          <div className={`italic text-center py-4 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>System ready.</div>
                       ) : (
                          jobStatus.logs.map((log) => (
                             <div key={log.id} className="flex gap-2">
                                <span className={`shrink-0 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{new Date(log.timestamp).toLocaleTimeString([],{hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}</span>
                                <div>
                                   <span className={`font-bold mr-1 ${log.agent === AgentType.MASTER ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>[{log.agent.replace(' Agent','')}]</span>
                                   <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>{log.message}</span>
                                </div>
                             </div>
                          ))
                       )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Sources Link */}
              {finalResult && finalResult.web_findings?.length > 0 && (
                <div className={`rounded-2xl p-4 shadow-sm border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                   <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                     <Globe className="w-3 h-3 text-teal-400" /> Top Sources
                   </h3>
                   <div className="space-y-2">
                      {finalResult.web_findings.slice(0,3).map((f,i) => (
                         <a key={i} href={f.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs hover:text-white group truncate">
                            <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-teal-400 flex-shrink-0" />
                            <span className="truncate">{f.title}</span>
                         </a>
                      ))}
                   </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
